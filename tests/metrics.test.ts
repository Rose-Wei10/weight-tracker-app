import {
  average,
  bmi,
  calorieEstimate,
  csv,
  dailyWeights,
  dayDistance,
  displayWeight,
  goalProgress,
  inRange,
  localDate,
  movingAverage,
  nutrition,
  nutritionDays,
  shiftDate,
  toKg,
} from "../shared/metrics";
import {
  aiRequestSchema,
  aiResultSchema,
  dateSchema,
  foodSchema,
  profileSchema,
  weightSchema,
  type Weight,
} from "../shared/schemas";
const w = (date: string, weight: number, id = date): Weight => ({
  date,
  weight,
  id,
});
test("local date uses calendar components", () =>
  expect(localDate(new Date(2026, 0, 1, 23, 59))).toBe("2026-01-01"));
test("date shifting crosses leap day and DST without fractional days", () => {
  expect(shiftDate("2024-03-01", -1)).toBe("2024-02-29");
  expect(dayDistance("2026-03-07", "2026-03-09")).toBe(2);
});
test.each(["2026-02-30", "2026-13-01", "2026-1-1", "bad"])(
  "invalid calendar date %s rejected",
  (date) => expect(dateSchema.safeParse(date).success).toBe(false),
);
test("deduplication is deterministic and does not mutate records", () => {
  const rows = [w("2026-10-21", 70, "z"), w("2026-10-21", 71, "a")];
  expect(dailyWeights(rows)[0].weight).toBe(70);
  expect(rows).toHaveLength(2);
});
test("ranges exclude future entries and do not substitute stale data", () =>
  expect(
    inRange([w("2026-01-01", 70), w("2026-10-22", 71)], 7, "2026-10-21"),
  ).toEqual([]));
test("moving average includes calendar days, not last seven records", () => {
  const values = movingAverage([
    w("2026-01-01", 100),
    w("2026-01-08", 70),
    w("2026-01-09", 72),
  ]);
  expect(values.map((v) => v.weight)).toEqual([100, 70, 71]);
});
test.each([
  [80, 75, 70, 0.5],
  [60, 65, 70, 0.5],
  [70, 70, 70, 1],
  [70, 72, 70, 0],
  [80, 90, 70, 0],
  [80, 60, 70, 1],
])(
  "goal progress handles direction and maintenance",
  (start, current, goal, expected) =>
    expect(goalProgress(start, current, goal)).toBe(expected),
);
test("kg/lb roundtrip", () =>
  expect(toKg(220.46226218, "imperial")).toBeCloseTo(100));
test("display imperial weight", () =>
  expect(displayWeight(100, "imperial")).toBe("220.5"));
test("BMI calculation", () => expect(bmi(70, 175)).toBeCloseTo(22.857));
test("maintenance does not force deficit", () =>
  expect(calorieEstimate(70, 175, 30, "female", 1.2, "maintain")).toEqual({
    tdee: 1779,
    target: 1779,
  }));
test("gain is a positive adjustment", () =>
  expect(
    calorieEstimate(70, 175, 30, "female", 1.2, "gain").target,
  ).toBeGreaterThan(1777));
test.each([17, 101, NaN])("calorie estimator rejects unsupported ages", (age) =>
  expect(() => calorieEstimate(70, 175, age, "female", 1.2, "lose")).toThrow(),
);
test("empty average is unknown", () => expect(average([])).toBeNull());
test("nutrition sums total portions without multiplying twice", () =>
  expect(
    nutrition([{ calories: 140, protein: 12, carbs: 1, fat: 10 }]),
  ).toEqual({ calories: 140, protein: 12, carbs: 1, fat: 10 }));
test("unlogged nutrition days remain marked missing", () =>
  expect(nutritionDays([], 7, "2026-10-21").every((d) => !d.logged)).toBe(
    true,
  ));
test("CSV quotes text and neutralizes formula injection", () => {
  expect(csv([['=HYPERLINK("bad")', "line,one"]])).toContain(
    `"'=HYPERLINK(""bad"")"`,
  );
});
test("weight validation rejects non-finite and negative values", () => {
  expect(
    weightSchema.safeParse({ weight: Infinity, date: "2026-10-21" }).success,
  ).toBe(false);
  expect(
    weightSchema.safeParse({ weight: -1, date: "2026-10-21" }).success,
  ).toBe(false);
});
test("food schema rejects negative macros and zero quantities", () =>
  expect(
    foodSchema.safeParse({
      name: "Egg",
      calories: 70,
      protein: -1,
      carbs: 0,
      fat: 4,
      quantity: 0,
      meal: "snack",
      source: "ai",
      date: "2026-10-21",
    }).success,
  ).toBe(false));
test("profile schema rejects unsafe target", () =>
  expect(
    profileSchema.safeParse({
      height: 175,
      weight: 70,
      age: 30,
      gender: "female",
      activity: 1.2,
      intent: "lose",
      target: 500,
      tdee: 1777,
    }).success,
  ).toBe(false));
test("photo mode requires image and other modes reject image", () => {
  expect(aiRequestSchema.safeParse({ mode: "photo", text: "" }).success).toBe(
    false,
  );
  expect(
    aiRequestSchema.safeParse({
      mode: "meal",
      text: "meal",
      image: "data:image/jpeg;base64,YQ==",
    }).success,
  ).toBe(false);
});
test("AI schema rejects incomplete free text responses", () =>
  expect(
    aiResultSchema.safeParse({
      answer: "about 500 calories",
      items: [{ name: "Meal" }],
    }).success,
  ).toBe(false));

test("loss estimates below adult screening threshold require individual guidance", () =>
  expect(() => calorieEstimate(45, 175, 30, "female", 1.2, "lose")).toThrow());
test("maintenance remains available without prescribing a loss target", () =>
  expect(
    calorieEstimate(45, 175, 30, "female", 1.2, "maintain").target,
  ).toBeGreaterThanOrEqual(1200));
