import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { passwordAPI } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email) return setError('Por favor, informe seu e-mail');
    if (!email.includes('@')) return setError('E-mail inválido');

    setLoading(true);
    try {
      await passwordAPI.forgot(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.title}>SafeWalk</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color="#1E3A8A" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          {success ? (
            <>
              <Ionicons name="checkmark-circle" size={54} color="#16A34A" style={{ alignSelf: 'center', marginBottom: 12 }} />
              <Text style={styles.cardTitle}>E-mail enviado</Text>
              <Text style={styles.cardDescription}>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('Login')}>
                <Text style={styles.primaryButtonText}>Voltar para o login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Esqueceu sua senha?</Text>
              <Text style={styles.cardDescription}>Digite seu e-mail e enviaremos instruções para redefinir sua senha.</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.label}>E-mail cadastrado</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Enviar instruções</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A8A' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 34, fontWeight: '800', color: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backText: { color: '#1E3A8A', fontWeight: '600', marginLeft: 6 },
  cardTitle: { fontSize: 28, fontWeight: '800', color: '#1E3A8A', marginBottom: 10 },
  cardDescription: { color: '#6B7280', lineHeight: 22, marginBottom: 18 },
  errorText: { color: '#DC2626', marginBottom: 12 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 14, paddingHorizontal: 14, minHeight: 52, marginBottom: 18 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  primaryButton: { backgroundColor: '#1E3A8A', borderRadius: 14, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
