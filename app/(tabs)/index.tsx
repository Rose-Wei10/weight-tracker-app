import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  // ✅ Auto login (anonymous)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return unsubscribe;
  }, []);

  // ✅ Real-time Firestore sync
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "weights"));

    const unsubscribeWeights = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());

      data.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setHistory(data);
    });

    const goalRef = doc(db, "users", user.uid);

    const unsubscribeGoal = onSnapshot(goalRef, (docSnap) => {
      if (docSnap.exists()) {
        setGoal(docSnap.data().goal || '');
      }
    });

    return () => {
      unsubscribeWeights();
      unsubscribeGoal();
    };
  }, [user]);

  const calculate = async () => {
    Keyboard.dismiss();

    const w = parseFloat(weight);
    if (!w || !user) return;

    const height = 175;
    const age = 22;

    const bmr = 10 * w + 6.25 * height - 5 * age - 161;
    const target = Math.round(bmr * 1.2 - 500);

    const today = new Date().toISOString().split('T')[0];

    const newEntry = {
      weight: w,
      date: today,
      createdAt: serverTimestamp()
    };

    setResult(target);

    try {
      await addDoc(
        collection(db, "users", user.uid, "weights"),
        newEntry
      );
    } catch (e) {
      console.error(e);
    }

    setWeight('');
  };

  const progress = () => {
    if (!goal || history.length === 0) return null;
    const current = history[history.length - 1].weight;
    return ((current - parseFloat(goal)) * 100 / current).toFixed(1);
  };

  const weeklyAvg = () => {
    if (history.length < 7) return null;
    const last7 = history.slice(-7);
    const avg = last7.reduce((sum, item) => sum + item.weight, 0) / 7;
    return avg.toFixed(1);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, paddingTop: 10, backgroundColor: "#fff" }}>
        <View style={styles.container}>
          <Text style={styles.title}>Weight Tracker</Text>

          <View style={styles.card}>
            <TextInput
              placeholder="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              placeholder="Goal weight (kg)"
              value={goal}
              onChangeText={async (g) => {
                setGoal(g);
                if (!user) return;

                await setDoc(doc(db, "users", user.uid), {
                  goal: g
                }, { merge: true });
              }}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={calculate}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            {result && <Text style={styles.result}>🔥 {result} kcal/day</Text>}
          </View>

          {history.length > 1 && (
            <LineChart
              data={{
                labels: history.map((h) => h.date.slice(5)),
                datasets: [{ data: history.map((h) => h.weight) }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: () => `#4A90E2`,
              }}
              style={{ borderRadius: 16 }}
            />
          )}

          {progress() && (
            <Text style={styles.info}>🎯 Progress: {progress()}%</Text>
          )}

          {weeklyAvg() && (
            <Text style={styles.info}>📊 Weekly avg: {weeklyAvg()} kg</Text>
          )}

          <TouchableOpacity
            onPress={async () => {
              await signOut(auth);
              router.replace('/login'); // 👈 force redirect to login
            }}
          >
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f7fb' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: '#4A90E2', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  result: { marginTop: 10, textAlign: 'center' },
  info: { marginTop: 10, textAlign: 'center', fontSize: 16 },
});