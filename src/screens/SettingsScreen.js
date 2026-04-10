import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { authAPI, userAPI } from '../services/api';

const getPasswordStrength = (password) => {
  if (!password) return { label: '', width: '0%', color: '#E5E7EB' };
  if (password.length < 6) return { label: 'Fraca', width: '33%', color: '#EF4444' };
  if (password.length < 10) return { label: 'Média', width: '66%', color: '#F59E0B' };
  return { label: 'Forte', width: '100%', color: '#10B981' };
};

export default function SettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    notifyHigh: false,
    notifyMedium: false,
    notifyLow: false,
  });

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const isPasswordValid = !form.password || (form.password.length >= 6 && form.password === form.confirmPassword);

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await userAPI.findById();
      setUser(currentUser);
      setForm({
        id: currentUser.id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        password: '',
        confirmPassword: '',
        notifyHigh: !!currentUser.notifyHigh,
        notifyMedium: !!currentUser.notifyMedium,
        notifyLow: !!currentUser.notifyLow,
      });
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadUser);
    loadUser();
    return unsubscribe;
  }, [navigation]);

  const handleCancel = () => {
    if (!user) return;
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      notifyHigh: !!user.notifyHigh,
      notifyMedium: !!user.notifyMedium,
      notifyLow: !!user.notifyLow,
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Erro', 'Nome e e-mail são obrigatórios');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Erro', 'Senha inválida ou não confere');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: form.id,
        name: form.name.trim(),
        email: form.email.trim(),
        notifyHigh: form.notifyHigh,
        notifyMedium: form.notifyMedium,
        notifyLow: form.notifyLow,
      };
      if (form.password) payload.password = form.password;
      const savedUser = await userAPI.update(payload);
      setUser(savedUser);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1800);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAlertSetting = async (field) => {
    const updated = { ...form, [field]: !form[field] };
    setForm(updated);
    try {
      const payload = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        notifyHigh: updated.notifyHigh,
        notifyMedium: updated.notifyMedium,
        notifyLow: updated.notifyLow,
      };
      if (updated.password) payload.password = updated.password;
      const savedUser = await userAPI.update(payload);
      setUser(savedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert('Excluir conta', 'Deseja realmente excluir sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await userAPI.delete();
            await authAPI.logout();
            navigation.replace('Login');
          } catch (err) {
            Alert.alert('Erro', err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Conta</Text>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.headerAction}>Editar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButtonSmall} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveButtonSmallText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButtonSmall} onPress={handleCancel}>
                <Text style={styles.cancelButtonSmallText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!editing ? (
          <>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </>
        ) : (
          <>
            <TextInput style={styles.input} value={form.name} onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))} placeholder="Nome" />
            <TextInput style={styles.input} value={form.email} onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" />
            <Text style={styles.passwordLabel}>Alterar senha</Text>
            <TextInput style={styles.input} value={form.password} onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))} placeholder="Nova senha" secureTextEntry />
            {form.password ? (
              <View style={styles.passwordStrengthWrap}>
                <View style={styles.passwordTrack}><View style={[styles.passwordFill, { width: passwordStrength.width, backgroundColor: passwordStrength.color }]} /></View>
                <Text style={styles.passwordHelp}>Força: {passwordStrength.label}</Text>
              </View>
            ) : null}
            <TextInput style={styles.input} value={form.confirmPassword} onChangeText={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))} placeholder="Confirmar senha" secureTextEntry />
            {form.password && form.confirmPassword && form.password !== form.confirmPassword ? (
              <Text style={styles.validationError}>As senhas não conferem</Text>
            ) : null}
            {form.password && form.password.length < 6 ? (
              <Text style={styles.validationError}>Mínimo de 6 caracteres</Text>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Alertas de Segurança</Text>
        <AlertItem label="Alto risco" value={form.notifyHigh} onValueChange={() => toggleAlertSetting('notifyHigh')} />
        <AlertItem label="Médio risco" value={form.notifyMedium} onValueChange={() => toggleAlertSetting('notifyMedium')} />
        <AlertItem label="Baixo risco" value={form.notifyLow} onValueChange={() => toggleAlertSetting('notifyLow')} />
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Excluir conta</Text>
        </TouchableOpacity>
      </View>

      {success ? <View style={styles.successToast}><Text style={styles.successToastText}>Alterações salvas com sucesso</Text></View> : null}
    </ScrollView>
  );
}

function AlertItem({ label, value, onValueChange }) {
  return (
    <View style={styles.alertRow}>
      <Text style={styles.alertLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#D1D5DB', true: '#2563EB' }} thumbColor="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, marginBottom: 16, elevation: 2, shadowColor: '#111827', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerAction: { color: '#1E3A8A', fontWeight: '700' },
  editActions: { flexDirection: 'row', gap: 8 },
  saveButtonSmall: { backgroundColor: '#16A34A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  saveButtonSmallText: { color: '#FFFFFF', fontWeight: '700' },
  cancelButtonSmall: { backgroundColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  cancelButtonSmallText: { color: '#111827', fontWeight: '700' },
  profileName: { color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileEmail: { color: '#6B7280' },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: '#D1D5DB', paddingHorizontal: 14, fontSize: 16, color: '#111827', marginBottom: 12 },
  passwordLabel: { fontWeight: '700', color: '#6B7280', marginBottom: 8, marginTop: 6 },
  passwordStrengthWrap: { marginBottom: 12 },
  passwordTrack: { height: 8, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  passwordFill: { height: 8, borderRadius: 999 },
  passwordHelp: { color: '#6B7280', fontSize: 12, marginTop: 6 },
  validationError: { color: '#DC2626', marginBottom: 10 },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  alertLabel: { color: '#374151', fontSize: 15 },
  deleteButton: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: '#FECACA', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2' },
  deleteButtonText: { color: '#DC2626', fontWeight: '700' },
  successToast: { position: 'absolute', left: 16, right: 16, bottom: 20, backgroundColor: '#16A34A', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  successToastText: { color: '#FFFFFF', fontWeight: '700' },
});
