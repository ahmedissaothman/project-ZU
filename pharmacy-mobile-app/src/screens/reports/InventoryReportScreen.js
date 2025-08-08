// src/screens/reports/InventoryReportScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const InventoryReportScreen = ({ navigation }) => {
  const [inventoryData, setInventoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInventoryReport();
  }, []);

  const fetchInventoryReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reports/inventory');
      setInventoryData(response.data);
    } catch (error) {
      console.error('Error fetching inventory report:', error);
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
      <Text style={globalStyles.header}>Inventory Report</Text>

      {inventoryData && (
        <>
          <View style={globalStyles.card}>
            <Text style={globalStyles.textPrimary}>Total Medicines: {inventoryData.total_medicines}</Text>
            <Text style={globalStyles.textSecondary}>Total Batches: {inventoryData.total_batches}</Text>
            <Text style={[globalStyles.textSecondary, { color: COLORS.error }]}>
              Low Stock Items: {inventoryData.low_stock_items}
            </Text>
            <Text style={[globalStyles.textSecondary, { color: COLORS.warning }]}>
              Expiring Soon: {inventoryData.expiring_soon}
            </Text>
            <Text style={[globalStyles.textSecondary, { color: COLORS.success }]}>
              Total Value: ${inventoryData.total_inventory_value}
            </Text>
          </View>

          {inventoryData.categories && (
            <>
              <Text style={globalStyles.subHeader}>By Category</Text>
              {inventoryData.categories.map((category, index) => (
                <View key={index} style={globalStyles.card}>
                  <Text style={globalStyles.textPrimary}>{category.category_name}</Text>
                  <Text style={globalStyles.textSecondary}>Items: {category.total_items}</Text>
                  <Text style={globalStyles.textSecondary}>Value: ${category.total_value}</Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default InventoryReportScreen;