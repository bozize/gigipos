import React from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function SalesScreen() {
  // Redirect to inventory overview which handles sales
  return <Redirect href="/inventory" />;
}
