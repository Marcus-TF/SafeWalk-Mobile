import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
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
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await occurrenceAPI.delete(id);
            setOccurrences((prev) => prev.filter((item) => item.id !== id));
          } catch (err) {
            Alert.alert('Erro', err.message);
          }
        }
      },
    ]);
  };

  const renderIcon = (risk) => {
    return (
      <View style={[styles.iconBox, { backgroundColor: risk === 'Alto' ? '#fee2e2' : risk === 'Médio' ? '#fef3c7' : '#dcfce7' }]}>
        <Ionicons name="warning-outline" size={24} color={risk === 'Alto' ? '#dc2626' : risk === 'Médio' ? '#d97706' : '#16a34a'} />
      </View>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#ea580c" /></View>;

  return (
    <SafeAreaView style={styles.base}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.brandText}>Meus Registros</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={occurrences}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={occurrences.length === 0 ? styles.emptyContent : styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                {renderIcon(item.risk)}
                <View style={styles.titleCol}>
                  <Text style={styles.type}>{item.type}</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
                <RiskBadge risk={item.risk} />
              </View>
              <Text style={styles.description}>{item.description}</Text>
              
              <View style={styles.cardBottom}>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={16} color="#ea580c" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('RegisterOccurrence', { occurrence: item })}>
                    <Ionicons name="pencil" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#fca5a5" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function RiskBadge({ risk }) {
  const map = {
    Alto: { bg: '#fee2e2', color: '#b91c1c', text: 'Alto Risco' },
    Médio: { bg: '#fef3c7', color: '#b45309', text: 'Médio Risco' },
    Baixo: { bg: '#dcfce7', color: '#15803D', text: 'Baixo Risco' },
  };
  const item = map[risk] || map.Baixo;
  return <View style={[styles.badgeContainer, { backgroundColor: item.bg }]}><Text style={[styles.badgeText, { color: item.color }]}>{item.text}</Text></View>;
}

const formatDate = (value) => new Date(value).toLocaleDateString('pt-BR');

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f3f4f6' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, zIndex: 10 },
  backButton: { marginRight: 16, padding: 4 },
  brandText: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  titleCol: { flex: 1, justifyContent: 'center' },
  type: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#6b7280' },
  badgeContainer: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: '700', fontSize: 11 },
  description: { color: '#4b5563', fontSize: 15, lineHeight: 22, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  locationText: { color: '#6b7280', fontSize: 14 },
  actionsRow: { flexDirection: 'row', gap: 16 },
  actionBtn: { padding: 4 }
});
