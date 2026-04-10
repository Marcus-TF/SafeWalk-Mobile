import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { occurrenceAPI } from '../services/api';

export default function OccurrencesScreen({ navigation }) {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadOccurrences);
    loadOccurrences();
    return unsubscribe;
  }, [navigation]);

  const loadOccurrences = async () => {
    setLoading(true);
    try {
      const data = await occurrenceAPI.getMy();
      setOccurrences(data);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await occurrenceAPI.getMy();
      setOccurrences(data);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir ocorrência', 'Deseja realmente excluir esta ocorrência?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await occurrenceAPI.delete(id);
            setOccurrences((prev) => prev.filter((item) => item.id !== id));
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
    <View style={styles.base}>
      {/* Dark Slate Minimal Header */}
      <View style={styles.topHeader}>
        <Text style={styles.brandText}>Meus Registros</Text>
      </View>
      <View style={styles.container}>
      <FlatList
        data={occurrences}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={occurrences.length === 0 ? styles.emptyContent : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="warning-outline" size={56} color="#EF4444" />
            <Text style={styles.emptyTitle}>Nenhuma ocorrência encontrada</Text>
            <Text style={styles.emptySubtitle}>Quando você registrar uma ocorrência, ela aparecerá aqui.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.type}>{item.type}</Text>
              <RiskBadge risk={item.risk} />
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.metaRow}><Ionicons name="location-outline" size={16} color="#6B7280" /><Text style={styles.metaText}>{item.location}</Text></View>
            <View style={styles.metaRow}><Ionicons name="calendar-outline" size={16} color="#6B7280" /><Text style={styles.metaText}>{formatDate(item.createdAt)}</Text></View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('RegisterOccurrence', { occurrence: item })}>
                <Ionicons name="create-outline" size={18} color="#1E3A8A" />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                <Text style={[styles.actionText, { color: '#DC2626' }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      </View>
    </View>
  );
}

function RiskBadge({ risk }) {
  const map = {
    Alto: { bg: '#FEE2E2', color: '#B91C1C', text: 'Alto Risco' },
    Médio: { bg: '#FEF3C7', color: '#B45309', text: 'Médio Risco' },
    Baixo: { bg: '#DCFCE7', color: '#15803D', text: 'Baixo Risco' },
  };
  const item = map[risk] || map.Baixo;
  return <Text style={[styles.badge, { backgroundColor: item.bg, color: item.color }]}>{item.text}</Text>;
}

const formatDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR');
};

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f8fafc' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, zIndex: 10 },
  brandText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16 },
  emptyContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  emptyWrap: { alignItems: 'center' },
  emptyTitle: { marginTop: 14, fontSize: 20, fontWeight: '700', color: '#111827' },
  emptySubtitle: { marginTop: 8, color: '#6B7280', textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 14, elevation: 2, shadowColor: '#111827', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 },
  type: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontWeight: '700', fontSize: 12 },
  description: { color: '#374151', lineHeight: 22, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaText: { marginLeft: 6, color: '#6B7280', flex: 1 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionButton: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: '#EFF6FF' },
  deleteButton: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  actionText: { marginLeft: 6, color: '#1E3A8A', fontWeight: '700' },
});
