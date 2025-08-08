// src/screens/orders/CreateOrderScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import api from '../../config/api';

const CreateOrderScreen = ({ navigation }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const createOrder = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add items to the order');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        customer_id: 1, // Default customer for demo
        items: selectedItems,
        discount: 0
      };

      await api.post('/orders', orderData);
      Alert.alert('Success', 'Order created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Create New Order</Text>
      
      <View style={globalStyles.card}>
        <Text style={globalStyles.textPrimary}>Order Items: {selectedItems.length}</Text>
        <Text style={globalStyles.textSecondary}>
          Total: $
          {selectedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('MedicineList')}
      >
        <Text style={globalStyles.buttonText}>Add Medicines</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: '#4CAF50' }]}
        onPress={createOrder}
        disabled={isLoading || selectedItems.length === 0}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? 'Creating...' : 'Create Order'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateOrderScreen;