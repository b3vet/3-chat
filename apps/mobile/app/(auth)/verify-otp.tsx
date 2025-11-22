import { router, useLocalSearchParams } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { api } from '@/services/api';
import { authTokenAtom, userAtom } from '@/stores/userStore';

export default function VerifyOTPScreen() {
  const { phone_number } = useLocalSearchParams<{ phone_number: string }>();
  const [otp, setOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuthToken = useSetAtom(authTokenAtom);
  const setUser = useSetAtom(userAtom);

  const onVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.verifyOTP(phone_number, otp);
      setAuthToken(response.access_token);
      setUser(response.user);
      router.replace('/(tabs)/chats');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Phone</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone_number}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.otpInput}
        placeholder="000000"
        placeholderTextColor="#666"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOTP}
        textAlign="center"
      />

      <Pressable style={styles.button} onPress={onVerify} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
      </Pressable>

      <Pressable style={styles.linkButton}>
        <Text style={styles.linkText}>Resend code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
  },
  otpInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    letterSpacing: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 24,
    padding: 8,
  },
  linkText: {
    color: '#6366f1',
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
});
