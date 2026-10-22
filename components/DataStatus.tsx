import { ActivityIndicator } from "react-native";
import { useApp } from "../context/AppContext";
import { useCopy } from "../context/LanguageContext";
import { Button, Card, Notice } from "./Wellness";
export default function DataStatus() {
  const { ready, error, retry } = useApp(),
    x = useCopy();
  return error ? (
    <Card>
      <Notice text={error} error />
      <Button title={x("Retry sync", "重新同步")} secondary onPress={retry} />
    </Card>
  ) : !ready ? (
    <ActivityIndicator
      accessibilityLabel={x("Loading records", "正在加载记录")}
    />
  ) : null;
}
