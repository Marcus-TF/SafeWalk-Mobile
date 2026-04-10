import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI, userAPI } from '../services/api';

export default function SettingsScreen({ navigation }) {
  const [user, setUser] = useState({ name: '', email: '' });
  const [notifyHigh, setNotifyHigh] = useState(true);
  const [notifyMedium, setNotifyMedium] = useState(false);
  const [notifyLow, setNotifyLow] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const u = await authAPI.getCurrentUser();
      if (u) {
        setUser({ name: u.name, email: u.email });
        setNotifyHigh(u.notifyHigh ?? true);
        setNotifyMedium(u.notifyMedium ?? false);
        setNotifyLow(u.notifyLow ?? false);
      }
    } catch (e) {}
  };

  const handleToggle = async (key, value) => {
    if (key === 'high') setNotifyHigh(value);
    if (key === 'medium') setNotifyMedium(value);
    if (key === 'low') setNotifyLow(value);
  };

  const handleDelete = () => {
    Alert.alert('Excluir conta', 'Tem certeza que deseja excluir sua conta permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await userAPI.delete();
            navigation.replace('Login');
          } catch (e) {
            Alert.alert('Erro', e.message);
          }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.base}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.brandText}>Configurações</Text>
      </View>
      <View style={styles.container}>
        
        {/* Account Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="person-outline" size={20} color="#111827" />
              <Text style={styles.cardTitle}>Conta</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="pencil-outline" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Alerts Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitleNoIcon}>Alertas de Segurança</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Alto risco</Text>
            <Switch value={notifyHigh} onValueChange={(v) => handleToggle('high', v)} trackColor={{ false: '#cbd5e1', true: '#ea580c' }} thumbColor="#fff" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Médio risco</Text>
            <Switch value={notifyMedium} onValueChange={(v) => handleToggle('medium', v)} trackColor={{ false: '#cbd5e1', true: '#ea580c' }} thumbColor="#fff" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Baixo risco</Text>
            <Switch value={notifyLow} onValueChange={(v) => handleToggle('low', v)} trackColor={{ false: '#cbd5e1', true: '#ea580c' }} thumbColor="#fff" />
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteCard} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
          <Text style={styles.deleteText}>Excluir conta</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f3f4f6' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, zIndex: 10 },
  backButton: { marginRight: 16, padding: 4 },
  brandText: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  container: { padding: 16, gap: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#111827', marginLeft: 8 },
  cardTitleNoIcon: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 20 },
  userName: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#6b7280' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  switchLabel: { fontSize: 15, color: '#4b5563' },
  deleteCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#fca5a5', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  deleteText: { color: '#dc2626', fontWeight: '600', fontSize: 16, marginLeft: 8 }
});
