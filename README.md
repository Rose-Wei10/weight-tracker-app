# 📱 Weight Tracker App

A simple, clean, and real-time **weight tracking app** built with **Expo (React Native)** and **Firebase**.

> ⚠️ **Note:** This app is currently supported for **iOS and Web only**. Android is not supported at this time.

---

## ✨ Features

* 🔐 **Authentication (Firebase Auth)**

  * Email & password login / registration 
  * Persistent session with auto-redirect 

* ⚖️ **Daily Weight Tracking**

  * Log weight once per day
  * Prevent duplicate entries for the same date 

* 📊 **Real-time Sync (Firestore)**

  * All data updates instantly across sessions/devices
  * Uses `onSnapshot` listeners for live updates 

* 📈 **Interactive Weight Chart**

  * Weekly & monthly views
  * Swipe to navigate time ranges
  * Tap points to view exact values 

* 🎯 **Goal Tracking**

  * Set and update your goal weight
  * Automatically calculates % progress 

* 🔥 **Streak System**

  * Tracks consecutive days of logging

* 📊 **Insights**

  * Weight change summary
  * Weekly average
  * Total tracking days

* 📱 **Haptic Feedback**

  * Subtle vibration when saving weight

---

## 🛠 Tech Stack

* **Frontend:** Expo + React Native
* **Routing:** Expo Router
* **Backend:** Firebase

  * Authentication
  * Firestore (database)
* **Charts:** react-native-chart-kit
* **Gestures:** react-native-gesture-handler

---

## 📂 Project Structure

```
app/
 ├── (tabs)/
 │    └── index.tsx        # Main home screen (tracking + insights)
 ├── login.tsx             # Login & register screen
 ├── _layout.tsx           # Auth-based routing
components/
 └── WeightChart.tsx       # Chart component
firebase.ts                # Firebase config
```

---

## 🔥 Core Logic Highlights

### Auth Flow

* Uses `onAuthStateChanged` to detect login state
* Automatically switches between:

  * Logged-out → Login screen
  * Logged-in → Main app 

### Weight Logging

* Stores data under:

```
users/{userId}/weights
```

* Each entry:

```
{
  weight: number,
  date: "YYYY-MM-DD",
  createdAt: timestamp
}
```

### Goal Storage

* Stored at:

```
users/{userId}
```

* Uses Firestore `setDoc` with merge

---

## ⚙️ Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Used in: `firebase.ts` 

---

## 🚀 Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Start the app

```
npx expo start
```

### 3. Run on:

* iOS Simulator 🍎
* Web 🌐

> Android is not supported currently.

---

## 📌 Future Improvements

* Edit existing weight entries
* Better error handling (some alerts are currently minimal)
* Dark mode support
* Export data (CSV / health apps)

---

## 🧠 Notes

* The app uses **real-time listeners**, so no manual refresh is needed
* Data is scoped per user via Firebase Auth UID
* UI is optimized for simplicity and fast daily logging

---

## 📄 License

MIT

---

## 👤 Author

Built by Rong Wei 
