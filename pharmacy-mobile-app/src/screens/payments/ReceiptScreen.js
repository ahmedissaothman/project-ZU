// src/screens/payments/ReceiptScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import api from '../../config/api';

const ReceiptScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, []);

  const fetchReceipt = async () => {
    try {
      const response = await api.get('/payments/receipts');
      const orderReceipts = response.data.filter(r => r.order_id === orderId);
      setReceipt(orderReceipts[0]);
    } catch (error) {
      console.error('Error fetching receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.loading}>
        <Text>Loading receipt...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Receipt</Text>
      
      <View style={globalStyles.card}>
        <Text style={globalStyles.textPrimary}>Pharmacy Receipt</Text>
        <Text style={globalStyles.textSecondary}>Order #{orderId}</Text>
        <Text style={globalStyles.textSecondary}>Amount: ${receipt?.amount}</Text>
        <Text style={globalStyles.textSecondary}>Method: {receipt?.payment_method}</Text>
        <Text style={globalStyles.textSmall}>
          Date: {new Date(receipt?.created_at).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={globalStyles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ReceiptScreen;