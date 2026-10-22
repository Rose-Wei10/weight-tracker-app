import { useState } from "react";
import { ScrollView, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useCopy } from "../context/LanguageContext";
import { Copy, Choices, usePalette } from "./Wellness";
import {
  dailyWeights,
  displayWeight,
  inRange,
  movingAverage,
} from "../shared/metrics";
import type { Weight } from "../shared/schemas";
export default function WeightChart({
  history,
  units = "metric",
  end,
}: {
  history: Weight[];
  units?: string;
  end: string;
}) {
  const [range, setRange] = useState("30"),
    [selected, setSelected] = useState<string>(""),
    [width, setWidth] = useState(300);
  const c = usePalette(),
    x = useCopy();
  const daily = dailyWeights(history),
    entries = inRange(daily, Number(range), end),
    averages = inRange(movingAverage(daily), Number(range), end);
  const value = (w: number) => Number(displayWeight(w, units));
  const chartWidth = Math.max(width, entries.length * 22);
  return (
    <View
      style={{ gap: 14 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Choices
        value={range}
        onChange={(v) => {
          setRange(v);
          setSelected("");
        }}
        options={["7", "30", "90", "0"].map((v) => ({
          value: v,
          label: v === "0" ? x("All", "全部") : `${v}${x("d", "天")}`,
        }))}
      />
      {entries.length ? (
        <>
          <Copy kind="muted">
            {entries[0].date} — {entries.at(-1)!.date}
          </Copy>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <LineChart
              width={chartWidth}
              height={220}
              data={{
                labels: entries.map((e, i) =>
                  i % Math.max(1, Math.ceil(entries.length / 5)) === 0
                    ? e.date.slice(5)
                    : "",
                ),
                datasets: [
                  {
                    data: entries.map((e) => value(e.weight)),
                    color: () => c.primary,
                    strokeWidth: 3,
                  },
                  {
                    data: averages.map((e) => value(e.weight)),
                    color: () => c.accent,
                    strokeWidth: 2,
                    withDots: false,
                  },
                ],
                legend: [x("Weight", "体重"), x("7-day mean", "7日均值")],
              }}
              chartConfig={{
                backgroundGradientFrom: c.surface,
                backgroundGradientTo: c.surface,
                decimalPlaces: 1,
                color: () => c.primary,
                labelColor: () => c.muted,
                propsForDots: { r: "4" },
              }}
              withOuterLines={false}
              withShadow={false}
              onDataPointClick={({ index, value: v }) =>
                setSelected(
                  `${entries[index].date} · ${v.toFixed(1)} ${units === "imperial" ? "lb" : "kg"}`,
                )
              }
            />
          </ScrollView>
          <Copy accessibilityLiveRegion="polite" kind="muted">
            {selected ||
              x(
                "Tap a point to inspect. Missing days are not zero.",
                "点击数据点查看。未记录日期不计为零。",
              )}
          </Copy>
        </>
      ) : (
        <Copy kind="muted">
          {x("No entries in this range.", "此时间范围内暂无记录。")}
        </Copy>
      )}
    </View>
  );
}
