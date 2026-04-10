import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { occurrenceAPI, authAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ total: 0, highRisk: 0, myReports: 0 });
  const [load, setLoad] = useState(true);
  const [userName, setUserName] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoad(true);
      const all = await occurrenceAPI.getAll();
      const me = await occurrenceAPI.getMy();
      const user = await authAPI.getCurrentUser();
      
      setUserName(user?.name?.split(' ')[0] || 'Usuário');
      const high = all.filter((o) => o.risk === 'Alto').length;

      setStats({
        total: all.length,
        highRisk: high,
        myReports: me.length,
      });
    } catch (e) {
      console.log('Error fetch', e);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchDashboard);
    fetchDashboard();
    return unsub;
  }, [navigation]);

  return (
    <View style={styles.base}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={load} onRefresh={fetchDashboard} colors={['#2563eb']} tintColor="#2563eb" progressViewOffset={40} />}
        showsVerticalScrollIndicator={false}
        >
        
        {/* Massive Dark Slate Header - Now inside ScrollView to ensure Z-Overlap */}
        <View style={styles.topHeader}>
            <View style={styles.headerTopRow}>
                <View style={styles.brandRow}>
                    <Ionicons name="shield-checkmark" size={32} color="#ffffff" />
                    <Text style={styles.brandText}>SafeWalk</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn}>
                        <Ionicons name="person-circle" size={28} color="#ffffff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { authAPI.logout(); navigation.replace('Login'); }} style={styles.iconBtn}>
                        <Ionicons name="log-out" size={28} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <Text style={styles.welcomeText}>Olá, {userName}!</Text>
        </View>

        <View style={styles.overlapContainer}>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={() => navigation.navigate('Occurrences')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#f1f5f9' }]}>
                <Ionicons name="layers" size={26} color="#334155" />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Registradas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={() => navigation.navigate('Map')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="alert" size={26} color="#dc2626" />
            </View>
            <Text style={styles.statValue}>{stats.highRisk}</Text>
            <Text style={styles.statLabel}>Alto Risco</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={() => navigation.navigate('Occurrences')}>
            <View style={[styles.iconWrapper, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="document-text" size={26} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>{stats.myReports}</Text>
            <Text style={styles.statLabel}>Reportes</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RegisterOccurrence')} activeOpacity={0.8}>
            <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Emergência?</Text>
                <Text style={styles.actionDesc}>Registre uma ocorrência rápida na comunidade.</Text>
            </View>
            <View style={[styles.actionIconContainer, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="warning" size={32} color="#dc2626" />
            </View>
        </TouchableOpacity>

        <View style={styles.dualCardContainer}>
            <TouchableOpacity style={styles.dualCard} onPress={() => navigation.navigate('Map')} activeOpacity={0.8}>
                <View style={[styles.dualIconWrapper, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="map" size={28} color="#2563eb" />
                </View>
                <Text style={styles.dualTitle}>Ver Mapa</Text>
                <Text style={styles.dualDesc}>Zonas seguras</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dualCard} onPress={() => navigation.navigate('Occurrences')} activeOpacity={0.8}>
                <View style={[styles.dualIconWrapper, { backgroundColor: '#f1f5f9' }]}>
                    <Ionicons name="list" size={28} color="#334155" />
                </View>
                <Text style={styles.dualTitle}>Histórico</Text>
                <Text style={styles.dualDesc}>Meus registros</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.footerBranding}>
            <Ionicons name="shield-checkmark" size={40} color="#cbd5e1" />
            <Text style={styles.footerTitle}>SAFEWALK</Text>
            <Text style={styles.footerDesc}>Sua segurança em primeiro lugar</Text>
        </View>
        </View>

        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f8fafc' },
  topHeader: { backgroundColor: '#020617', paddingTop: 60, paddingBottom: 110, paddingHorizontal: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 0, zIndex: 0 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandText: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginLeft: 10 },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
  welcomeText: { fontSize: 16, color: '#f8fafc', fontWeight: '500', opacity: 0.9 },
  
  scrollContent: { paddingBottom: 40 },
  overlapContainer: { marginTop: -70, paddingHorizontal: 24, zIndex: 10 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '31%', backgroundColor: '#ffffff', padding: 16, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 8, alignItems: 'center' },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textAlign: 'center', marginTop: 4 },

  actionCard: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 24, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8, marginBottom: 16 },
  actionTextContainer: { flex: 1, paddingRight: 10 },
  actionTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  actionDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  actionIconContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },

  dualCardContainer: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30},
  dualCard: { width: '48%', backgroundColor: '#ffffff', padding: 24, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 6 },
  dualIconWrapper: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  dualTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  dualDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  footerBranding: { alignItems: 'center', marginTop: 40, opacity: 0.7 },
  footerTitle: { fontSize: 14, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, marginTop: 8 },
  footerDesc: { fontSize: 11, color: '#94a3b8', marginTop: 2 }
});
