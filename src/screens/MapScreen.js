import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Vibration, Animated, Platform } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { occurrenceAPI } from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const FORTALEZA_REGION = { latitude: -3.7319, longitude: -38.5267, latitudeDelta: 0.08, longitudeDelta: 0.08 };

const getRiskColor = (risk) => {
  if (risk === 'Alto') return 'red';
  if (risk === 'Médio') return 'orange';
  if (risk === 'Baixo') return 'green';
  return 'gray';
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default function MapScreen({ navigation }) {
  const [occurrences, setOccurrences] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [alertedIds, setAlertedIds] = useState(new Set());
  const [activeAlerts, setActiveAlerts] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    requestPermissionsAndTrack();
    loadData();
    return unsubscribe;
  }, [navigation]);

  const requestPermissionsAndTrack = async () => {
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: notifStatus } = await Notifications.requestPermissionsAsync();

    if (locStatus !== 'granted') return;

    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (location) => {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        setUserLocation({ latitude: lat, longitude: lng });

        setOccurrences((prevOccurrences) => {
          const nearby = [];
          prevOccurrences.forEach((occ) => {
            if (getDistance(lat, lng, occ.latitude, occ.longitude) < 0.25) nearby.push(occ);
          });
          
          if (nearby.length > 0) {
            setActiveAlerts(nearby);
          }

          let newAlertTriggered = false;

          nearby.forEach((occ) => {
            setAlertedIds((prev) => {
              if (!prev.has(occ.id)) {
                
                Vibration.vibrate([200, 100, 200, 100, 400]);

                if (notifStatus === 'granted') {
                  Notifications.scheduleNotificationAsync({
                    content: {
                      title: "⚠️ Área de Risco Detectada",
                      body: `Ocorrência próxima: ${occ.type} (${occ.risk} Risco). Fique atento!`,
                      sound: true,
                    },
                    trigger: null,
                  });
                }
                
                newAlertTriggered = true;
                const newSet = new Set(prev);
                newSet.add(occ.id);
                return newSet;
              }
              return prev;
            });
          });

          if (newAlertTriggered) {
            showToast();
          }

          return prevOccurrences;
        });
      }
    );
  };

  const showToast = () => {
    fadeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(5000), 
      Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start(() => setActiveAlerts([])); 
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await occurrenceAPI.getAll();
      setOccurrences(data);
      const hotspotsData = await occurrenceAPI.getHotspots();
      setHotspots(hotspotsData);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const initialRegion = useMemo(() => userLocation ? { ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 } : FORTALEZA_REGION, [userLocation]);

  return (
    <View style={styles.base}>
      <View style={styles.topHeader}>
        <Text style={styles.brandText}>Zonas de Calor Mapeadas</Text>
      </View>

      <View style={styles.container}>
        {loading && !hotspots.length ? (
          <View style={styles.centered}><ActivityIndicator size="large" color="#ea580c" /></View>
        ) : (
        <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation>
          {hotspots.map((hotspot) => (
            <React.Fragment key={`hotspot-${hotspot.id}`}>
              <Marker
                coordinate={{ latitude: hotspot.latitude, longitude: hotspot.longitude }}
                pinColor={getRiskColor(hotspot.risk)}
                onPress={() => setSelectedHotspot(hotspot)}
              />
              <Circle
                center={{ latitude: hotspot.latitude, longitude: hotspot.longitude }}
                radius={200}
                fillColor={getRiskColor(hotspot.risk) === 'red' ? 'rgba(239,68,68,0.25)' : getRiskColor(hotspot.risk) === 'orange' ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}
                strokeColor={getRiskColor(hotspot.risk) === 'red' ? 'rgba(239,68,68,0.5)' : getRiskColor(hotspot.risk) === 'orange' ? 'rgba(245,158,11,0.5)' : 'rgba(34,197,94,0.5)'}
              />
            </React.Fragment>
          ))}
        </MapView>
      )}

      <Animated.View style={[
          styles.alertBanner, 
          { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
          { borderTopColor: activeAlerts[0]?.risk === 'Alto' ? '#ef4444' : '#f59e0b' }
      ]}>
        {activeAlerts.length > 0 && (
          <>
            <Ionicons name="warning" size={28} color={activeAlerts[0]?.risk === 'Alto' ? '#ef4444' : '#f59e0b'} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.alertTitle}>Alerta Ativo!</Text>
              <Text style={styles.alertText}>Você está dentro do raio de 250m de ocorrência de {activeAlerts[0]?.type} ({activeAlerts[0]?.risk} Risco).</Text>
            </View>
          </>
        )}
      </Animated.View>

      <View style={styles.legend}>
        <LegendDot color="#ef4444" label="Alto Risco" />
        <LegendDot color="#f59e0b" label="Médio Risco" />
        <LegendDot color="#22c55e" label="Baixo Risco" />
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('RegisterOccurrence')} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={!!selectedHotspot} transparent animationType="fade" onRequestClose={() => setSelectedHotspot(null)}>
        <View style={styles.modalOverlay}>
           <View style={styles.modalCard}>
             <View style={styles.modalHeaderLine}>
                 <Text style={styles.modalTitle}>Cluster Consolidado</Text>
                 <TouchableOpacity onPress={() => setSelectedHotspot(null)}>
                     <Ionicons name="close-circle" size={28} color="#9ca3af" />
                 </TouchableOpacity>
             </View>
             <Text style={styles.modalDescription}>Ameaça Predominante: <Text style={{fontWeight: '700', color: getRiskColor(selectedHotspot?.risk)}}>{selectedHotspot?.risk}</Text></Text>
             <Text style={styles.modalSubHeader}>Ocorrências Densas Agrupadas: {selectedHotspot?.occurrencesList?.length}</Text>
             <TouchableOpacity style={styles.modalButton} onPress={() => setSelectedHotspot(null)}>
               <Text style={styles.modalButtonText}>Entendido</Text>
             </TouchableOpacity>
           </View>
         </View>
      </Modal>
      </View>
    </View>
  );
}

function LegendDot({ color, label }) {
  return (
    <View style={styles.legendItem}>
       <View style={[styles.legendDot, { backgroundColor: color }]} />
       <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f8fafc' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, zIndex: 10 },
  brandText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  map: { flex: 1 },
  legend: { position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  legendText: { fontSize: 13, color: '#334155', fontWeight: '700' },
  fab: { position: 'absolute', right: 24, bottom: 96, width: 64, height: 64, borderRadius: 32, backgroundColor: '#ea580c', alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#ea580c', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2, 6, 23, 0.5)' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, shadowColor: '#000', elevation: 24 },
  modalHeaderLine: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  modalDescription: { color: '#475569', fontSize: 16, marginBottom: 8 },
  modalSubHeader: { fontWeight: '600', color: '#1e293b', marginTop: 8, marginBottom: 24, fontSize: 15 },
  modalButton: { backgroundColor: '#ea580c', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#ea580c', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset:{width:0, height:4} },
  modalButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  alertBanner: { position: 'absolute', top: 20, left: 20, right: 20, backgroundColor: 'white', borderRadius: 16, padding: 20, borderTopWidth: 6, elevation: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: {height: 8, width: 0}, flexDirection: 'row', alignItems: 'flex-start' },
  alertTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  alertText: { fontSize: 14, color: '#475569', marginTop: 4, lineHeight: 20 },
});
