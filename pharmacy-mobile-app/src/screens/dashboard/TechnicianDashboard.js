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

const TechnicianDashboard = ({ navigation }) => {
  const [todayOrders, setTodayOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ordersResponse, batchesResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/medicines/batches/all'),
      ]);
      
      // Filter today's orders
      const today = new Date().toISOString().split('T')[0];
      const todaysOrders = ordersResponse.data.filter(order => 
        order.created_at.startsWith(today)
      );
      setTodayOrders(todaysOrders);

      // Filter low stock items (quantity < 10)
      const lowStock = batchesResponse.data.filter(batch => batch.quantity < 10);
      setLowStockItems(lowStock);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { title: 'Scan Barcode', screen: 'BarcodeScanner', color: COLORS.primary },
    { title: 'New Order', screen: 'CreateOrder', color: COLORS.success },
    { title: 'Register Customer', screen: 'CustomerRegistration', color: COLORS.info },
    { title: 'Medicine List', screen: 'MedicineList', color: COLORS.secondary },
    { title: 'Add Medicine', screen: 'AddMedicine', color: COLORS.warning },
    { title: 'Chat', screen: 'ChatList', color: COLORS.text },
  ];

  const QuickActionCard = ({ title, screen, color }) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: color }]}
      onPress={() => navigation.navigate(screen)}
    >
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  const OrderCard = ({ order }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <View style={[globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.textPrimary}>Order #{order.id}</Text>
        <Text style={[styles.status, { color: getStatusColor(order.order_status) }]}>
          {order.order_status}
        </Text>
      </View>
      <Text style={globalStyles.textSecondary}>
        Customer: {order.customer_name}
      </Text>
      <Text style={globalStyles.textSecondary}>
        Total: ${order.total_amount}
      </Text>
    </TouchableOpacity>
  );

  const StockCard = ({ item }) => (
    <View style={[globalStyles.card, styles.alertCard]}>
      <Text style={globalStyles.textPrimary}>{item.medicine_name}</Text>
      <Text style={styles.alertText}>
        Low stock: {item.quantity} units remaining
      </Text>
      <Text style={globalStyles.textSmall}>
        Batch: {item.batch_number}
      </Text>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return COLORS.warning;
      case 'DELIVERED': return COLORS.success;
      case 'CANCELLED': return COLORS.error;
      default: return COLORS.text;
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.role}>Technician Pharmacist</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={globalStyles.subHeader}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </View>

      {/* Today's Orders */}
      <Text style={globalStyles.subHeader}>Today's Orders ({todayOrders.length})</Text>
      {todayOrders.length > 0 ? (
        todayOrders.slice(0, 3).map(order => (
          <OrderCard key={order.id} order={order} />
        ))
      ) : (
        <View style={globalStyles.card}>
          <Text style={globalStyles.textSecondary}>No orders today</Text>
        </View>
      )}

      {todayOrders.length > 3 && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('OrderList')}
        >
          <Text style={styles.viewAllText}>View All Orders</Text>
        </TouchableOpacity>
      )}

      {/* Stock Alerts */}
      {lowStockItems.length > 0 && (
        <>
          <Text style={globalStyles.subHeader}>Stock Alerts ({lowStockItems.length})</Text>
          {lowStockItems.slice(0, 3).map(item => (
            <StockCard key={item.id} item={item} />
          ))}
          {lowStockItems.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('InventoryReport')}
            >
              <Text style={styles.viewAllText}>View All Alerts</Text>
            </TouchableOpacity>
          )}
        </>
      )}
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
  role: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  alertText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TechnicianDashboard;