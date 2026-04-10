import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setTimeout(() => {
        navigation.replace(token ? 'MainTabs' : 'Login');
      }, 1800);
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark-outline" size={100} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.title}>SafeWalk</Text>
      <Text style={styles.subtitle}>Segurança em cada passo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 16,
  },
});
