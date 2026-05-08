# 📱 Weight Tracker App

A modern **weight loss & calorie tracking app** built with **Expo (React Native)** and **Firebase**, featuring:

* ⚖️ Weight tracking
* 🔥 Calorie management
* 📈 Interactive charts
* ☁️ Real-time cloud sync
* 🌍 English / Chinese support

> ⚠️ Currently optimized for **iOS and Web only**. Android is not supported yet.

---

# ✨ Features

## ⚖️ Weight Tracking

* Daily weight logging
* Edit & delete entries
* Weight history list
* Goal weight tracking
* Weekly average calculation
* Consecutive logging streak system

## 📈 Interactive Chart

* Weekly / Monthly views
* Swipe gesture navigation
* Goal line visualization
* Tap chart points for details

## 🔥 Calorie Tracking

* TDEE calculator
* Daily calorie target
* Remaining calorie calculation
* Food logging system
* Smart food suggestions
* Frequently eaten foods shortcuts

## ☁️ Firebase Integration

* Real-time Firestore sync
* Persistent cloud storage
* User-specific data separation
* Auto authentication state handling

## 🌍 Bilingual Support

* English / Chinese toggle
* Persistent language selection
* Shared translation system

## 👤 Account System

* User profile management
* Goal weight setup
* Diet level preferences
* Language preferences

---

# 🛠 Tech Stack

* **Frontend:** Expo + React Native
* **Routing:** Expo Router
* **Backend:** Firebase

  * Firestore
  * Firebase Authentication
* **Charts:** react-native-chart-kit
* **Gestures:** react-native-gesture-handler
* **Storage:** AsyncStorage
* **Haptics:** expo-haptics

---

# 📂 Project Structure

```bash
app/
  (tabs)/
    home.tsx         # Weight tracking screen
    calories.tsx     # Calories & food tracker
    account.tsx      # Account settings

  index.tsx          # Auth redirect
  login.tsx          # Login screen

components/
  WeightChart.tsx    # Interactive weight chart

css/
  indexStyles.ts
  weightChartStyles.ts

constants/
  food.ts            # Food database

translations.ts      # Language dictionary

firebase.ts          # Firebase config
```

---

# 🌍 Translation System

The app uses a lightweight custom bilingual system:

```ts
const t = translations[lang];
```

Features:

* Shared translation dictionary
* Component-level language support
* Persistent language saving using AsyncStorage

Supported languages:

* English 🇺🇸
* 中文 🇨🇳

---

# 🔥 Main Screens

## 🏠 Home

* Weight tracking
* Progress chart
* Goal tracking
* Insights & streaks

## 🍱 Calories

* TDEE calculator
* Daily calorie tracking
* Food logging
* Smart food recommendations

## 👤 Account

* User profile
* Goal settings
* Diet preferences
* Language settings

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

---

# 🚀 Getting Started

## 1. Install dependencies

```bash
npm install
```

---

## 2. Start the app

```bash
npx expo start
```

---

## 3. Run on

* iOS Simulator 🍎
* Web Browser 🌐

> Android is currently unsupported.

---

# 📊 Firebase Structure

```bash
users/
  uid/
    profile/
    daily/
    weights/
    foods/
```

---

# 🎯 Future Improvements

* Apple Health integration
* Dark mode
* Better chart animations
* AI food recognition
* Barcode scanning
* Nutrition breakdown
* Data export (CSV / PDF)

---

# 👤 Author

Rong Wei

GitHub:
[Rose-Wei10](https://github.com/Rose-Wei10?utm_source=chatgpt.com)
