import { useState } from "react";
import { View } from "react-native";
import { Card, Choices, Copy, Field, Button, Notice, layout } from "./Wellness";
import { useCopy, useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import { foodSchema, type FoodInput } from "../shared/schemas";
import { saveFoods, saveTemplate } from "../services/records";
import { friendlyError } from "../services/errors";
export default function FoodEditor({
  initial,
  onDone,
  existingId,
  onSaved,
}: {
  initial: FoodInput;
  onDone: () => void;
  existingId?: string;
  onSaved?: () => void;
}) {
  const x = useCopy(),
    { lang } = useLanguage(),
    { ready } = useApp();
  const [name, setName] = useState(initial.name),
    [date, setDate] = useState(initial.date),
    [meal, setMeal] = useState(initial.meal),
    [quantity, setQuantity] = useState(String(initial.quantity)),
    [values, setValues] = useState({
      calories: String(initial.calories),
      protein: String(initial.protein),
      carbs: String(initial.carbs),
      fat: String(initial.fat),
    }),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const numeric = ["calories", "protein", "carbs", "fat"] as const;
  const input = () =>
    foodSchema.parse({
      ...initial,
      name,
      date,
      meal,
      quantity: Number(quantity),
      ...Object.fromEntries(numeric.map((k) => [k, Number(values[k])])),
    });
  const submit = async (template = false) => {
    setBusy(true);
    setMessage("");
    try {
      const value = input();
      if (template) {
        await saveTemplate(value);
        setMessage(x("Saved to your meals.", "已保存到常用餐食。"));
      } else {
        await saveFoods([value], existingId);
        onSaved?.();
        onDone();
      }
    } catch (e) {
      setMessage(friendlyError(e, lang === "zh"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <Copy kind="heading">
        {initial.source === "ai"
          ? x("Review AI estimate", "核对 AI 估算")
          : existingId
            ? x("Edit food", "编辑食物")
            : x("Review & log", "核对并记录")}
      </Copy>
      <Notice
        text={
          initial.source === "ai"
            ? x(
                "Approximate. Check each portion and nutrient before saving.",
                "仅为估算。保存前请核对每份食物和营养。",
              )
            : x(
                "Enter totals for the entire portion below. Use a food label when available.",
                "请填写整份食物的营养总量。可优先使用食品标签数据。",
              )
        }
      />
      <Field
        label={x("Food or meal name", "食物或餐食名称")}
        value={name}
        onChangeText={setName}
      />
      <Field
        label={x("Date · YYYY-MM-DD", "日期 · YYYY-MM-DD")}
        value={date}
        onChangeText={setDate}
      />
      <Choices
        value={meal}
        onChange={setMeal}
        options={[
          { value: "breakfast", label: x("Breakfast", "早餐") },
          { value: "lunch", label: x("Lunch", "午餐") },
          { value: "dinner", label: x("Dinner", "晚餐") },
          { value: "snack", label: x("Snack", "加餐") },
        ]}
      />
      <Field
        label={x(
          "Servings · changing scales all totals",
          "份数 · 更改后按比例调整总量",
        )}
        value={quantity}
        keyboardType="decimal-pad"
        onChangeText={(v) => {
          const old = Number(quantity),
            next = Number(v);
          if (old > 0 && next > 0)
            setValues(
              (prev) =>
                Object.fromEntries(
                  numeric.map((k) => [
                    k,
                    String(
                      Math.round(((Number(prev[k]) * next) / old) * 10) / 10,
                    ),
                  ]),
                ) as typeof values,
            );
          setQuantity(v);
        }}
      />
      <View style={layout.grid}>
        {numeric.map((k, i) => (
          <View key={k} style={layout.grow}>
            <Field
              label={x(
                ["Calories · kcal", "Protein · g", "Carbs · g", "Fat · g"][i],
                ["热量 · 千卡", "蛋白质 · 克", "碳水 · 克", "脂肪 · 克"][i],
              )}
              value={values[k]}
              keyboardType="decimal-pad"
              onChangeText={(v) => setValues({ ...values, [k]: v })}
            />
          </View>
        ))}
      </View>
      {message && <Notice text={message} />}
      <Button
        title={x("Confirm & save to diary", "确认并保存到饮食日记")}
        disabled={!ready}
        busy={busy}
        onPress={() => void submit()}
      />
      <Button
        title={x(
          "Save as favorite / meal template",
          "保存为常用食物 / 餐食模板",
        )}
        secondary
        disabled={busy || !ready}
        onPress={() => void submit(true)}
      />
      <Button
        title={x("Cancel", "取消")}
        secondary
        disabled={busy}
        onPress={onDone}
      />
    </Card>
  );
}
