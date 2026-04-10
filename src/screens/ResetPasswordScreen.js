import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { passwordAPI } from '../services/api';

export default function ResetPasswordScreen({ navigation, route }) {
  const [token, setToken] = useState(route.params?.token || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token || !password) {
      Alert.alert('Erro', 'Preencha token e nova senha');
      return;
    }

    setLoading(true);
    try {
      await passwordAPI.reset(token, password);
      Alert.alert('Sucesso', 'Senha redefinida com sucesso', [{ text: 'OK', onPress: () => navigation.replace('Login') }]);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redefinir senha</Text>
      <TextInput style={styles.input} placeholder="Token" value={token} onChangeText={setToken} placeholderTextColor="#9CA3AF" />
      <TextInput style={styles.input} placeholder="Nova senha" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#9CA3AF" />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Redefinir senha</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A8A', justifyContent: 'center', padding: 24 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14, minHeight: 52, paddingHorizontal: 16, marginBottom: 14, fontSize: 16 },
  button: { backgroundColor: '#2563EB', borderRadius: 14, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
