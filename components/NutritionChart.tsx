import { useState } from "react";
import { ScrollView, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useCopy } from "../context/LanguageContext";
import type { Food } from "../shared/schemas";
import { average, inRange, nutrition } from "../shared/metrics";
import { Choices, Copy, usePalette } from "./Wellness";
export default function NutritionChart({
  foods,
  end,
}: {
  foods: Food[];
  end: string;
}) {
  const x = useCopy(),
    c = usePalette();
  const [range, setRange] = useState("30"),
    [metric, setMetric] = useState<"calories" | "protein" | "carbs" | "fat">(
      "calories",
    ),
    [width, setWidth] = useState(300),
    [selected, setSelected] = useState("");
  const records = inRange(foods, Number(range), end),
    dates = [...new Set(records.map((f) => f.date))].sort(),
    values = dates.map(
      (date) => nutrition(records.filter((f) => f.date === date))[metric],
    );
  return (
    <View
      style={{ gap: 12 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Choices
        value={range}
        onChange={(v) => {
          setRange(v);
          setSelected("");
        }}
        options={["7", "30", "90", "0"].map((value) => ({
          value,
          label: value === "0" ? x("All", "全部") : `${value}${x("d", "天")}`,
        }))}
      />
      <Choices
        value={metric}
        onChange={(v) => {
          setMetric(v);
          setSelected("");
        }}
        options={[
          { value: "calories", label: x("Calories", "热量") },
          { value: "protein", label: x("Protein", "蛋白质") },
          { value: "carbs", label: x("Carbs", "碳水") },
          { value: "fat", label: x("Fat", "脂肪") },
        ]}
      />
      {dates.length > 0 ? (
        <>
          <Copy kind="muted">
            {x("Mean per logged day", "每个记录日平均值")} ·{" "}
            {Math.round(average(values)!)}{" "}
            {metric === "calories" ? "kcal" : "g"}
          </Copy>
          <ScrollView horizontal>
            <LineChart
              width={Math.max(
                width,
                dates.length > 90 ? dates.length * 5 : width,
              )}
              height={210}
              data={{
                labels: dates.map((date, i) =>
                  i % Math.max(1, Math.ceil(dates.length / 5)) === 0
                    ? date.slice(5)
                    : "",
                ),
                datasets: [{ data: values }],
              }}
              chartConfig={{
                backgroundGradientFrom: c.surface,
                backgroundGradientTo: c.surface,
                color: () => c.accent,
                labelColor: () => c.muted,
                decimalPlaces: 0,
                propsForDots: { r: "3" },
                propsForBackgroundLines: {
                  stroke: c.border,
                  strokeDasharray: "0",
                  strokeWidth: 1,
                },
              }}
              withVerticalLines={false}
              withShadow={false}
              withOuterLines={false}
              onDataPointClick={({ index, value }) =>
                setSelected(
                  `${dates[index]} · ${Math.round(value)} ${metric === "calories" ? "kcal" : "g"}`,
                )
              }
            />
          </ScrollView>
          <Copy accessibilityLiveRegion="polite" kind="muted">
            {selected ||
              x(
                "Only recorded days are plotted. Partial diaries and unknown macros limit these totals.",
                "仅显示有记录的日期。未完整记录或缺失营养数据会影响统计。",
              )}
          </Copy>
        </>
      ) : (
        <Copy kind="muted">
          {x("No nutrition records in this range.", "此时段暂无饮食记录。")}
        </Copy>
      )}
    </View>
  );
}
