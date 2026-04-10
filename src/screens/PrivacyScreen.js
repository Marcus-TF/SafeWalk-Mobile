import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function PrivacyScreen() {
  const [high, setHigh] = useState(true);
  const [medium, setMedium] = useState(true);
  const [low, setLow] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertas de Segurança</Text>

      <View style={styles.item}>
        <Text>Alto risco</Text>
        <Switch value={high} onValueChange={setHigh} />
      </View>

      <View style={styles.item}>
        <Text>Médio risco</Text>
        <Switch value={medium} onValueChange={setMedium} />
      </View>

      <View style={styles.item}>
        <Text>Baixo risco</Text>
        <Switch value={low} onValueChange={setLow} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, marginBottom: 20 },
  item: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }
});