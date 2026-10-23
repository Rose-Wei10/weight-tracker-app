import { useState } from "react";
import { View } from "react-native";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../../firebase";
import { useApp } from "../../context/AppContext";
import { useCopy, useLanguage } from "../../context/LanguageContext";
import {
  Button,
  Card,
  Choices,
  Confirm,
  Copy,
  Field,
  Notice,
  Screen,
  layout,
} from "../../components/Wellness";
import DataStatus from "../../components/DataStatus";
import { calorieEstimate, displayWeight, toKg } from "../../shared/metrics";
import { saveLanguage, saveProfile } from "../../services/records";
import { friendlyError } from "../../services/errors";
import { exportCSV, exportData } from "../../services/export";
import type { Profile, Settings } from "../../shared/schemas";
function GoalForm({ settings }: { settings: Settings }) {
  const x = useCopy(),
    { lang } = useLanguage(),
    p = settings.profile;
  const [units, setUnits] = useState<"metric" | "imperial">(
      settings.units || "metric",
    ),
    [weight, setWeight] = useState(
      p?.weight ? displayWeight(p.weight, settings.units) : "",
    ),
    [goal, setGoal] = useState(
      settings.goal ? displayWeight(Number(settings.goal), settings.units) : "",
    ),
    [height, setHeight] = useState(
      p?.height
        ? String(
            Math.round(
              (p.height / (settings.units === "imperial" ? 2.54 : 1)) * 10,
            ) / 10,
          )
        : "",
    ),
    [age, setAge] = useState(p?.age ? String(p.age) : ""),
    [gender, setGender] = useState<"female" | "male">(p?.gender || "female"),
    [intent, setIntent] = useState<"maintain" | "lose" | "gain">(
      p?.intent || "maintain",
    ),
    [activity, setActivity] = useState(String(p?.activity || 1.2)),
    [target, setTarget] = useState(p?.target ? String(p.target) : ""),
    [estimate, setEstimate] = useState<number | null>(p?.tdee || null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const calculate = () =>
    calorieEstimate(
      toKg(Number(weight), units),
      Number(height) * (units === "imperial" ? 2.54 : 1),
      Number(age),
      gender,
      Number(activity),
      intent,
    );
  const run = async (save: boolean) => {
    setMessage("");
    try {
      const result = calculate();
      setEstimate(result.tdee);
      if (!save) {
        setTarget(String(result.target));
        return;
      }
      setBusy(true);
      const input = {
        weight: toKg(Number(weight), units),
        height: Number(height) * (units === "imperial" ? 2.54 : 1),
        age: Number(age),
        gender,
        activity: Number(activity),
        intent,
        target: target ? Number(target) : result.target,
        tdee: result.tdee,
      } as Profile;
      await saveProfile(input, toKg(Number(goal || weight), units), units);
      setMessage(x("Goals saved.", "目标已保存。"));
    } catch (e) {
      setMessage(friendlyError(e, lang === "zh"));
    } finally {
      setBusy(false);
    }
  };
  const switchUnits = (next: "metric" | "imperial") => {
    if (next === units) return;
    if (weight) setWeight(displayWeight(toKg(Number(weight), units), next));
    if (goal) setGoal(displayWeight(toKg(Number(goal), units), next));
    if (height)
      setHeight(
        String(
          Math.round(
            Number(height) * (next === "imperial" ? 1 / 2.54 : 2.54) * 100,
          ) / 100,
        ),
      );
    setUnits(next);
  };
  return (
    <Card>
      <Copy kind="heading">
        {settings.onboardingComplete
          ? x("Your goals, your pace", "你的目标，你的节奏")
          : x("Start with your preferences", "先设置个人偏好")}
      </Copy>
      <Choices
        value={units}
        onChange={switchUnits}
        options={[
          { value: "metric", label: "kg / cm" },
          { value: "imperial", label: "lb / ft + in" },
        ]}
      />
      <View style={layout.grid}>
        <Field
          label={`${x("Current weight", "当前体重")} (${units === "imperial" ? "lb" : "kg"})`}
          value={weight}
          keyboardType="decimal-pad"
          onChangeText={setWeight}
        />
        <Field
          label={`${x("Goal weight · optional", "目标体重 · 可选")} (${units === "imperial" ? "lb" : "kg"})`}
          value={goal}
          keyboardType="decimal-pad"
          onChangeText={setGoal}
        />
      </View>
      <Field
        label={`${x("Height", "身高")} (${units === "imperial" ? "total inches / 总英寸" : "cm"})`}
        value={height}
        keyboardType="decimal-pad"
        onChangeText={setHeight}
      />
      {units === "imperial" && height && (
        <Copy kind="muted">
          {Math.floor(Number(height) / 12)} ft{" "}
          {Math.round((Number(height) % 12) * 10) / 10} in
        </Copy>
      )}
      <Field
        label={x("Age · adults 18–100", "年龄 · 18–100岁成人")}
        value={age}
        keyboardType="number-pad"
        onChangeText={setAge}
      />
      <Copy kind="muted">
        {x(
          "Formula coefficient (the original equation uses two sex coefficients). Choose the closest estimate; this does not define your identity.",
          "公式系数（原公式采用两个性别系数）。请选择最接近的估算值，这不代表你的性别认同。",
        )}
      </Copy>
      <Choices
        value={gender}
        onChange={setGender}
        options={[
          { value: "female", label: x("Female coefficient", "女性系数") },
          { value: "male", label: x("Male coefficient", "男性系数") },
        ]}
      />
      <Choices
        value={intent}
        onChange={setIntent}
        options={[
          { value: "maintain", label: x("Maintain", "维持") },
          { value: "lose", label: x("Gradual loss", "缓慢减重") },
          { value: "gain", label: x("Gradual gain", "缓慢增重") },
        ]}
      />
      <Copy kind="muted">{x("Typical activity", "日常活动")}</Copy>
      <Choices
        value={activity}
        onChange={setActivity}
        options={["1.2", "1.375", "1.55", "1.725"].map((value, i) => ({
          value,
          label: x(
            ["Mostly sitting", "Light activity", "Moderate", "Very active"][i],
            ["久坐", "轻度活动", "中度活动", "高度活动"][i],
          ),
        }))}
      />
      <Button
        title={x("Estimate daily needs", "估算每日需求")}
        secondary
        onPress={() => void run(false)}
      />
      {estimate !== null && (
        <Copy>
          {x("Estimated maintenance", "估算维持热量")}: {estimate} kcal
        </Copy>
      )}
      <Field
        label={x("Daily calorie budget · adjustable", "每日热量目标 · 可调整")}
        value={target}
        onChangeText={setTarget}
        keyboardType="number-pad"
      />
      <Notice
        text={x(
          "Mifflin–St Jeor × activity is an estimate. Gradual goals adjust it by 10%. A 1,200 kcal software floor is not a safe minimum for everyone. Pregnancy, medical conditions, and eating concerns need individualized professional advice.",
          "Mifflin–St Jeor 公式乘以活动系数仅为估算。缓慢增减重上下调整10%。1200千卡是软件下限，并非所有人的安全最低摄入。孕期、疾病或饮食困扰需个性化专业建议。",
        )}
      />
      {message && <Notice text={message} />}
      <Button
        title={x("Save preferences & goals", "保存偏好与目标")}
        busy={busy}
        onPress={() => void run(true)}
      />
    </Card>
  );
}
export default function Account() {
  const { user, settings, ready } = useApp(),
    { lang, setLang } = useLanguage(),
    x = useCopy();
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [password, setPassword] = useState("");
  const action = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      setMessage(success);
    } catch (e) {
      setMessage(friendlyError(e, lang === "zh"));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!user?.email || !password) throw new Error("Reauthentication required");
    await reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(user.email, password),
    );
    await httpsCallable(functions, "deleteAccount")({ confirm: true });
    await signOut(auth);
  };
  return (
    <Screen
      title={x("Make it yours", "我的健康空间")}
      eyebrow={x("PREFERENCES & PRIVACY", "偏好与隐私")}
      subtitle={user?.email || ""}
    >
      <DataStatus />
      <Card>
        <Copy kind="heading">{x("Language", "语言")}</Copy>
        <Choices
          value={lang}
          onChange={(v) => {
            setLang(v);
            void action(
              () => saveLanguage(v),
              x("Language saved.", "语言已保存。"),
            );
          }}
          options={[
            { value: "en", label: "English" },
            { value: "zh", label: "中文" },
          ]}
        />
      </Card>
      {ready && <GoalForm settings={settings} />}
      <Card>
        <Button
          title={x("Verify email for AI", "验证邮箱以使用 AI")}
          secondary
          disabled={busy || user?.emailVerified}
          onPress={() =>
            void action(
              () => sendEmailVerification(user!),
              x(
                "Verification email sent. Sign in again after verifying.",
                "验证邮件已发送。验证后请重新登录。",
              ),
            )
          }
        />
        <Copy kind="heading">
          {x("Your data belongs to you", "你的数据，由你掌控")}
        </Copy>
        <Copy kind="muted">
          {x(
            "Exports contain private health records. Choose a trusted destination. JSON includes original records, including legacy data. CSV includes all weight and food records in canonical units.",
            "导出文件含私人健康记录，请保存到可信位置。JSON 包含原始记录与旧数据，CSV 包含以标准单位记录的全部体重与饮食数据。",
          )}
        </Copy>
        <Button
          title={x("Export records · CSV", "导出记录 · CSV")}
          secondary
          busy={busy}
          onPress={() =>
            void action(exportCSV, x("CSV export ready.", "CSV 导出完成。"))
          }
        />
        <Button
          title={x("Export complete data · JSON", "导出全部数据 · JSON")}
          secondary
          busy={busy}
          onPress={() =>
            void action(exportData, x("Data export ready.", "数据导出完成。"))
          }
        />
        <Button
          title={x("Send password reset email", "发送密码重置邮件")}
          secondary
          disabled={busy}
          onPress={() =>
            void action(
              () => sendPasswordResetEmail(auth, user!.email!),
              x("Reset email requested.", "已请求密码重置邮件。"),
            )
          }
        />
      </Card>
      {message && <Notice text={message} />}
      <Card>
        <Copy kind="heading">{x("Account deletion", "删除账户")}</Copy>
        <Copy kind="muted">
          {x(
            "Deletes your account, profile, all logs, templates and AI quota records. Export first if needed. Enter your password to verify ownership. Requires the deployed deletion function.",
            "将删除账户、个人资料、全部记录、模板和 AI 配额记录。如需保留请先导出。输入密码验证账户所有权；需先部署删除服务。",
          )}
        </Copy>
        <Field
          label={x("Current password", "当前密码")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Confirm
          title={x("Delete account and all data", "删除账户及全部数据")}
          onConfirm={remove}
        />
      </Card>
      <Button
        title={x("Sign out", "退出登录")}
        secondary
        onPress={() => void action(() => signOut(auth), "")}
      />
    </Screen>
  );
}
