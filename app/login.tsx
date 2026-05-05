import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ✅ LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email.trim(), password);

      console.log('✅ Logged in');

      // 🔥 IMPORTANT: redirect to home
      router.replace('/');
    } catch (e: any) {
      console.log(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REGISTER
  const handleRegister = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(auth, email.trim(), password);

      console.log('✅ Registered');

      // 🔥 IMPORTANT: redirect after register
      router.replace('/');
    } catch (e: any) {
      console.log(e);

      // nicer messages
      if (e.code === 'auth/email-already-in-use') {
        alert('Email already registered. Try logging in.');
      } else if (e.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters.');
      } else {
        alert(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Tracker</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.text}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#34A853' }]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.text}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f7fb',
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});