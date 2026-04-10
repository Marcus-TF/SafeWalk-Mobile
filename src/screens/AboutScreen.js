import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobre o SafeWalk</Text>

      <Text style={styles.text}>
        O SafeWalk é um aplicativo colaborativo que permite
        usuários reportarem ocorrências e melhorarem a segurança urbana.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  text: { fontSize: 14 }
});