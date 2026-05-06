# 📱 Weight Tracker App

A clean, modern **weight tracking app** built with **Expo (React Native)** and **Firebase**, supporting **real-time sync** and **bilingual (English / 中文)** UI.

> ⚠️ This app is currently supported for **iOS and Web only**. Android is not supported.

---

## ✨ Features

* 🔐 **Authentication (Firebase Auth)**

  * Anonymous login
  * Auto session persistence

* ⚖️ **Daily Weight Tracking**

  * Log weight once per day
  * Edit and delete entries
  * Prevent duplicate daily entries

* 📊 **Real-time Sync (Firestore)**

  * Instant updates across sessions/devices
  * No manual refresh needed

* 📈 **Interactive Chart**

  * Weekly / Monthly view
  * Swipe to navigate time ranges
  * Goal line visualization
  * Tap points to view exact values

* 🎯 **Goal Tracking**

  * Set and update goal weight
  * Progress percentage calculation

* 🔥 **Streak System**

  * Tracks consecutive logging days

* 📊 **Insights**

  * Total weight change (gain/loss)
  * Weekly average
  * Total tracked days

* 🌍 **Bilingual Support**

  * English / Chinese toggle
  * Persistent language preference

---

## 🛠 Tech Stack

* **Frontend:** Expo + React Native
* **Routing:** Expo Router
* **Backend:** Firebase

  * Authentication
  * Firestore (real-time database)
* **Charts:** react-native-chart-kit
* **Gestures:** react-native-gesture-handler
* **Storage:** AsyncStorage

---

## 📂 Project Structure

```bash
app/
  (tabs)/
    index.tsx           # Main screen
  _layout.tsx           # Auth routing

components/
  WeightChart.tsx       # Chart component

css/
  indexStyles.ts        # Styles for main screen
  weightChartStyles.ts  # Styles for chart

translations.ts         # Language dictionary
firebase.ts             # Firebase config
```

---

## 🌍 Language System

The app uses a lightweight custom translation system:

* Centralized in `translations.ts`
* Language state managed in main screen
* Passed down via props to components
* Stored locally using AsyncStorage

Example:

```ts
const t = translations[lang];
<Text>{t.weight}</Text>
```

---

## ⚙️ Environment Variables

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

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npx expo start
```

### 3. Run on:

* iOS Simulator 🍎
* Web 🌐

> Android is not supported.

---

## 📌 Key Design Decisions

* Uses **real-time listeners (`onSnapshot`)** instead of manual fetch
* Keeps **single source of truth for language state**
* Separates **UI styles into dedicated files**
* Avoids heavy i18n libraries for simplicity

---

## 🚀 Future Improvements

* Dark mode
* Export data (CSV / Apple Health)
* Better chart styling (dashed goal line, animations)
* Multi-language expansion
* Account linking (Google / Apple)

---

## 👤 Author

Rong Wei
GitHub: https://github.com/Rose-Wei10/
