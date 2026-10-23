import { z } from "zod";

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Use a valid YYYY-MM-DD date");
export const weightSchema = z.object({
  weight: z.number().finite().min(20).max(500),
  date: dateSchema,
  waist: z.number().finite().min(20).max(300).optional(),
});
export const mealCategory = z.enum(["breakfast", "lunch", "dinner", "snack"]);
export const foodSchema = z.object({
  name: z.string().trim().min(1).max(120),
  calories: z.number().finite().min(0).max(10000),
  protein: z.number().finite().min(0).max(1000),
  carbs: z.number().finite().min(0).max(2000),
  fat: z.number().finite().min(0).max(1000),
  quantity: z.number().finite().positive().max(100),
  meal: mealCategory,
  date: dateSchema,
  source: z.enum(["manual", "reference", "ai"]),
});
export type FoodInput = z.infer<typeof foodSchema>;
export type Food = FoodInput & { id: string; macrosKnown?: boolean };
export type Weight = z.infer<typeof weightSchema> & { id: string };
export const profileSchema = z.object({
  height: z.number().finite().min(100).max(250),
  weight: z.number().finite().min(20).max(500),
  age: z.number().int().min(18).max(100),
  gender: z.enum(["female", "male"]),
  activity: z.union([
    z.literal(1.2),
    z.literal(1.375),
    z.literal(1.55),
    z.literal(1.725),
  ]),
  intent: z.enum(["maintain", "lose", "gain"]),
  target: z.number().finite().min(1200).max(6000),
  tdee: z.number().finite().positive().max(10000),
});
export type Profile = z.infer<typeof profileSchema>;
export type Settings = {
  goal?: string;
  goalWeight?: string;
  language?: "en" | "zh";
  units?: "metric" | "imperial";
  profile?: Partial<Profile>;
  onboardingComplete?: boolean;
  aiConsent?: boolean;
};
export const aiFoodSchema = foodSchema.omit({
  date: true,
  meal: true,
  source: true,
});
export const aiResultSchema = z.object({
  items: z.array(aiFoodSchema).max(20),
  answer: z.string().max(4000),
});
export type AIResult = z.infer<typeof aiResultSchema>;
export const aiRequestSchema = z
  .object({
    mode: z.enum(["meal", "photo", "assistant", "weekly"]),
    text: z.string().trim().max(2000),
    image: z
      .string()
      .max(1800000)
      .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/)
      .optional(),
    language: z.enum(["en", "zh"]).default("en"),
  })
  .superRefine((input, ctx) => {
    if (input.mode === "photo" ? !input.image : !input.text)
      ctx.addIssue({
        code: "custom",
        message: "Provide a meal description or photo",
      });
    if (input.mode !== "photo" && input.image)
      ctx.addIssue({
        code: "custom",
        message: "Images are only accepted in photo mode",
      });
  });
