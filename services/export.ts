import { collection, getDoc, getDocs } from "firebase/firestore";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { auth, db } from "../firebase";
import { csv } from "../shared/metrics";
export async function shareFile(name: string, content: string, mime: string) {
  if (Platform.OS === "web") {
    const blob = new Blob([content], { type: mime }),
      url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("File sharing is unavailable");
  const path = FileSystem.cacheDirectory + name;
  try {
    await FileSystem.writeAsStringAsync(path, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path, {
      mimeType: mime,
      dialogTitle: "Export your data",
    });
  } finally {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}
export async function exportData() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Sign in required");
  const [profile, ...groups] = await Promise.all([
    getDoc((await import("./records")).userRef()),
    ...["weights", "foods", "templates"].map((kind) =>
      getDocs(collection(db, "users", uid, kind)),
    ),
  ]);
  const records = groups.map((snap) =>
    ("docs" in snap ? snap.docs : []).map((d) => ({ id: d.id, ...d.data() })),
  );
  await shareFile(
    "forma-data.json",
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile: profile.data(),
        weights: records[0],
        foods: records[1],
        templates: records[2],
      },
      null,
      2,
    ),
    "application/json",
  );
}
export async function exportCSV() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Sign in required");
  const [weights, foods] = await Promise.all(
    ["weights", "foods"].map((kind) =>
      getDocs(collection(db, "users", uid, kind)),
    ),
  );
  const rows: (string | number | undefined)[][] = [
    [
      "type",
      "id",
      "date",
      "weight_kg",
      "waist_cm",
      "food",
      "servings",
      "kcal_total",
      "protein_g",
      "carbs_g",
      "fat_g",
      "meal",
      "source",
    ],
  ];
  weights.docs.forEach((d) => {
    const v = d.data();
    rows.push(["weight", d.id, v.date, v.weight, v.waist]);
  });
  foods.docs.forEach((d) => {
    const v = d.data();
    rows.push([
      "food",
      d.id,
      v.date,
      undefined,
      undefined,
      v.name,
      v.quantity,
      v.calories,
      v.protein,
      v.carbs,
      v.fat,
      v.meal,
      v.source,
    ]);
  });
  await shareFile("forma-records.csv", csv(rows), "text/csv");
}
