import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suporte</Text>
      <Text style={styles.text}>
        Caso precise de ajuda, entre em contato:
      </Text>

      <Text style={styles.email}>
        safewalk.app.br@gmail.com
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  text: { fontSize: 14 },
  email: { marginTop: 10, fontWeight: 'bold' }
});