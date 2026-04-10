import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const data = await authAPI.getCurrentUser();
    setUser(data);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchUser);
    fetchUser();
    return unsub;
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja sair do SafeWalk?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
          await authAPI.logout();
          navigation.replace('Login');
        } 
      }
    ]);
  };

  if (!user) return <View style={styles.base} />;

  return (
    <View style={styles.base}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Massive Dark Header - Moved INSIDE ScrollView for Native Android Avatar Overlap */}
        <View style={styles.topHeader}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" style={{ opacity: 0 }} /> 
          <Text style={styles.headerTitle}>Perfil</Text>
          <Ionicons name="settings" size={24} color="#ffffff" style={{ opacity: 0 }} />
        </View>
        
        <View style={styles.overlapContainer}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
               <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase() || 'M'}</Text>
            </View>
          <Text style={styles.nameText}>{user.name}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
             <View style={[styles.menuIcon, {backgroundColor: '#eff6ff'}]}><Ionicons name="person-outline" color="#3b82f6" size={20}/></View>
             <Text style={styles.menuText}>Editar Perfil</Text>
             <Ionicons name="chevron-forward" color="#cbd5e1" size={20}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Aviso', 'Notificações estão ativas por padrão pelo Expo Geofence.')}>
             <View style={[styles.menuIcon, {backgroundColor: '#fef9c3'}]}><Ionicons name="notifications-outline" color="#eab308" size={20}/></View>
             <Text style={styles.menuText}>Notificações de Alerta</Text>
             <Ionicons name="chevron-forward" color="#cbd5e1" size={20}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
             <View style={[styles.menuIcon, {backgroundColor: '#f4f4f5'}]}><Ionicons name="help-circle-outline" color="#71717a" size={20}/></View>
             <Text style={styles.menuText}>Ajuda</Text>
             <Ionicons name="chevron-forward" color="#cbd5e1" size={20}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Sobre', 'SafeWalk v1.0.0')}>
             <View style={[styles.menuIcon, {backgroundColor: '#f3f4f6'}]}><Ionicons name="information-circle-outline" color="#6b7280" size={20}/></View>
             <Text style={styles.menuText}>Sobre</Text>
             <Ionicons name="chevron-forward" color="#cbd5e1" size={20}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemNoBorder} onPress={handleLogout}>
             <View style={[styles.menuIcon, {backgroundColor: '#fef2f2'}]}><Ionicons name="log-out-outline" color="#ef4444" size={20}/></View>
             <Text style={[styles.menuText, {color: '#ef4444'}]}>Sair</Text>
          </TouchableOpacity>
        </View>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f4f4f5' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 140, paddingHorizontal: 24, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 0, zIndex: 0 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  
  scrollContent: { paddingBottom: 40 },
  overlapContainer: { paddingHorizontal: 24 },
  
  avatarSection: { alignItems: 'center', marginTop: -95, marginBottom: 30, zIndex: 10 },
  avatarWrapper: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8, borderWidth: 4, borderColor: '#f4f4f5', marginBottom: 16 },
  avatarInitial: { fontSize: 40, fontWeight: '800', color: '#0f172a' },
  nameText: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  emailText: { fontSize: 13, color: '#64748b', marginTop: 4 },
  
  menuCard: { backgroundColor: '#ffffff', borderRadius: 24, paddingVertical: 8, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuItemNoBorder: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#334155' },
});