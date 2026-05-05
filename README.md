# 📱 Weight Tracker App

A simple cross-platform (iOS + Web) weight tracking app built with **Expo + React Native + Firebase**.

---

## ✨ Features

* 📊 Track daily weight
* ☁️ Real-time sync with Firebase
* 👤 Anonymous user authentication
* 📈 Weight history chart
* 🎯 Goal tracking
* 📉 Weekly average calculation

---

## 🛠 Tech Stack

* React Native (Expo)
* Firebase (Firestore + Auth)
* react-native-chart-kit

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/weight-tracker-app.git
cd weight-tracker-app
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup Firebase

Go to: https://console.firebase.google.com/

1. Create a project
2. Add a **Web App**
3. Copy Firebase config

Update `firebase.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};
```

---

### 4. Enable Firebase services

#### Authentication

* Go to **Authentication → Sign-in method**
* Enable **Anonymous**

#### Firestore

* Go to **Firestore Database**
* Create database (test mode)

---

### 5. Run the app

```bash
npx expo start
```

* Press `i` → iOS simulator
* Press `w` → Web
* Or scan QR with Expo Go

---

## 📂 Project Structure

```
app/
  (tabs)/
    index.tsx   # main screen
firebase.js     # firebase config
```

---

## 🔐 Notes

* Firebase config is required for the app to run
* Each user’s data is stored separately using Firebase Auth

---

## 📸 Screenshots

*Add your app screenshots here*

---

## 🚀 Future Improvements

* Google / Apple login
* Edit & delete entries
* Better UI/UX
* Dark mode

---

## 👤 Author

Your Name
GitHub: https://github.com/YOUR_USERNAME
