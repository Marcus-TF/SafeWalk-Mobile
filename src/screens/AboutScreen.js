import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.base}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.brandText}>Sobre</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Ionicons name="shield-checkmark" size={48} color="#ffffff" />
            <View style={styles.heroTitleBox}>
              <Text style={styles.heroTitle}>SafeWalk</Text>
              <Text style={styles.heroSubtitle}>Segurança em cada passo</Text>
            </View>
          </View>
          <Text style={styles.heroText}>O SafeWalk é uma plataforma colaborativa para registro e visualização de ocorrências urbanas. O objetivo é ajudar pessoas a tomarem decisões mais seguras no dia a dia, com base em alertas, histórico de ocorrências e compartilhamento de informação em tempo real.</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como funciona</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>Usuários registram ocorrências com localização e nível de risco.</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>O mapa consolida os registros para visualização rápida.</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>As notificações podem ser personalizadas conforme o perfil do usuário.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f3f4f6' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, zIndex: 10 },
  backButton: { marginRight: 16, padding: 4 },
  brandText: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  container: { padding: 16 },
  heroCard: { backgroundColor: '#1e3a8a', borderRadius: 24, padding: 24, marginBottom: 16, elevation: 4, shadowColor: '#1e3a8a', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  heroTitleBox: { flex: 1, marginLeft: 16 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  heroSubtitle: { color: '#bfdbfe', fontSize: 14, marginTop: 4 },
  heroText: { color: '#eff6ff', fontSize: 15, lineHeight: 24 },
  infoCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  bulletPoint: { fontSize: 16, color: '#4b5563', marginRight: 8, fontWeight: 'bold' },
  bulletText: { flex: 1, fontSize: 15, color: '#4b5563', lineHeight: 22 },
});