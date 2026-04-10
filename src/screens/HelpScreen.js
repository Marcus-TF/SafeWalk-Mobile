import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.base}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.brandText}>Ajuda</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Suporte do aplicativo</Text>
          <Text style={styles.desc}>Em caso de dúvida, problema de acesso ou suporte técnico, entre em contato com a equipe do SafeWalk.</Text>
          <TouchableOpacity 
            style={styles.emailBox} 
            onPress={() => Linking.openURL('mailto:safewalk.app.br@gmail.com')}
          >
            <Ionicons name="mail-outline" size={24} color="#1e3a8a" />
            <Text style={styles.emailText}>safewalk.app.br@gmail.com</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f3f4f6' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, zIndex: 10 },
  backButton: { marginRight: 16, padding: 4 },
  brandText: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  container: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  desc: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 24 },
  emailBox: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  emailText: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 15, marginLeft: 12 }
});