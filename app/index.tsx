import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useApp } from "../context/AppContext";
export default function Index() {
  const { user, authReady } = useApp();
  if (!authReady)
    return <ActivityIndicator accessibilityLabel="Loading session" />;
  return <Redirect href={user ? "/home" : "/login"} />;
}
