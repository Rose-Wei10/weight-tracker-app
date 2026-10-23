import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCopy } from "../context/LanguageContext";

const light = {
  background: "#F5F6F0",
  surface: "#FFFFFF",
  text: "#183C34",
  muted: "#5F716A",
  primary: "#28624E",
  tint: "#E7EFE4",
  border: "#D9E1D9",
  danger: "#A13632",
  accent: "#B16A3E",
};
const dark = {
  background: "#101C18",
  surface: "#1A2B24",
  text: "#F0F4E9",
  muted: "#B0C2B6",
  primary: "#A9D5B4",
  tint: "#2C4336",
  border: "#3B5045",
  danger: "#FFA9A0",
  accent: "#E7AD7E",
};
export function usePalette() {
  return useColorScheme() === "dark" ? dark : light;
}
export const layout = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  spread: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  grid: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  grow: { flex: 1, minWidth: 130 },
  gap: { gap: 12 },
});
export function Copy({
  children,
  kind = "body",
  style,
  ...props
}: {
  children: React.ReactNode;
  kind?: "body" | "title" | "heading" | "label" | "number" | "muted";
  style?: TextStyle;
} & Pick<
  React.ComponentProps<typeof Text>,
  "accessibilityRole" | "accessibilityLiveRegion"
>) {
  const c = usePalette();
  const styles: Record<string, TextStyle> = {
    body: { fontSize: 15, lineHeight: 23 },
    title: {
      fontSize: 34,
      lineHeight: 41,
      fontWeight: "700",
      letterSpacing: -1.2,
    },
    heading: {
      fontSize: 20,
      lineHeight: 27,
      fontWeight: "600",
      letterSpacing: -0.4,
    },
    label: {
      fontSize: 11,
      lineHeight: 18,
      fontWeight: "700",
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    number: {
      fontSize: 46,
      lineHeight: 56,
      fontWeight: "600",
      letterSpacing: -2,
      fontVariant: ["tabular-nums"],
    },
    muted: { fontSize: 13, lineHeight: 20, color: c.muted },
  };
  return (
    <Text {...props} style={[{ color: c.text }, styles[kind], style]}>
      {children}
    </Text>
  );
}
export function Screen({
  title,
  eyebrow,
  subtitle,
  children,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const c = usePalette();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: c.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 22,
            paddingBottom: 40,
            gap: 20,
            width: "100%",
            maxWidth: 820,
            alignSelf: "center",
          }}
        >
          {eyebrow && (
            <Copy kind="label" style={{ color: c.primary }}>
              {eyebrow}
            </Copy>
          )}
          <View style={{ gap: 6 }}>
            <Copy kind="title" accessibilityRole="header">
              {title}
            </Copy>
            {subtitle && <Copy kind="muted">{subtitle}</Copy>}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Card({
  children,
  style,
  tinted = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  tinted?: boolean;
}) {
  const c = usePalette();
  return (
    <View
      style={[
        {
          backgroundColor: tinted ? c.tint : c.surface,
          borderRadius: 24,
          padding: 20,
          gap: 14,
          borderWidth: 1,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  destructive = false,
  disabled = false,
  busy = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  busy?: boolean;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled || busy ? 0.5 : pressed ? 0.75 : 1,
        backgroundColor: secondary
          ? c.tint
          : destructive
            ? c.danger
            : c.primary,
      })}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? c.primary : c.background} />
      ) : (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: secondary ? c.primary : destructive ? "#fff" : c.background,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const c = usePalette();
  return (
    <View style={{ gap: 6, flexGrow: 1 }}>
      <Copy kind="muted">{label}</Copy>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...props}
        style={[
          {
            minHeight: 50,
            backgroundColor: c.background,
            color: c.text,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 14,
            padding: 13,
            fontSize: 16,
          },
          props.style,
        ]}
      />
    </View>
  );
}
export function Choices<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const c = usePalette();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="button"
          accessibilityState={{ selected: value === o.value }}
          onPress={() => onChange(o.value)}
          style={{
            minHeight: 44,
            justifyContent: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: value === o.value ? c.primary : c.tint,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: value === o.value ? c.background : c.text,
            }}
          >
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Meter({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color?: string;
}) {
  const c = usePalette();
  const ratio = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  return (
    <View style={{ gap: 7 }}>
      <Copy kind="muted">{label}</Copy>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
        style={{
          height: 7,
          backgroundColor: c.border,
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 7,
            width: `${ratio * 100}%`,
            backgroundColor: color || c.primary,
            borderRadius: 5,
          }}
        />
      </View>
    </View>
  );
}
export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  const c = usePalette();
  return (
    <Copy
      accessibilityLiveRegion="polite"
      style={{
        fontSize: 14,
        lineHeight: 22,
        color: error ? c.danger : c.muted,
      }}
    >
      {text}
    </Copy>
  );
}
export function Confirm({
  title,
  onConfirm,
}: {
  title: string;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const x = useCopy();
  return (
    <View style={{ gap: 8 }}>
      <Button title={title} secondary onPress={() => setOpen(!open)} />
      {open && (
        <>
          <Notice
            text={x(
              "This action permanently removes the selected data.",
              "此操作将永久删除所选数据。",
            )}
          />
          {error && <Notice error text={error} />}
          <View style={layout.row}>
            <Button
              title={x("Cancel", "取消")}
              secondary
              disabled={busy}
              onPress={() => setOpen(false)}
            />
            <Button
              title={x("Confirm deletion", "确认删除")}
              destructive
              busy={busy}
              onPress={() => {
                setBusy(true);
                setError("");
                onConfirm()
                  .then(() => setOpen(false))
                  .catch(() =>
                    setError(
                      x(
                        "Deletion failed. Sign in again and retry.",
                        "删除失败，请重新登录后重试。",
                      ),
                    ),
                  )
                  .finally(() => setBusy(false));
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}
