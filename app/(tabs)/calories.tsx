import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { useCopy } from "../../context/LanguageContext";
import {
  Button,
  Card,
  Confirm,
  Copy,
  Field,
  Meter,
  Screen,
  layout,
} from "../../components/Wellness";
import FoodEditor from "../../components/FoodEditor";
import DataStatus from "../../components/DataStatus";
import { FOOD_DB } from "../../constants/food";
import { nutrition } from "../../shared/metrics";
import type { FoodInput } from "../../shared/schemas";
import { deleteFood, deleteTemplate } from "../../services/records";
export default function Diary() {
  const { foods, templates, settings, today } = useApp(),
    x = useCopy();
  const [selectedDate, setSelectedDate] = useState(today),
    [search, setSearch] = useState(""),
    [draft, setDraft] = useState<FoodInput>(),
    [editId, setEditId] = useState<string>();
  const entries = foods.filter((f) => f.date === selectedDate),
    total = nutrition(entries),
    target = settings.profile?.target;
  const frequent = Array.from(
    new Map(
      [...foods]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((f) => [f.name, f]),
    ).values(),
  )
    .sort(
      (a, b) =>
        foods.filter((f) => f.name === b.name).length -
        foods.filter((f) => f.name === a.name).length,
    )
    .slice(0, 5);
  const open = (value: FoodInput, id?: string) => {
    setDraft({ ...value, date: selectedDate });
    setEditId(id);
  };
  return (
    <Screen
      title={x("Food diary", "饮食日记")}
      eyebrow={x("NOURISH, WITHOUT JUDGMENT", "均衡饮食，从容记录")}
      subtitle={x(
        "Your meals, your portions, your rhythm.",
        "你的饮食，你的节奏。",
      )}
    >
      <DataStatus />
      <Field
        label={x("Diary date · YYYY-MM-DD", "记录日期 · YYYY-MM-DD")}
        value={selectedDate}
        onChangeText={setSelectedDate}
      />
      <Card tinted>
        <Copy kind="label">{x("DAILY INTAKE", "每日摄入")}</Copy>
        <View style={layout.row}>
          <Copy kind="number">{Math.round(total.calories)}</Copy>
          <Copy kind="muted">kcal</Copy>
        </View>
        <Meter
          value={target ? total.calories / target : 0}
          label={
            target
              ? `${Math.round(target - total.calories)} ${x("kcal remaining", "千卡剩余")}`
              : x(
                  "Set an optional calorie budget in Profile",
                  "可在个人资料设置热量目标",
                )
          }
        />
        <Copy>
          {x("Protein", "蛋白质")} {Math.round(total.protein)}g ·{" "}
          {x("Carbs", "碳水")} {Math.round(total.carbs)}g · {x("Fat", "脂肪")}{" "}
          {Math.round(total.fat)}g
        </Copy>
        {entries.some((f) => !f.macrosKnown) && (
          <Copy kind="muted">
            {x(
              "Some older entries have unknown macros; totals are incomplete.",
              "部分旧记录缺少营养数据，总量可能不完整。",
            )}
          </Copy>
        )}
      </Card>
      <View style={layout.row}>
        <Button
          title={x("+ Custom food", "+ 自定义食物")}
          onPress={() =>
            open({
              name: "",
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              quantity: 1,
              date: selectedDate,
              meal: "snack",
              source: "manual",
            })
          }
        />
        <Button
          title={x("Describe / photograph meal", "描述 / 拍摄餐食")}
          secondary
          onPress={() => router.push("/assistant")}
        />
      </View>
      <Card>
        <Copy kind="heading">{x("Find a familiar food", "查找常见食物")}</Copy>
        <Field
          label={x(
            "Search starter foods or saved meals",
            "搜索基础食物或已保存餐食",
          )}
          value={search}
          onChangeText={setSearch}
        />
        <Copy kind="muted">
          {x(
            "Starter portions are approximate references, not verified branded products. Check package labels and adjust.",
            "基础份量为近似参考，并非经核实的品牌食品。请核对标签并调整。",
          )}
        </Copy>
        {FOOD_DB.filter((f) =>
          f.name.toLowerCase().includes(search.toLowerCase()),
        ).map((f) => (
          <Button
            key={f.name}
            title={`${f.name} · ${f.unit} · ${f.calories} kcal`}
            secondary
            onPress={() =>
              open({
                ...f,
                quantity: 1,
                date: selectedDate,
                meal: "snack",
                source: "reference",
              })
            }
          />
        ))}
      </Card>
      {frequent.length > 0 && (
        <Card>
          <Copy kind="heading">{x("Your frequent foods", "常吃的食物")}</Copy>
          {frequent.map((f) => (
            <Button
              key={f.id}
              title={`${f.name} · ${f.calories} kcal`}
              secondary
              onPress={() => open(f)}
            />
          ))}
        </Card>
      )}
      {templates.length > 0 && (
        <Card>
          <Copy kind="heading">
            {x("Favorites & meal templates", "常用食物与餐食模板")}
          </Copy>
          {templates
            .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
            .map((t) => (
              <View key={t.id} style={{ gap: 8 }}>
                <Button
                  title={`${t.name} · ${t.calories} kcal`}
                  secondary
                  onPress={() => open(t)}
                />
                <Confirm
                  title={x("Remove saved meal", "删除模板")}
                  onConfirm={() => deleteTemplate(t.id)}
                />
              </View>
            ))}
        </Card>
      )}
      {draft && (
        <FoodEditor
          key={`${editId || "new"}-${draft.name}`}
          initial={draft}
          existingId={editId}
          onDone={() => {
            setDraft(undefined);
            setEditId(undefined);
          }}
        />
      )}
      {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal, i) => (
        <Card key={meal}>
          <Copy kind="heading">
            {x(
              ["Breakfast", "Lunch", "Dinner", "Snacks"][i],
              ["早餐", "午餐", "晚餐", "加餐"][i],
            )}
          </Copy>
          {!entries.some((f) => f.meal === meal) && (
            <Copy kind="muted">
              {x("Nothing logged here yet.", "暂无记录。")}
            </Copy>
          )}
          {entries
            .filter((f) => f.meal === meal)
            .map((f) => (
              <View key={f.id} style={{ gap: 9 }}>
                <View style={layout.spread}>
                  <Copy style={{ flex: 1 }}>
                    {f.name} × {f.quantity}
                  </Copy>
                  <Copy>{Math.round(f.calories)} kcal</Copy>
                </View>
                <Copy kind="muted">
                  {f.source === "ai"
                    ? x(
                        "AI estimate · confirmed by you",
                        "AI 估算 · 已由你确认",
                      )
                    : f.source === "reference"
                      ? x("Approximate reference", "近似参考")
                      : x("Entered by you", "手动输入")}
                </Copy>
                <View style={layout.row}>
                  <Button
                    title={x("Edit", "编辑")}
                    secondary
                    onPress={() => open(f, f.id)}
                  />
                  <Confirm
                    title={x("Delete food", "删除食物")}
                    onConfirm={() => deleteFood(f.id)}
                  />
                </View>
              </View>
            ))}
        </Card>
      ))}
    </Screen>
  );
}
