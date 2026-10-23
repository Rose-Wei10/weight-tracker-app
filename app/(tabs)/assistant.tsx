import { useState } from "react";
import { View, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import {
  Button,
  Card,
  Choices,
  Copy,
  Field,
  Notice,
  Screen,
  layout,
} from "../../components/Wellness";
import FoodEditor from "../../components/FoodEditor";
import { useApp } from "../../context/AppContext";
import { useCopy, useLanguage } from "../../context/LanguageContext";
import { requestAI } from "../../services/ai";
import { saveAIConsent } from "../../services/records";
import { friendlyError } from "../../services/errors";
import {
  average,
  dailyWeights,
  inRange,
  nutritionDays,
} from "../../shared/metrics";
import type { AIResult, FoodInput } from "../../shared/schemas";
export default function Assistant() {
  const { settings, weights, foods, today, ready } = useApp(),
    x = useCopy(),
    { lang } = useLanguage();
  const [mode, setMode] = useState<"meal" | "assistant" | "weekly">("meal"),
    [text, setText] = useState(""),
    [photo, setPhoto] = useState<{ uri: string; data: string }>(),
    [result, setResult] = useState<AIResult>(),
    [draft, setDraft] = useState<FoodInput>(),
    [saved, setSaved] = useState<number[]>([]),
    [selectedItem, setSelectedItem] = useState<number>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const pick = async (camera: boolean) => {
    setError("");
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError(
            x(
              "Camera permission is needed to take a meal photo. You can select a photo instead.",
              "拍摄餐食需相机权限，也可以选择已有照片。",
            ),
          );
          return;
        }
      }
      const chosen = await (
        camera
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync
      )({ mediaTypes: ["images"], quality: 0.8, exif: false });
      if (chosen.canceled) return;
      const asset = chosen.assets[0];
      const resized = await manipulateAsync(
        asset.uri,
        [
          {
            resize:
              asset.width >= asset.height ? { width: 1024 } : { height: 1024 },
          },
        ],
        { compress: 0.65, format: SaveFormat.JPEG, base64: true },
      );
      if (!resized.base64 || resized.base64.length > 1800000) {
        setError(
          x(
            "Photo is too large. Please select a smaller image.",
            "照片过大，请选择较小图片。",
          ),
        );
        return;
      }
      setPhoto({
        uri: resized.uri,
        data: `data:image/jpeg;base64,${resized.base64}`,
      });
    } catch {
      setError(
        x(
          "Unable to open the photo. Please try again.",
          "无法打开照片，请重试。",
        ),
      );
    }
  };
  const ask = async () => {
    setBusy(true);
    setError("");
    setResult(undefined);
    setSaved([]);
    try {
      const weeklyWeights = inRange(dailyWeights(weights), 7, today),
        days = nutritionDays(foods, 7, today).filter((d) => d.logged);
      const weekly = JSON.stringify({
        recordedWeightDays: weeklyWeights.length,
        meanWeightKg: average(weeklyWeights.map((w) => w.weight)),
        nutritionDays: days.length,
        meanLoggedCalories: average(days.map((d) => d.calories)),
      });
      const value = await requestAI({
        mode: mode === "meal" && photo ? "photo" : mode,
        text:
          mode === "weekly"
            ? weekly
            : mode === "assistant"
              ? `${messages
                  .slice(-4)
                  .map((m) => `${m.role}: ${m.text}`)
                  .join("\n")}\nUser: ${text}`.slice(-2000)
              : text,
        ...(photo && mode === "meal" ? { image: photo.data } : {}),
        language: lang,
      });
      setResult(value);
      if (mode === "assistant") {
        setMessages((prev) =>
          [
            ...prev,
            { role: "You", text },
            { role: "Forma", text: value.answer },
          ].slice(-8),
        );
        setText("");
      }
    } catch (e) {
      setError(friendlyError(e, lang === "zh"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title={x("A thoughtful companion", "贴心营养助手")}
      eyebrow={x("AI, WITH YOUR PERMISSION", "AI 功能，由你选择")}
      subtitle={x(
        "Explore food and patterns with a little support.",
        "了解饮食与趋势，多一点支持。",
      )}
    >
      <Card tinted>
        <Copy kind="heading">
          {x("Your choice, every time", "每一次，选择权在你")}
        </Copy>
        <Copy>
          {x(
            "Your text or selected meal photo goes through our server to OpenRouter and its model provider. Weekly reports send only aggregated numbers. Photos are compressed without EXIF and are not saved to our database. Avoid faces, documents, or other identifying details.",
            "你输入的文本或所选餐食照片将通过服务器发送到 OpenRouter 及其模型供应商。周报仅发送汇总数字。照片会压缩并去除EXIF，不存入我们的数据库。请避免人脸、证件等身份信息。",
          )}
        </Copy>
        <Notice
          text={x(
            "Estimates can be wrong. This assistant offers general education, not diagnoses, treatment, or restrictive diet plans. You review every food before it is saved.",
            "估算可能有误。助手仅提供一般知识，不提供诊断、治疗或极端节食计划。每项食物保存前均需由你核对。",
          )}
        />
        <Button
          title={
            settings.aiConsent
              ? x("Turn off AI sharing", "关闭 AI 信息分享")
              : x("I agree · enable AI sharing", "我同意 · 开启 AI 信息分享")
          }
          secondary
          disabled={!ready || busy}
          onPress={() => {
            void saveAIConsent(!settings.aiConsent).catch(() =>
              setError(x("Unable to save your choice.", "无法保存你的选择。")),
            );
            if (settings.aiConsent) {
              setPhoto(undefined);
              setResult(undefined);
              setDraft(undefined);
              setMessages([]);
            }
          }}
        />
      </Card>
      <Choices
        value={mode}
        onChange={(v) => {
          setMode(v);
          setResult(undefined);
          setDraft(undefined);
          setPhoto(undefined);
          setError("");
        }}
        options={[
          { value: "meal", label: x("Log a meal", "记录餐食") },
          { value: "assistant", label: x("Ask a question", "营养问答") },
          { value: "weekly", label: x("Weekly insight", "每周洞察") },
        ]}
      />
      <Card>
        <Copy kind="heading">
          {mode === "meal"
            ? x("What’s on your plate?", "今天吃了什么？")
            : mode === "weekly"
              ? x("Look back with perspective", "回顾本周趋势")
              : x("Let’s talk nutrition", "聊聊营养")}
        </Copy>
        {mode !== "weekly" && (
          <Field
            label={
              mode === "meal"
                ? x("Describe your meal", "描述餐食")
                : x("Your nutrition question", "你的营养问题")
            }
            placeholder={
              mode === "meal"
                ? x(
                    "Two eggs, a slice of toast, and a latte",
                    "两个鸡蛋、一片吐司和一杯拿铁",
                  )
                : x("What makes a balanced lunch?", "怎样搭配均衡午餐？")
            }
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1600}
          />
        )}{" "}
        {mode === "meal" && (
          <>
            <View style={layout.row}>
              <Button
                title={x("Take photo", "拍照")}
                secondary
                disabled={busy}
                onPress={() => void pick(true)}
              />
              <Button
                title={x("Choose photo", "选择照片")}
                secondary
                disabled={busy}
                onPress={() => void pick(false)}
              />
            </View>
            {photo && (
              <>
                <Image
                  source={{ uri: photo.uri }}
                  accessibilityLabel={x("Selected meal photo", "已选餐食照片")}
                  style={{ height: 200, width: "100%", borderRadius: 16 }}
                />
                <Button
                  title={x("Remove photo", "移除照片")}
                  secondary
                  onPress={() => setPhoto(undefined)}
                />
              </>
            )}
          </>
        )}
        {mode === "weekly" && (
          <Copy kind="muted">
            {x(
              "Shares the last seven days of averages and logging counts, without your name, email, or individual entries. Incomplete diaries limit what can be inferred.",
              "分享近7天的平均值与记录天数，不包含姓名、邮箱或单条记录。未完整记录会影响分析。",
            )}
          </Copy>
        )}
        {error && <Notice text={error} error />}
        <Button
          title={x("Get AI support", "获取 AI 帮助")}
          busy={busy}
          disabled={
            !ready ||
            !settings.aiConsent ||
            (mode !== "weekly" && !text.trim() && !photo)
          }
          onPress={() => void ask()}
        />
        <Copy kind="muted">
          {x(
            "Up to 10 requests per day, 2 per minute. Requires configured server, verified email, and production App Check.",
            "每日最多10次，每分钟2次。需配置服务器、验证邮箱并启用生产 App Check。",
          )}
        </Copy>
      </Card>
      {mode === "assistant" &&
        messages.map((m, i) => (
          <Card key={i}>
            <Copy kind="label">{m.role}</Copy>
            <Copy>{m.text}</Copy>
          </Card>
        ))}
      {result && mode !== "assistant" && (
        <Card>
          <Copy kind="heading">
            {x("AI estimate · review required", "AI 估算 · 需核对")}
          </Copy>
          <Copy>{result.answer}</Copy>
          {result.items.map((item, i) => (
            <Button
              key={i}
              title={
                saved.includes(i)
                  ? `${item.name} · ${x("saved", "已保存")}`
                  : `${item.name} · ~${item.calories} kcal`
              }
              secondary
              disabled={saved.includes(i) || !!draft}
              onPress={() => {
                setSelectedItem(i);
                setDraft({ ...item, date: today, meal: "snack", source: "ai" });
              }}
            />
          ))}
        </Card>
      )}
      {draft && (
        <FoodEditor
          key={draft.name}
          initial={draft}
          onSaved={() => {
            if (selectedItem !== undefined)
              setSaved((prev) => [...prev, selectedItem]);
          }}
          onDone={() => {
            setDraft(undefined);
          }}
        />
      )}
    </Screen>
  );
}
