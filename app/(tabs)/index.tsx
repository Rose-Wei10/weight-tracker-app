import WeightChart from '@/components/WeightChart';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [loadingData, setLoadingData] = useState(true);
  const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
      const data = snapshot.docs.map(doc => {
        const d = doc.data() as any;

        return {
          id: doc.id,
          weight: d.weight,
          date: d.date,
        };
      });

      data.sort((a, b) =>
        new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
      );

      setHistory(data);
      setLoadingData(false);
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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const w = parseFloat(weight);
    if (!w || !user) return;

    const height = 175;
    const age = 22;

    const bmr = 10 * w + 6.25 * height - 5 * age - 161;
    const target = Math.round(bmr * 1.2 - 500);

    const today = getLocalDate();

    const exists = history.find(h => h.date === today);

    if (exists) {
      alert("You already logged weight today. Edit it instead.");
      return;
    }

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

    // setWeight('');
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const ref = doc(db, "users", user.uid, "weights", id);
      await deleteDoc(ref);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (item: any) => {
    Alert.prompt(
      "Edit weight",
      "Enter new weight (kg)",
      async (text) => {
        const w = parseFloat(text);
        if (!w || !user) return;

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
          const ref = doc(db, "users", user.uid, "weights", item.id);
          await setDoc(ref, { weight: w }, { merge: true });
        } catch (e) {
          console.error(e);
        }
      },
      "plain-text",
      String(item.weight)
    );
  };
  // console.log("CURRENT UID:", user?.uid);

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

  const getStreak = () => {
    if (history.length === 0) return 0;

    const dates = history.map(h => h.date).sort().reverse();

    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);

      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* <View style={styles.container}> */}
          <Text style={styles.title}>Weight</Text>


          {/* 📈 Chart */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <WeightChart history={history} goal={goal} user={user} loading={loadingData} />
          </View>

          {/* 📋 Weight History */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>History</Text>

            {/* 📋 List */}
            {history.slice().reverse().map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.rowText}>
                  {item.date} - {item.weight}kg
                </Text>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.edit}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.delete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* ➕ Add Weight (BOTTOM) */}
            <View style={styles.addSection}>
              <TextInput
                placeholder="Add weight (e.g. 76.5)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                style={styles.addInput}
              />

              <TouchableOpacity style={styles.addBtn} onPress={calculate}>
                <Text style={styles.addBtnText}>+ Add Weight</Text>
              </TouchableOpacity>
            </View>
          </View>

          

          {/* 🎯 Goal + Progress */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Goal</Text>

            <TextInput
              value={goal}
              onChangeText={async (g) => {
                setGoal(g);
                if (!user) return;
                await setDoc(doc(db, "users", user.uid), { goal: g }, { merge: true });
              }}
              keyboardType="numeric"
              style={styles.input}
            />

            {progress() && (
              <Text style={styles.progressText}>
                {progress()}% to goal
              </Text>
            )}
          </View>

          <View style={{
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 20,
            marginBottom: 16,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 28 }}>🔥</Text>

            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              marginTop: 4,
            }}>
              {getStreak()} Day Streak
            </Text>

            <Text style={{
              color: '#888',
              marginTop: 2,
            }}>
              Keep it going!
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Insights</Text>

            {history.length > 1 && (
              <Text style={styles.infoText}>
                {history[history.length - 1].weight <
                history[0].weight
                  ? `⬇️ You lost ${(history[0].weight - history[history.length - 1].weight).toFixed(1)} kg`
                  : `⬆️ You gained ${(history[history.length - 1].weight - history[0].weight).toFixed(1)} kg`}
              </Text>
            )}

            {weeklyAvg() && (
              <Text style={styles.infoText}>
                📊 Weekly avg: {weeklyAvg()} kg
              </Text>
            )}

            {history.length >= 3 && (
              <Text style={styles.infoText}>
                🔥 {history.length} days tracked
              </Text>
            )}
          </View>

          {/* 🔓 Logout */}
          <TouchableOpacity onPress={async () => {
            await signOut(auth);
            router.replace('/login');
          }}>
            <Text style={styles.logout}>Log out</Text>
          </TouchableOpacity>
        {/* </View> */}
        </ScrollView>
      </SafeAreaView>
    // </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 10,
  },

  primaryBtn: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  progressText: {
    marginTop: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },

  logout: {
    textAlign: 'center',
    marginTop: 20,
    color: '#FF3B30',
    fontSize: 16,
  },
    infoText: {
    fontSize: 15,
    marginTop: 6,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  rowText: {
    fontSize: 15,
    fontWeight: '500',
  },

  edit: {
    color: '#007AFF',
    fontWeight: '600',
  },

  delete: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  addSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
  },

  addInput: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  addBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});