// src/screens/medicines/MedicineDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const MedicineDetailScreen = ({ route, navigation }) => {
  const { medicineId } = route.params;
  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMedicineDetail();
  }, []);

  const fetchMedicineDetail = async () => {
    try {
      const [medicineResponse, batchesResponse] = await Promise.all([
        api.get(`/medicines/${medicineId}`),
        api.get('/medicines/batches/all')
      ]);
      
      setMedicine(medicineResponse.data);
      setBatches(batchesResponse.data.filter(b => b.medicine_id === medicineId));
    } catch (error) {
      console.error('Error fetching medicine details:', error);
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
      <Text style={globalStyles.header}>{medicine?.name}</Text>
      <View style={globalStyles.card}>
        <Text style={globalStyles.textPrimary}>Form: {medicine?.dosage_form}</Text>
        <Text style={globalStyles.textPrimary}>Strength: {medicine?.strength}</Text>
        <Text style={globalStyles.textSecondary}>Category: {medicine?.category_name}</Text>
        <Text style={globalStyles.textSecondary}>Manufacturer: {medicine?.company_name}</Text>
        {medicine?.requires_prescription && (
          <Text style={[globalStyles.textSecondary, { color: COLORS.warning }]}>
            Prescription Required
          </Text>
        )}
      </View>

      <Text style={globalStyles.subHeader}>Available Batches</Text>
      {batches.map(batch => (
        <View key={batch.id} style={globalStyles.card}>
          <Text style={globalStyles.textPrimary}>Batch: {batch.batch_number}</Text>
          <Text style={globalStyles.textSecondary}>Stock: {batch.quantity} units</Text>
          <Text style={globalStyles.textSecondary}>Price: ${batch.selling_price}</Text>
          <Text style={globalStyles.textSecondary}>Expires: {batch.expiry_date}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('CreateOrder', { medicineId })}
      >
        <Text style={globalStyles.buttonText}>Add to Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MedicineDetailScreen;