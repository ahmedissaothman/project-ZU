// src/screens/orders/OrderListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const OrderCard = ({ order }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <View style={[globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.textPrimary}>Order #{order.id}</Text>
        <Text style={{ color: COLORS.success }}>${order.total_amount}</Text>
      </View>
      <Text style={globalStyles.textSecondary}>Customer: {order.customer_name}</Text>
      <Text style={globalStyles.textSecondary}>Status: {order.order_status}</Text>
      <Text style={globalStyles.textSmall}>
        {new Date(order.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View style={{ padding: 16 }}>
        <Text style={globalStyles.header}>Orders</Text>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('CreateOrder')}
        >
          <Text style={globalStyles.buttonText}>Create New Order</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchOrders} />
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default OrderListScreen;