import { useState } from "react";
import { View } from "react-native";
import { useApp } from "../../context/AppContext";
import { useCopy, useLanguage } from "../../context/LanguageContext";
import {
  Button,
  Card,
  Confirm,
  Copy,
  Field,
  Screen,
  layout,
  Notice,
} from "../../components/Wellness";
import WeightChart from "../../components/WeightChart";
import NutritionChart from "../../components/NutritionChart";
import DataStatus from "../../components/DataStatus";
import {
  average,
  bmi,
  dailyWeights,
  displayWeight,
  inRange,
  nutritionDays,
  shiftDate,
  toKg,
} from "../../shared/metrics";
import { deleteWeight, saveWeight } from "../../services/records";
import { friendlyError } from "../../services/errors";
export default function Progress() {
  const { weights, foods, settings, today, ready } = useApp(),
    x = useCopy(),
    { lang } = useLanguage();
  const [date, setDate] = useState(today),
    [weight, setWeight] = useState(""),
    [waist, setWaist] = useState(""),
    [editId, setEditId] = useState<string>(),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [month, setMonth] = useState(today.slice(0, 7));
  const units = settings.units || "metric",
    unit = units === "imperial" ? "lb" : "kg",
    daily = dailyWeights(weights),
    week = inRange(daily, 7, today),
    monthEntries = weights.filter((w) => w.date.startsWith(month)),
    days = nutritionDays(foods, 7, today),
    logged = days.filter((d) => d.logged),
    current = daily.at(-1);
  const last30 = inRange(daily, 30, today),
    monthlyFood = foods.filter((f) => f.date.startsWith(month));
  const submit = async () => {
    setBusy(true);
    setMessage("");
    try {
      if (!editId && weights.some((w) => w.date === date))
        throw Object.assign(new Error(), { code: "already-exists" });
      await saveWeight(
        {
          weight: toKg(Number(weight), units),
          date,
          ...(waist
            ? { waist: Number(waist) * (units === "imperial" ? 2.54 : 1) }
            : {}),
        },
        editId,
      );
      setWeight("");
      setWaist("");
      setEditId(undefined);
      setMessage(x("Weight saved.", "体重已保存。"));
    } catch (e) {
      setMessage(friendlyError(e, lang === "zh"));
    } finally {
      setBusy(false);
    }
  };
  const first = `${month}-01`,
    count = new Date(
      Number(month.slice(0, 4)),
      Number(month.slice(5, 7)),
      0,
    ).getDate(),
    offset = new Date(`${first}T12:00:00`).getDay();
  return (
    <Screen
      title={x("Your progress", "你的进度")}
      eyebrow={x("SMALL STEPS, REAL PATTERNS", "点滴记录，发现规律")}
      subtitle={x(
        "Trends tell a kinder story than a single day.",
        "长期趋势比单日数据更有意义。",
      )}
    >
      <DataStatus />
      <Card>
        <Copy kind="heading">{x("Weight over time", "体重趋势")}</Copy>
        <WeightChart history={weights} units={units} end={today} />
      </Card>
      <View style={layout.grid}>
        <Card style={layout.grow}>
          <Copy kind="label">{x("7-DAY MEAN", "7日均值")}</Copy>
          <Copy kind="heading">
            {week.length
              ? `${displayWeight(average(week.map((w) => w.weight))!, units)} ${unit}`
              : "—"}
          </Copy>
          <Copy kind="muted">
            {week.length} {x("recorded days", "个记录日")}
          </Copy>
        </Card>
        <Card style={layout.grow}>
          <Copy kind="label">{x("30-DAY CONSISTENCY", "30日记录率")}</Copy>
          <Copy kind="heading">{Math.round((last30.length / 30) * 100)}%</Copy>
          <Copy kind="muted">
            {last30.length}/30 {x("days with weight entries", "天记录体重")}
          </Copy>
        </Card>
      </View>
      <Card>
        <Copy kind="heading">
          {editId
            ? x("Edit check-in", "编辑记录")
            : x("A new check-in", "新增记录")}
        </Copy>
        <Field
          label={x("Date · YYYY-MM-DD", "日期 · YYYY-MM-DD")}
          value={date}
          editable={!editId}
          onChangeText={setDate}
        />
        <Field
          label={`${x("Weight", "体重")} · ${unit}`}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
        />
        <Field
          label={`${x("Waist · optional", "腰围 · 选填")} (${units === "imperial" ? "in" : "cm"})`}
          value={waist}
          onChangeText={setWaist}
          keyboardType="decimal-pad"
        />
        {message && <Notice text={message} />}
        <Button
          title={x("Save check-in", "保存记录")}
          busy={busy}
          disabled={!ready}
          onPress={() => void submit()}
        />
        {editId && (
          <Button
            title={x("Cancel edit", "取消编辑")}
            secondary
            onPress={() => {
              setEditId(undefined);
              setWeight("");
              setWaist("");
              setDate(today);
            }}
          />
        )}
      </Card>
      <Card>
        <Copy kind="heading">{x("Your weight calendar", "体重日历")}</Copy>
        <View style={layout.spread}>
          <Button
            title="‹"
            secondary
            onPress={() => setMonth(shiftDate(first, -1).slice(0, 7))}
          />
          <Copy>{month}</Copy>
          <Button
            title="›"
            secondary
            disabled={month >= today.slice(0, 7)}
            onPress={() => setMonth(shiftDate(first, count).slice(0, 7))}
          />
        </View>
        <Copy kind="muted">
          {x(
            "Sunday → Saturday · select a logged day to edit",
            "周日 → 周六 · 选择有记录的日期进行编辑",
          )}
        </Copy>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from({ length: offset }, (_, i) => (
            <View key={`gap${i}`} style={{ width: "14.285%" }} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const d = `${month}-${String(i + 1).padStart(2, "0")}`,
              entry = daily.find((w) => w.date === d);
            return (
              <View key={d} style={{ width: "14.285%", padding: 1 }}>
                <Button
                  title={`${i + 1}${entry ? " •" : ""}`}
                  secondary={!entry}
                  onPress={() => {
                    setDate(d);
                    setEditId(entry?.id);
                    setWeight(entry ? displayWeight(entry.weight, units) : "");
                    setWaist(
                      entry?.waist
                        ? String(
                            entry.waist / (units === "imperial" ? 2.54 : 1),
                          )
                        : "",
                    );
                    setMessage("");
                  }}
                  disabled={d > today}
                />
              </View>
            );
          })}
        </View>
        <Copy kind="muted">
          {x("This month", "本月")}: {monthEntries.length}{" "}
          {x("entries", "条记录")} ·{" "}
          {new Set(monthlyFood.map((f) => f.date)).size}{" "}
          {x("nutrition days", "天饮食记录")}
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">{x("Recent check-ins", "本月记录")}</Copy>
        {!monthEntries.length && (
          <Copy kind="muted">
            {x("No check-ins this month.", "本月暂无记录。")}
          </Copy>
        )}
        {[...monthEntries]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((w) => (
            <View key={w.id} style={{ gap: 8 }}>
              <Copy>
                {w.date} · {displayWeight(w.weight, units)} {unit}
              </Copy>
              <View style={layout.row}>
                <Button
                  title={x("Edit", "编辑")}
                  secondary
                  onPress={() => {
                    setEditId(w.id);
                    setDate(w.date);
                    setWeight(displayWeight(w.weight, units));
                    setWaist(
                      w.waist
                        ? String(w.waist / (units === "imperial" ? 2.54 : 1))
                        : "",
                    );
                  }}
                />
                <Confirm
                  title={x("Delete entry", "删除记录")}
                  onConfirm={() => deleteWeight(w.id, w.date)}
                />
              </View>
            </View>
          ))}
      </Card>
      <Card>
        <Copy kind="heading">{x("Nutrition trends", "营养趋势")}</Copy>
        <NutritionChart foods={foods} end={today} />
      </Card>
      <Card>
        <Copy kind="heading">{x("Nutrition · last 7 days", "近7天营养")}</Copy>
        <Copy>
          {logged.length
            ? `${Math.round(average(logged.map((d) => d.calories))!)} ${x("kcal / logged day", "千卡 / 记录日")}`
            : x("No meals logged in this period.", "此时段暂无饮食记录。")}
        </Copy>
        {days.map((d) => (
          <View key={d.date} style={layout.spread}>
            <Copy kind="muted">{d.date.slice(5)}</Copy>
            <Copy>
              {d.logged
                ? `${Math.round(d.calories)} kcal · P ${Math.round(d.protein)} / C ${Math.round(d.carbs)} / F ${Math.round(d.fat)} g`
                : "—"}
            </Copy>
          </View>
        ))}
        <Copy kind="muted">
          {x(
            "Averages exclude unlogged days. Partial diaries may underestimate intake; missing macros remain unknown.",
            "均值不含未记录日。未完整记录可能低估摄入；缺失的营养数据视为未知。",
          )}
        </Copy>
      </Card>
      {current && settings.profile?.height && (
        <Card>
          <Copy kind="heading">
            BMI · {bmi(current.weight, settings.profile.height).toFixed(1)}
          </Copy>
          <Copy kind="muted">
            {x(
              "A rough adult screening ratio, not a diagnosis or body-composition measure. It is not appropriate during pregnancy, for children, or as a standalone assessment.",
              "仅为成人粗略筛查比例，不是诊断或身体成分测量；不适用于孕期、儿童或独立健康评估。",
            )}
          </Copy>
        </Card>
      )}
    </Screen>
  );
}
