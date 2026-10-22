import type { Food, Weight } from "./schemas";

export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function shiftDate(date: string, offset: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
export const dayDistance = (a: string, b: string) =>
  Math.round(
    (Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000,
  );
export function dailyWeights(weights: Weight[]) {
  const map = new Map<string, Weight>();
  [...weights]
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((w) => {
      if (Number.isFinite(w.weight)) map.set(w.date, w);
    });
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}
export function inRange<T extends { date: string }>(
  entries: T[],
  days: number,
  end = localDate(),
) {
  const start = days === 0 ? "0000-01-01" : shiftDate(end, 1 - days);
  return entries.filter((e) => e.date >= start && e.date <= end);
}
export const average = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
export function movingAverage(weights: Weight[]) {
  const daily = dailyWeights(weights);
  return daily.map((entry) => ({
    ...entry,
    weight: average(inRange(daily, 7, entry.date).map((w) => w.weight))!,
  }));
}
export function goalProgress(start: number, current: number, goal: number) {
  if (start === goal) return current === goal ? 1 : 0;
  return Math.max(0, Math.min(1, (current - start) / (goal - start)));
}
export const toKg = (value: number, units: string) =>
  units === "imperial" ? value / 2.2046226218 : value;
export const displayWeight = (value: number, units = "metric") =>
  (units === "imperial" ? value * 2.2046226218 : value).toFixed(1);
export const bmi = (weight: number, height: number) =>
  weight / (height / 100) ** 2;
export function calorieEstimate(
  weight: number,
  height: number,
  age: number,
  gender: "female" | "male",
  activity: number,
  intent: "maintain" | "lose" | "gain",
) {
  if (
    ![weight, height, age, activity].every(Number.isFinite) ||
    age < 18 ||
    age > 100 ||
    weight < 20 ||
    weight > 500 ||
    height < 100 ||
    height > 250 ||
    ![1.2, 1.375, 1.55, 1.725].includes(activity)
  )
    throw new Error("Check your adult profile values");
  const tdee = Math.round(
    (10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161)) *
      activity,
  );
  return {
    tdee,
    target: Math.max(
      1200,
      Math.round(
        tdee * (intent === "lose" ? 0.9 : intent === "gain" ? 1.1 : 1),
      ),
    ),
  };
}
export function nutrition(
  foods: Pick<Food, "calories" | "protein" | "carbs" | "fat">[],
) {
  return foods.reduce(
    (total, f) => ({
      calories: total.calories + f.calories,
      protein: total.protein + f.protein,
      carbs: total.carbs + f.carbs,
      fat: total.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
export function nutritionDays(foods: Food[], days: number, end = localDate()) {
  return Array.from({ length: days }, (_, i) => {
    const date = shiftDate(end, i - days + 1);
    const entries = foods.filter((f) => f.date === date);
    return { date, ...nutrition(entries), logged: entries.length > 0 };
  });
}
export function csv(rows: (string | number | undefined)[][]) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value ?? "");
            if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
            return '"' + text.replace(/"/g, '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
