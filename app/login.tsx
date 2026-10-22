import { useState } from "react";
import { Redirect } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useApp } from "../context/AppContext";
import { useCopy, useLanguage } from "../context/LanguageContext";
import {
  Button,
  Card,
  Choices,
  Copy,
  Field,
  Notice,
  Screen,
} from "../components/Wellness";
import { friendlyError } from "../services/errors";
export default function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [register, setRegister] = useState(false);
  const { user } = useApp(),
    { lang, setLang } = useLanguage(),
    x = useCopy();
  if (user) return <Redirect href="/home" />;
  const submit = async (reset = false) => {
    setMessage("");
    if (!email.includes("@") || (!reset && password.length < 6)) {
      setMessage(
        x(
          "Enter a valid email and a password of at least 6 characters.",
          "请输入有效邮箱，密码至少6位。",
        ),
      );
      return;
    }
    setBusy(true);
    try {
      if (reset) {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage(
          x(
            "If an account exists, a reset email will arrive shortly.",
            "如果该账户存在，你将收到密码重置邮件。",
          ),
        );
      } else if (register)
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setMessage(friendlyError(e, lang === "zh"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title={x("Feel more like you.", "更懂自己的每一天。")}
      eyebrow="FORMA / WELLNESS, AT YOUR PACE"
      subtitle={x(
        "A thoughtful space for food, weight, and everyday wellbeing.",
        "从饮食与体重开始，关爱日常健康。",
      )}
    >
      <Choices
        value={lang}
        onChange={setLang}
        options={[
          { value: "en", label: "English" },
          { value: "zh", label: "中文" },
        ]}
      />
      <Card>
        <Copy kind="heading">
          {register
            ? x("Create your account", "创建账户")
            : x("Welcome back", "欢迎回来")}
        </Copy>
        <Field
          label={x("Email", "邮箱")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field
          label={x("Password", "密码")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={register ? "new-password" : "current-password"}
        />
        {message && <Notice text={message} />}
        <Button
          title={
            register ? x("Create account", "创建账户") : x("Sign in", "登录")
          }
          busy={busy}
          onPress={() => void submit()}
        />
        <Button
          title={
            register
              ? x("Already have an account? Sign in", "已有账户？登录")
              : x("New here? Create an account", "首次使用？创建账户")
          }
          secondary
          disabled={busy}
          onPress={() => setRegister(!register)}
        />
        <Button
          title={x("Forgot password?", "忘记密码？")}
          secondary
          disabled={busy}
          onPress={() => void submit(true)}
        />
      </Card>
      <Copy kind="muted">
        {x(
          "For adults 18+. Nutrition estimates support general wellbeing and are not medical advice. AI sharing is optional and requires consent.",
          "适用于18岁以上成人。营养估算用于一般健康参考，不构成医疗建议。AI 信息分享为可选功能，需先征得同意。",
        )}
      </Copy>
    </Screen>
  );
}
