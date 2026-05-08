import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { styles } from '../../css/accountStyles';
import { auth, db } from '../../firebase';
import { translations } from '../../translations';

export default function AccountScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const { lang, setLang } = useLanguage();
  const [dietLevel, setDietLevel] = useState('Moderate');
    const t = translations[lang];
  // ✅ auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return unsub;
  }, []);

  // ✅ realtime profile
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      setDob(data.dob || '');
      setHeight(data.height || '');
      setGoalWeight(data.goalWeight || '');
      setDietLevel(data.dietLevel || 'Moderate');
    });

    return unsub;
  }, [user]);

  const handleEdit = () => {
    Alert.prompt(
      'Edit DOB',
      'Enter your DOB',
      [
        {
          text: 'Next',
          onPress: (dobText: any) => {
            Alert.prompt(
              'Edit Height',
              'Enter your height',
              [
                {
                  text: 'Next',
                  onPress: (heightText: any) => {
                    Alert.prompt(
                      'Edit Goal Weight',
                      'Enter your goal weight',
                      async (goalText) => {
                        if (!user) return;

                        await setDoc(
                          doc(db, 'users', user.uid),
                          {
                            dob: dobText || '',
                            height: heightText || '',
                            goalWeight: goalText || '',
                          },
                          { merge: true }
                        );
                      },
                      'plain-text',
                      goalWeight
                    );
                  },
                },
              ],
              'plain-text',
              height
            );
          },
        },
      ],
      'plain-text',
      dob
    );
  };

    const changeLanguage = async (newLang: 'en' | 'zh') => {
    setLang(newLang);

    if (!user) return;

    await setDoc(
        doc(db, 'users', user.uid),
        {
        language: newLang,
        },
        { merge: true }
    );
    };

  const changeDietLevel = async (level: string) => {
    setDietLevel(level);

    if (!user) return;

    await setDoc(
      doc(db, 'users', user.uid),
      {
        dietLevel: level,
      },
      { merge: true }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE */}
        <Text style={styles.title}>{t.account}</Text>

        {/* USER CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>{t.user}</Text>
          <Text style={styles.value}>
            {user?.email || 'Anonymous User'}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>{t.dob}</Text>
          <Text style={styles.value}>
            {dob || 'Blank'}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>{t.height}</Text>
          <Text style={styles.value}>
            {height || 'Blank'}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.label}>{t.goalWeight}</Text>
          <Text style={styles.goalValue}>
            {goalWeight || 'Blank'}
          </Text>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={handleEdit}
          >
            <Text style={styles.editText}>{t.edit}</Text>
          </TouchableOpacity>
        </View>

        {/* LANGUAGE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.language}</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.optionBtn,
                lang === 'en' && styles.activeBtn,
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text
                style={[
                  styles.optionText,
                  lang === 'en' && styles.activeText,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionBtn,
                lang === 'zh' && styles.activeBtn,
              ]}
              onPress={() => changeLanguage('zh')}
            >
              <Text
                style={[
                  styles.optionText,
                  lang === 'zh' && styles.activeText,
                ]}
              >
                中文
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DIET LEVEL */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.weightLossLevel}</Text>

          <View style={styles.levelContainer}>
            {[t.light, t.moderate, t.aggressive].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelBtn,
                  dietLevel === level && styles.activeBtn,
                ]}
                onPress={() => changeDietLevel(level)}
              >
                <Text
                  style={[
                    styles.optionText,
                    dietLevel === level && styles.activeText,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await signOut(auth);
            router.replace('/login');
          }}
        >
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
