// src/screens/reports/SalesReportScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const SalesReportScreen = ({ navigation }) => {
  const [reportData, setReportData] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/reports/sales?period=${period}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const periods = ['daily', 'weekly', 'monthly', 'yearly'];

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Sales Report</Text>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {periods.map(p => (
          <TouchableOpacity
            key={p}
            style={[
              { flex: 1, padding: 8, margin: 2, borderRadius: 4 },
              period === p ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.border }
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[
              { textAlign: 'center', textTransform: 'capitalize' },
              period === p ? { color: 'white' } : { color: COLORS.text }
            ]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {reportData && (
        <>
          <View style={globalStyles.card}>
            <Text style={globalStyles.textPrimary}>Total Sales: ${reportData.total_sales}</Text>
            <Text style={globalStyles.textSecondary}>Orders: {reportData.total_orders}</Text>
            <Text style={globalStyles.textSecondary}>Customers: {reportData.total_customers}</Text>
            <Text style={globalStyles.textSecondary}>Avg Order: ${reportData.average_order_value}</Text>
          </View>

          {reportData.top_medicines && (
            <>
              <Text style={globalStyles.subHeader}>Top Medicines</Text>
              {reportData.top_medicines.map((medicine, index) => (
                <View key={index} style={globalStyles.card}>
                  <Text style={globalStyles.textPrimary}>{medicine.medicine_name}</Text>
                  <Text style={globalStyles.textSecondary}>Sold: {medicine.quantity_sold}</Text>
                  <Text style={globalStyles.textSecondary}>Revenue: ${medicine.revenue}</Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default SalesReportScreen;