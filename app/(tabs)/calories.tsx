import { FOOD_DB } from '@/constants/food';
import { onAuthStateChanged } from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { styles } from '../../css/caloriesStyles';
import { auth, db } from '../../firebase';
import { translations } from '../../translations';

export default function CaloriesScreen() {
    const [user, setUser] = useState<any>(null);

    const [expanded, setExpanded] = useState(false);

    // 📊 Inputs
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'female' | 'male'>('female');
    const [activity, setActivity] = useState(1.2);

    // 📈 Results
    const [tdee, setTdee] = useState<number | null>(null);
    const [target, setTarget] = useState<number | null>(null);

    // 🍱 Food log
    const [foods, setFoods] = useState<any[]>([]);
    const [foodName, setFoodName] = useState('');
    const [foodCalories, setFoodCalories] = useState('');
    const [aiMeal, setAiMeal] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [eaten, setEaten] = useState(0);

    //Food search
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [quantity, setQuantity] = useState('1');
    const qty = parseFloat(quantity || '1');
    const [frequentFoods, setFrequentFoods] = useState<any[]>([]);


    const { lang } = useLanguage();
    const t = translations[lang];

    const getLocalDate = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // ✅ auth
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return unsub;
    }, []);

    // ✅ profile + daily summary
    useEffect(() => {
        if (!user) return;

        const ref = doc(db, 'users', user.uid);

        const unsub = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();

        // profile
        if (data.profile) {
            const p = data.profile;
            setWeight(p.weight?.toString() || '');
            setHeight(p.height?.toString() || '');
            setAge(p.age?.toString() || '');
            setGender(p.gender || 'female');
            setActivity(p.activity || 1.2);
            setTdee(p.tdee || null);
            setTarget(p.target || null);
        }

        // daily eaten fallback
        const today = getLocalDate();
        if (data.daily?.date === today) {
            setEaten(data.daily.eaten || 0);
        } else {
            setEaten(0);
        }
        });

        return unsub;
    }, [user]);

    // ✅ food log（🔥核心）
    useEffect(() => {
        if (!user) return;

        const today = getLocalDate();

        const ref = collection(db, 'users', user.uid, 'foods');

        const unsub = onSnapshot(ref, (snap) => {
        const list: any[] = [];

        snap.forEach((docItem) => {
            const d = docItem.data();

            if (d.date === today) {
            list.push({
                id: docItem.id,
                ...d,
            });
            }
        });

        setFoods(list);

        // 🔥 自动计算 eaten
        const total = list.reduce((sum, f) => sum + (f.calories || 0), 0);
        setEaten(total);
        });

        return unsub;
    }, [user]);

    const calculate = async () => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseFloat(age);

        if (!w || !h || !a || !user) return;

        let bmr =
        gender === 'female'
            ? 10 * w + 6.25 * h - 5 * a - 161
            : 10 * w + 6.25 * h - 5 * a + 5;

        const total = Math.round(bmr * activity);
        const deficit = total - 500;

        setTdee(total);
        setTarget(deficit);

        await setDoc(
        doc(db, 'users', user.uid),
        {
            profile: {
            weight: w,
            height: h,
            age: a,
            gender,
            activity,
            tdee: total,
            target: deficit,
            },
        },
        { merge: true }
        );
    };

    // 🍱 add food
    const addFood = async () => {
        if (!user) return;

        const cals = parseFloat(foodCalories);
        if (!foodName || !cals) return;

        const today = getLocalDate();

        await addDoc(collection(db, 'users', user.uid, 'foods'), {
        name: foodName,
        calories: cals,
        quantity: parseFloat(quantity || '1'),
        date: today,
        createdAt: new Date(),
        });

        setFoodName('');
        setFoodCalories('');
        setQuantity('1');
    };

    const estimateCaloriesAI = async () => {
        if (!aiMeal) return;

        try {
            setAiLoading(true);

            const response = await fetch(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'openrouter/free',
                        messages: [
                            {
                                role: 'system',
                                content:
                                    'You estimate meal calories. Keep replies short and include estimated calories.',
                            },
                            {
                                role: 'user',
                                content: `
    Estimate calories for this meal:

    ${aiMeal}

    Assume average serving size.
    `,
                            },
                        ],
                    }),
                }
            );

            const data = await response.json();

            console.log(data);

            // 🔥 show real API errors
            if (data.error) {
                alert(data.error.message);
                return;
            }

            const text =
                data?.choices?.[0]?.message?.content || '';

            const numbers = text.match(/\d+/g);

            const estimatedCalories =
                numbers?.find((n: string) => parseInt(n) > 50);

            if (estimatedCalories) {
                setFoodCalories(estimatedCalories);
                setFoodName(aiMeal);
            }


            console.log(text);
            setAiResponse(text);

        } catch (e) {
            console.log(e);
            alert('AI failed');
        } finally {
            setAiLoading(false);
        }
    };

    // ❌ delete food
    const deleteFood = async (id: string) => {
        if (!user) return;

        await deleteDoc(doc(db, 'users', user.uid, 'foods', id));
    };

    const remaining = () => {
        if (!target) return null;
        return target - eaten;
    };

    useEffect(() => {
        const selected = FOOD_DB.find(
            (f) => f.name === foodName
        );

        if (!selected) return;

        const qty = parseFloat(quantity || '1');

        const total = Math.round(selected.calories * qty);

        setFoodCalories(String(total));
    }, [quantity, foodName]);

    useEffect(() => {
        if (!foods.length) return;

        const counts: any = {};

        foods.forEach((f) => {
            counts[f.name] = (counts[f.name] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5);

        setFrequentFoods(sorted.map((s: any) => s[0]));
    }, [foods]);

    return (
        <ScrollView
        style={{ flex: 1, backgroundColor: '#F2F2F7' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
        {/* 🔥 MAIN CARD */}
        <View style={[styles.card, { marginTop: 50 }]}>
            <View style={{ marginBottom: 10 }}>
                <Text style={styles.title}>{t.calories}</Text>

                <Text style={styles.subtitle}>
                    {t.trackCalories}
                </Text>
            </View>

            {/* RESULT */}
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={styles.bigNumber}>{tdee ?? '--'}</Text>
            <Text style={styles.label}>TDEE</Text>

            <Text style={[styles.bigNumber, { color: '#FF3B30' }]}>
                {target ?? '--'}
            </Text>
            <Text style={styles.label}>{t.target}</Text>

            <Text style={{ fontSize: 18, marginTop: 10 }}>
                🍽 {t.eaten}: {eaten}
            </Text>

            <Text style={{ fontSize: 18 }}>
                🔥 {t.remaining}: {remaining() ?? '--'}
            </Text>
            </View>

            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.dropdown}>
                {expanded ? '▲ ' + t.hide : '▼ ' + t.calculateEdit}
            </Text>
            </TouchableOpacity>

            {expanded && (
            <View style={{ marginTop: 15 }}>
                <TextInput
                placeholder="Weight"
                value={weight}
                onChangeText={setWeight}
                style={styles.input}
                />

                <TextInput
                placeholder="Height"
                value={height}
                onChangeText={setHeight}
                style={styles.input}
                />

                <TextInput
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                style={styles.input}
                />

                <TouchableOpacity style={styles.btn} onPress={calculate}>
                <Text style={styles.btnText}>Save & Calculate</Text>
                </TouchableOpacity>
            </View>
            )}
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>
                🤖 Describe Your Meal
            </Text>

            <TextInput
                placeholder="ex: homemade beef noodle soup"
                value={aiMeal}
                onChangeText={setAiMeal}
                style={styles.input}
                multiline
            />

            <TouchableOpacity
                style={styles.btn}
                onPress={estimateCaloriesAI}
            >
                <Text style={styles.btnText}>
                    {aiLoading
                        ? 'Estimating...'
                        : '✨ Estimate Calories'}
                </Text>
            </TouchableOpacity>

            {aiResponse ? (
                <View
                    style={{
                        marginTop: 16,
                        backgroundColor: '#F2F2F7',
                        borderRadius: 16,
                        padding: 14,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '700',
                            marginBottom: 10,
                        }}
                    >
                        🤖 AI Analysis
                    </Text>

                    <ScrollView
                        style={{
                            maxHeight: 180,
                        }}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        <Text
                            style={{
                                fontSize: 15,
                                lineHeight: 24,
                                color: '#333',
                            }}
                        >
                            {aiResponse}
                        </Text>
                    </ScrollView>
                </View>
            ) : null}
        </View>

        {/* 🍱 FOOD INPUT */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.addFood}</Text>

            <TextInput
            placeholder={t.foodName}
            value={foodName}
            onChangeText={(text) => {
                setFoodName(text);

                if (!text) {
                    setSuggestions([]);
                    return;
                }

                const filtered = FOOD_DB.filter((f) =>
                    f.name.toLowerCase().includes(text.toLowerCase())
                ).slice(0, 5);

                setSuggestions(filtered);
                setShowSuggestions(true);
            }}
            style={styles.input}
            />

            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                    {suggestions.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                        setFoodName(item.name);
                        setFoodCalories(String(Math.round(item.calories * qty)));
                        setShowSuggestions(false);
                        }}
                    >
                        <Text>
                        {item.name} ({item.calories} kcal)
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
            )}

            <TextInput
                placeholder={t.quantity}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
            placeholder={t.foodCalories}
            value={foodCalories}
            onChangeText={setFoodCalories}
            keyboardType="numeric"
            style={styles.input}
            />

            <TouchableOpacity style={styles.btn} onPress={addFood}>
            <Text style={styles.btnText}>+ Add Food</Text>
            </TouchableOpacity>
        </View>

        <View
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: -5,
            }}
            >
            {frequentFoods.map((f, index) => (
                <TouchableOpacity
                key={index}
                style={styles.foodChip}
                onPress={() => {
                    setFoodName(f);

                    const found = FOOD_DB.find((x) => x.name === f);

                    if (found) {
                    setFoodCalories(String(found.calories));
                    }
                }}
                >
                <Text style={styles.foodChipText}>{f}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* 📋 FOOD LIST */}
        <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>{t.todayFoods}</Text>

            {foods.map((item) => (
            <View key={item.id} style={styles.row}>
                <Text>
                {item.name} × {item.quantity} - {item.calories} kcal
                </Text>

                <TouchableOpacity onPress={() => deleteFood(item.id)}>
                <Text style={{ color: '#FF3B30' }}>Delete</Text>
                </TouchableOpacity>
            </View>
            ))}

            {!foods.length && (
            <Text style={{ color: '#999' }}>{t.noFood}</Text>
            )}
        </View>
        </ScrollView>
    );
    }
