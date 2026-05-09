# Weight Tracker App

A modern AI-powered weight loss and calorie tracking app built with Expo, React Native, and Firebase.

This app helps users:
- Track weight progress
- Visualize trends with charts
- Calculate calorie targets
- Log foods and meals
- Estimate meal calories using AI
- Switch between English and Chinese
- Sync data in real-time with Firebase

> ⚠️ Currently optimized for **iOS and Web only**. Android support is not implemented yet.

---

# ✨ Features

## 📈 Weight Tracking
- Daily weight logging
- Edit & delete entries
- Weight history timeline
- Weekly/monthly chart view
- Goal progress tracking
- Streak tracking
- Weekly average insights

## 🍱 Calories Tracker
- TDEE & calorie target calculator
- Daily calorie tracking
- Food logging system
- Frequent foods quick-add
- Remaining calories calculation

## 🤖 AI Meal Estimation
Describe your meal naturally and AI estimates calories automatically.

Examples:
- "Homemade beef noodle soup"
- "Chicken curry with rice"
- "2 eggs and avocado toast"

The AI:
- Estimates calories
- Generates short meal analysis
- Autofills calorie inputs

Powered by OpenRouter AI API.

---

## 🌍 Bilingual Support
- English 🇺🇸
- Chinese 中文 🇨🇳

Language preference is:
- Stored locally
- Synced to Firebase account

---

## ☁️ Cloud Sync
Using Firebase Firestore for:
- Real-time syncing
- Persistent user data
- Multi-device support

---

## 🔐 Authentication
Powered by Firebase Authentication.

Supports:
- Email login
- Persistent sessions

---

# 🛠 Tech Stack

- React Native
- Expo Router
- Firebase
- Firestore
- Expo Haptics
- React Native Chart Kit
- OpenRouter AI

---

# 📱 Screens

## Home
- Weight tracking
- Progress chart
- Goal tracking
- Insights & streaks

## Calories
- TDEE calculator
- Food logging
- AI calorie estimation
- Daily intake tracking

## Account
- User profile
- Goal weight
- Height & DOB
- Language switching
- Weight loss intensity selection

---

# 📂 Project Structure

```bash
app/
 ├── (tabs)/
 │    ├── home.tsx
 │    ├── calories.tsx
 │    ├── account.tsx
 │
 ├── login.tsx
 └── index.tsx

components/
 └── WeightChart.tsx

context/
 └── LanguageContext.tsx

css/
 ├── accountStyles.ts
 ├── caloriesStyles.ts
 ├── indexStyles.ts
 └── weightChartStyles.ts

constants/
 └── food.ts

translations.ts
firebase.ts
```

---

# 🚀 Getting Started

## 1. Clone repository

```bash
git clone https://github.com/Rose-Wei10/weight-tracker-app.git
```

## 2. Install dependencies

```bash
npm install
```

---

## 3. Setup Firebase

Create a Firebase project.

Enable:
- Authentication
- Firestore Database

Then create:

```bash
firebase.ts
```

and add your Firebase config.

---

## 4. Setup AI API Key

Create:

```bash
.env
```

Add:

```env
EXPO_PUBLIC_OPENROUTER_API_KEY=your_api_key_here
```

Get API key from OpenRouter.

---

## 5. Start project

```bash
npx expo start
```

---

# 📌 Notes

- Designed mainly for personal weight-loss tracking
- Uses real-time Firestore syncing
- AI calorie estimates are approximate only
- iOS & Web focused
- Android support planned later

---

# 🔮 Planned Features

- AI food photo recognition
- Better nutrition analytics
- Weekly reports
- Dark mode
- HealthKit integration
- Smarter AI coaching
- Macro tracking
- Push notifications

---

# 👩‍💻 Author

Created by Rose Wei