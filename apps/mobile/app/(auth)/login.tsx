import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { api } from '@/services/api';
import { authTokenAtom, userAtom } from '@/stores/userStore';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuthToken = useSetAtom(authTokenAtom);
  const setUser = useSetAtom(userAtom);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.login(data.username, data.password);

      // Manually save token to SecureStore to ensure it's persisted before navigation
      await SecureStore.setItemAsync('authToken', response.access_token);
      await SecureStore.setItemAsync('refreshToken', response.refresh_token);

      // Update atoms after tokens are saved
      setAuthToken(response.access_token);
      setUser(response.user);

      router.replace('/(tabs)/chats');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>3-Chat</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#666"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.username && <Text style={styles.fieldError}>{errors.username.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
          </View>
        )}
      />

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
      </Pressable>

      <Link href="/(auth)/register" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Don&apos;t have an account? Register</Text>
        </Pressable>
      </Link>
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
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
  fieldError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});
