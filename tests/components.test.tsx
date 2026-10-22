import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Button, Meter } from "../components/Wellness";
import FoodEditor from "../components/FoodEditor";
import { saveFoods, saveTemplate } from "../services/records";
jest.mock("../context/AppContext", () => ({ useApp: () => ({ ready: true }) }));
jest.mock("../services/records", () => ({
  saveFoods: jest.fn(async () => {}),
  saveTemplate: jest.fn(async () => {}),
}));
const initial = {
  name: "Egg",
  date: "2026-10-21",
  meal: "breakfast" as const,
  source: "ai" as const,
  calories: 72,
  protein: 6.3,
  carbs: 0.4,
  fat: 4.8,
  quantity: 1,
};
beforeEach(() => jest.clearAllMocks());
test("disabled action cannot submit", () => {
  const press = jest.fn();
  const ui = render(<Button title="Save" disabled onPress={press} />);
  fireEvent.press(ui.getByRole("button"));
  expect(press).not.toHaveBeenCalled();
});
test("progress is bounded for assistive technology", () => {
  const ui = render(<Meter value={2} label="Goal" />);
  expect(ui.getByRole("progressbar").props.accessibilityValue.now).toBe(100);
});
test("AI meal is not saved until explicit confirmation", async () => {
  const done = jest.fn();
  const ui = render(<FoodEditor initial={initial} onDone={done} />);
  expect(saveFoods).not.toHaveBeenCalled();
  fireEvent.changeText(
    ui.getByLabelText("Servings · changing scales all totals"),
    "2",
  );
  fireEvent.press(ui.getByText("Confirm & save to diary"));
  await waitFor(() =>
    expect(saveFoods).toHaveBeenCalledWith(
      [expect.objectContaining({ calories: 144, quantity: 2, protein: 12.6 })],
      undefined,
    ),
  );
  expect(done).toHaveBeenCalled();
});
test("cancel never writes to diary", () => {
  const done = jest.fn();
  const ui = render(<FoodEditor initial={initial} onDone={done} />);
  fireEvent.press(ui.getByText("Cancel"));
  expect(done).toHaveBeenCalled();
  expect(saveFoods).not.toHaveBeenCalled();
});
test("invalid edited nutrition blocks submission", async () => {
  const ui = render(<FoodEditor initial={initial} onDone={() => {}} />);
  fireEvent.changeText(ui.getByLabelText("Calories · kcal"), "-20");
  fireEvent.press(ui.getByText("Confirm & save to diary"));
  await waitFor(() =>
    expect(
      ui.getByText(
        "Unable to complete this action. Check your input and retry.",
      ),
    ).toBeTruthy(),
  );
  expect(saveFoods).not.toHaveBeenCalled();
});
test("favorite saving does not log food", async () => {
  const ui = render(<FoodEditor initial={initial} onDone={() => {}} />);
  fireEvent.press(ui.getByText("Save as favorite / meal template"));
  await waitFor(() => expect(saveTemplate).toHaveBeenCalled());
  expect(saveFoods).not.toHaveBeenCalled();
});
