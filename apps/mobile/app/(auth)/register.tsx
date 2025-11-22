import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { api } from '@/services/api';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  display_name: z.string().min(1, 'Display name is required').max(50, 'Display name is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      phone_number: '',
      display_name: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.register(data);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone_number: data.phone_number },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join 3-Chat</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Controller
        control={control}
        name="display_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              placeholderTextColor="#666"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.display_name && (
              <Text style={styles.fieldError}>{errors.display_name.message}</Text>
            )}
          </View>
        )}
      />

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
        name="phone_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (+1234567890)"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.phone_number && (
              <Text style={styles.fieldError}>{errors.phone_number.message}</Text>
            )}
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
        <Text style={styles.buttonText}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
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
    fontSize: 36,
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
