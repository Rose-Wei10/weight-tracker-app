import { router } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { useCopy } from "../../context/LanguageContext";
import {
  Button,
  Card,
  Copy,
  Meter,
  Screen,
  layout,
  usePalette,
} from "../../components/Wellness";
import DataStatus from "../../components/DataStatus";
import WeightChart from "../../components/WeightChart";
import {
  average,
  dailyWeights,
  displayWeight,
  goalProgress,
  inRange,
  nutrition,
} from "../../shared/metrics";
export default function Home() {
  const { user, settings, weights, foods, today, ready } = useApp(),
    x = useCopy(),
    c = usePalette();
  const daily = dailyWeights(weights),
    current = daily.at(-1),
    start = daily[0],
    goal = Number(settings.goal),
    units = settings.units || "metric",
    unit = units === "imperial" ? "lb" : "kg";
  const total = nutrition(foods.filter((f) => f.date === today)),
    target = settings.profile?.target,
    week = inRange(daily, 7, today),
    lastWeek = inRange(
      daily,
      7,
      new Date(Date.parse(`${today}T12:00:00Z`) - 7 * 86400000)
        .toISOString()
        .slice(0, 10),
    );
  const mean = average(week.map((w) => w.weight)),
    previous = average(lastWeek.map((w) => w.weight));
  const change = current && start ? current.weight - start.weight : null;
  return (
    <Screen
      title={x("A little care, every day.", "每天，关爱自己一点。")}
      eyebrow="FORMA / DAILY WELLNESS"
      subtitle={`${today} · ${x("Welcome back", "欢迎回来")}${user?.displayName ? `, ${user.displayName}` : ""}`}
    >
      <DataStatus />
      {ready && !settings.onboardingComplete && (
        <Card tinted>
          <Copy kind="heading">
            {x("Make this space yours", "打造你的健康空间")}
          </Copy>
          <Copy>
            {x(
              "Set a maintenance, gain, or loss goal at your own pace.",
              "按自己的节奏，设置维持、增重或减重目标。",
            )}
          </Copy>
          <Button
            title={x("Set up your goals", "设置目标")}
            onPress={() => router.push("/account")}
          />
        </Card>
      )}
      <Card>
        <View style={layout.spread}>
          <Copy kind="label">{x("YOUR WEIGHT", "当前体重")}</Copy>
          <Ionicons name="leaf-outline" size={24} color={c.primary} />
        </View>
        <View style={layout.row}>
          <Copy kind="number">
            {current ? displayWeight(current.weight, units) : "—"}
          </Copy>
          <Copy kind="muted">{unit}</Copy>
        </View>
        <View style={layout.grid}>
          <View style={layout.grow}>
            <Copy kind="muted">{x("Goal", "目标")}</Copy>
            <Copy kind="heading">
              {goal ? `${displayWeight(goal, units)} ${unit}` : "—"}
            </Copy>
          </View>
          <View style={layout.grow}>
            <Copy kind="muted">{x("Total change", "累计变化")}</Copy>
            <Copy kind="heading">
              {change !== null
                ? `${change > 0 ? "+" : ""}${displayWeight(change, units)} ${unit}`
                : "—"}
            </Copy>
          </View>
        </View>
        {current && start && goal > 0 && (
          <Meter
            label={x("Progress from your first entry", "从首次记录开始的进度")}
            value={goalProgress(start.weight, current.weight, goal)}
          />
        )}
        <Button
          title={x("+ Log weight", "+ 记录体重")}
          secondary
          onPress={() => router.push("/progress")}
        />
      </Card>
      <Card>
        <View style={layout.spread}>
          <Copy kind="heading">{x("Today’s nourishment", "今日营养")}</Copy>
          <Ionicons name="restaurant-outline" size={21} color={c.primary} />
        </View>
        <View style={layout.row}>
          <Copy kind="number">{Math.round(total.calories)}</Copy>
          <Copy kind="muted">{x("kcal logged", "千卡已记录")}</Copy>
        </View>
        <Meter
          value={target ? total.calories / target : 0}
          label={
            target
              ? `${Math.round(target - total.calories)} ${x("kcal remaining · estimated budget", "千卡剩余 · 估算目标")} ${target}`
              : x(
                  "Set an estimated budget in Profile",
                  "在个人资料中设置估算目标",
                )
          }
        />
        <View style={layout.grid}>
          {[
            ["Protein", "蛋白质", total.protein, 0.25 / 4],
            ["Carbs", "碳水", total.carbs, 0.45 / 4],
            ["Fat", "脂肪", total.fat, 0.3 / 9],
          ].map(([en, zh, value, factor]) => (
            <View style={{ flex: 1, minWidth: 80 }} key={String(en)}>
              <Meter
                value={target ? Number(value) / (target * Number(factor)) : 0}
                label={`${x(String(en), String(zh))} ${Math.round(Number(value))}g`}
              />
            </View>
          ))}
        </View>
        <Copy kind="muted">
          {x(
            "Macro guides use 25% protein, 45% carbs, 30% fat. Older entries may have unknown macros.",
            "宏量参考比例为蛋白质25%、碳水45%、脂肪30%。旧记录可能缺少营养数据。",
          )}
        </Copy>
        <Button
          title={x("+ Add a meal", "+ 添加饮食")}
          onPress={() => router.push("/calories")}
        />
      </Card>
      <Card>
        <Copy kind="heading">
          {x("See the bigger picture", "关注长期趋势")}
        </Copy>
        <WeightChart history={weights} units={units} end={today} />
        <Copy kind="muted">
          {mean !== null && previous !== null
            ? `${x("Weekly mean change", "周均变化")}: ${displayWeight(mean - previous, units)} ${unit}`
            : x(
                "A few more check-ins will reveal your weekly trend.",
                "更多记录将帮助你发现每周趋势。",
              )}
        </Copy>
      </Card>
      <Card tinted>
        <Copy kind="label">{x("A GENTLE REMINDER", "温馨提醒")}</Copy>
        <Copy kind="heading">
          {x("Consistency has room for real life.", "坚持，也给生活留些空间。")}
        </Copy>
        <Copy>
          {x(
            "Daily changes are normal. Use trends to learn, and take breaks when tracking stops feeling helpful.",
            "每日波动很正常。通过趋势了解自己；记录带来压力时，可以暂停。",
          )}
        </Copy>
        <Copy kind="muted">
          {x(
            "Activity: not connected. No steps or exercise calories are inferred.",
            "运动：尚未连接，不推测步数或运动消耗。",
          )}
        </Copy>
      </Card>
    </Screen>
  );
}
