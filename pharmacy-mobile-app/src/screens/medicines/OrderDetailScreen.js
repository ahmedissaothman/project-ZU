// src/screens/orders/OrderDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const fetchOrderDetail = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Order #{order?.id}</Text>
      
      <View style={globalStyles.card}>
        <Text style={globalStyles.textPrimary}>Customer: {order?.customer_name}</Text>
        <Text style={globalStyles.textPrimary}>Total: ${order?.total_amount}</Text>
        <Text style={globalStyles.textSecondary}>Status: {order?.order_status}</Text>
        <Text style={globalStyles.textSecondary}>Payment: {order?.payment_status}</Text>
        <Text style={globalStyles.textSmall}>
          Created: {new Date(order?.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={globalStyles.subHeader}>Order Items</Text>
      {order?.items?.map(item => (
        <View key={item.id} style={globalStyles.card}>
          <Text style={globalStyles.textPrimary}>{item.medicine_name}</Text>
          <Text style={globalStyles.textSecondary}>Quantity: {item.quantity}</Text>
          <Text style={globalStyles.textSecondary}>Price: ${item.unit_price}</Text>
          <Text style={globalStyles.textSecondary}>Batch: {item.batch_number}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('Payment', { orderId: order.id })}
      >
        <Text style={globalStyles.buttonText}>Process Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default OrderDetailScreen;