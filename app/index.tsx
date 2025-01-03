import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

const Home = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to GigiPOS</Text>
      <Link href="/pos" style={{ backgroundColor: '#000080', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Go to POS</Text>
      </Link>
    </View>
  );
};

export default Home;
