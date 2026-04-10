import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { occurrenceAPI } from '../services/api';

export default function RegisterOccurrenceScreen({ navigation, route }) {
  const isEditing = !!route.params?.item;
  const editingData = route.params?.item;

  const [type, setType] = useState(isEditing ? editingData.type : 'Assalto');
  const [risk, setRisk] = useState(isEditing ? editingData.risk : 'Médio');
  const [description, setDescription] = useState(isEditing ? editingData.description : '');
  const [isAnonymous, setIsAnonymous] = useState(isEditing ? editingData.anonymous : false);
  const [locationName, setLocationName] = useState(isEditing ? editingData.location : '');
  
  const [latitude, setLatitude] = useState(isEditing ? editingData.latitude : null);
  const [longitude, setLongitude] = useState(isEditing ? editingData.longitude : null);
  const [loading, setLoading] = useState(false);

  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      setLocationName(data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.city || 'Local Automático');
    } catch {}
  };

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lng = loc.coords.longitude;
    setLatitude(lat);
    setLongitude(lng);
    await fetchAddress(lat, lng);
  };

  const handleSubmit = async () => {
    if (!type || !description || !latitude) {
      Alert.alert('Erro', 'Preencha a descrição e defina o local no mapa.');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { type, risk, description, anonymous: isAnonymous, latitude, longitude, location: locationName || 'Local não mapeado' };
      if (isEditing) {
        await occurrenceAPI.update(editingData.id, payload);
      } else {
        await occurrenceAPI.create(payload);
      }
      Alert.alert('Sucesso', 'Registro processado e comunicado à comunidade.', [
        { text: 'Finalizar', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a ocorrência.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.base}>
      {/* Dark Slate Web Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.brandText}>{isEditing ? "Editar Registro" : "Nova Ocorrência"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Tipo de Perigo</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
              {['Assalto','Furto','Roubo de Veículo','Vandalismo','Pessoa Suspeita','Iluminação Precária','Área Deserta','Outro'].map((t) => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Nível de Risco</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={risk} onValueChange={setRisk} style={styles.picker}>
              {['Baixo', 'Médio', 'Alto'].map((t) => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o que aconteceu em detalhes..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Localização (Endereço Aproximado)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f1f5f9', color: '#64748b' }]}
            value={locationName}
            editable={false}
            placeholder="Clique no mapa abaixo ou use o GPS"
          />
        </View>

        <View style={styles.switchWrapper}>
          <Text style={styles.switchLabel}>Registrar de forma anônima</Text>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ false: '#cbd5e1', true: '#60a5fa' }} thumbColor={isAnonymous ? '#2563eb' : '#f8fafc'} />
        </View>

        <TouchableOpacity style={styles.gpsBtn} onPress={getUserLocation}>
          <Ionicons name="locate" size={20} color="#2563eb" />
          <Text style={styles.gpsBtnText}>Usar localização atual do satélite</Text>
        </TouchableOpacity>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{ latitude: latitude || -3.7319, longitude: longitude || -38.5267, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
            onPress={(e) => {
              setLatitude(e.nativeEvent.coordinate.latitude);
              setLongitude(e.nativeEvent.coordinate.longitude);
              fetchAddress(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
            }}
          >
            {latitude && longitude && (
              <Marker coordinate={{ latitude, longitude }}>
                <Ionicons name="location" size={40} color="#dc2626" />
              </Marker>
            )}
          </MapView>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="send" size={20} color="#ffffff" style={{marginRight: 8}}/>
                <Text style={styles.submitText}>Transmitir Ocorrência</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#f8fafc' },
  topHeader: { backgroundColor: '#020617', flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, zIndex: 10 },
  backBtn: { marginRight: 16 },
  brandText: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  
  scrollContent: { padding: 24 },
  
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  pickerContainer: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, backgroundColor: '#ffffff', overflow: 'hidden' },
  picker: { height: 50, color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a', backgroundColor: '#ffffff' },
  textArea: { minHeight: 100 },
  
  switchWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 20 },
  switchLabel: { fontSize: 16, fontWeight: '500', color: '#334155' },
  
  gpsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff', borderRadius: 12, marginBottom: 16 },
  gpsBtnText: { color: '#2563eb', fontWeight: 'bold', marginLeft: 8 },

  mapContainer: { height: 250, borderRadius: 16, overflow: 'hidden', marginBottom: 30, borderWidth: 1, borderColor: '#e2e8f0' },
  map: { flex: 1 },
  
  submitButton: { backgroundColor: '#2563eb', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8, marginBottom: 40 },
  submitText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});