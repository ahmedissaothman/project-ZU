import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const ManagerDashboard = ({ navigation }) => {
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [salesResponse, inventoryResponse] = await Promise.all([
        api.get('/reports/sales?period=daily'),
        api.get('/reports/inventory'),
      ]);
      setSalesData(salesResponse.data);
      setInventoryData(inventoryResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { title: 'Sales Reports', screen: 'SalesReport', color: COLORS.success },
    { title: 'Inventory Report', screen: 'InventoryReport', color: COLORS.info },
    { title: 'Medicine Management', screen: 'MedicineList', color: COLORS.primary },
    { title: 'Order Management', screen: 'OrderList', color: COLORS.secondary },
    { title: 'Notifications', screen: 'Notifications', color: COLORS.warning },
    { title: 'Profile', screen: 'Profile', color: COLORS.text },
  ];

  const StatCard = ({ title, value, subtitle, color }) => (
    <View style={[globalStyles.card, styles.statCard]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={globalStyles.textSmall}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Sales Overview */}
      <Text style={globalStyles.subHeader}>Today's Overview</Text>
      <View style={styles.statsRow}>
        <StatCard
          title="Total Sales"
          value={salesData?.total_sales || '$0'}
          subtitle="Today"
          color={COLORS.success}
        />
        <StatCard
          title="Orders"
          value={salesData?.total_orders || '0'}
          subtitle="Today"
          color={COLORS.primary}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Customers"
          value={salesData?.total_customers || '0'}
          subtitle="Today"
          color={COLORS.secondary}
        />
        <StatCard
          title="Avg Order"
          value={salesData?.average_order_value || '$0'}
          subtitle="Today"
          color={COLORS.info}
        />
      </View>

      {/* Inventory Overview */}
      <Text style={globalStyles.subHeader}>Inventory Status</Text>
      <View style={styles.statsRow}>
        <StatCard
          title="Total Items"
          value={inventoryData?.total_medicines || '0'}
          subtitle="In stock"
          color={COLORS.text}
        />
        <StatCard
          title="Low Stock"
          value={inventoryData?.low_stock_items || '0'}
          subtitle="Need attention"
          color={COLORS.error}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Expiring Soon"
          value={inventoryData?.expiring_soon || '0'}
          subtitle="Next 30 days"
          color={COLORS.warning}
        />
        <StatCard
          title="Total Value"
          value={inventoryData?.total_inventory_value || '$0'}
          subtitle="Inventory worth"
          color={COLORS.success}
        />
      </View>

      {/* Quick Actions */}
      <Text style={globalStyles.subHeader}>Quick Actions</Text>
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
  },
  welcome: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: COLORS.error,
    borderRadius: 4,
  },
  logoutText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  menuText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ManagerDashboard;