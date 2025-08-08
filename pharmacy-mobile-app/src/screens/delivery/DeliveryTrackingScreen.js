// src/screens/delivery/DeliveryTrackingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const DeliveryTrackingScreen = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/deliveries');
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const DeliveryCard = ({ delivery }) => (
    <View style={globalStyles.card}>
      <Text style={globalStyles.textPrimary}>Order #{delivery.order_id}</Text>
      <Text style={globalStyles.textSecondary}>Status: {delivery.status}</Text>
      <Text style={globalStyles.textSecondary}>Customer: {delivery.customer_name}</Text>
      <Text style={globalStyles.textSecondary}>Delivery Person: {delivery.delivery_person_name}</Text>
      <Text style={globalStyles.textSmall}>Address: {delivery.delivery_address}</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={{ padding: 16 }}>
        <Text style={globalStyles.header}>Delivery Tracking</Text>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DeliveryCard delivery={item} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default DeliveryTrackingScreen;