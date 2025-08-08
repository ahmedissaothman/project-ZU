// Payment processing 
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

const CashierDashboard = ({ navigation }) => {
  const [todayPayments, setTodayPayments] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [paymentsResponse, ordersResponse] = await Promise.all([
        api.get('/payments'),
        api.get('/orders'),
      ]);

      // Filter today's data
      const today = new Date().toISOString().split('T')[0];
      const todaysPayments = paymentsResponse.data.filter(payment =>
        payment.created_at.startsWith(today)
      );
      setTodayPayments(todaysPayments);

      // Calculate daily total
      const total = todaysPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.amount), 0
      );
      setDailyTotal(total);

      // Filter pending orders
      const pending = ordersResponse.data.filter(order => 
        order.payment_status === 'UNPAID' || order.payment_status === 'PARTIAL'
      );
      setPendingOrders(pending);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { title: 'Process Payment', screen: 'Payment', color: COLORS.success },
    { title: 'View Orders', screen: 'OrderList', color: COLORS.primary },
    { title: 'Generate Receipt', screen: 'Receipt', color: COLORS.info },
    { title: 'Payment History', screen: 'PaymentHistory', color: COLORS.secondary },
    { title: 'Financial Report', screen: 'FinancialReport', color: COLORS.warning },
    { title: 'Notifications', screen: 'Notifications', color: COLORS.text },
  ];

  const PaymentCard = ({ payment }) => (
    <View style={globalStyles.card}>
      <View style={[globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.textPrimary}>
          Order #{payment.order_id}
        </Text>
        <Text style={[styles.amount, { color: COLORS.success }]}>
          ${payment.amount}
        </Text>
      </View>
      <Text style={globalStyles.textSecondary}>
        Method: {payment.payment_method}
      </Text>
      <Text style={globalStyles.textSmall}>
        {new Date(payment.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );

  const PendingOrderCard = ({ order }) => (
    <TouchableOpacity
      style={[globalStyles.card, styles.pendingCard]}
      onPress={() => navigation.navigate('Payment', { orderId: order.id })}
    >
      <View style={[globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.textPrimary}>Order #{order.id}</Text>
        <Text style={[styles.amount, { color: COLORS.error }]}>
          ${order.total_amount}
        </Text>
      </View>
      <Text style={globalStyles.textSecondary}>
        Customer: {order.customer_name}
      </Text>
      <Text style={[styles.statusText, { color: COLORS.warning }]}>
        {order.payment_status}
      </Text>
    </TouchableOpacity>
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
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.role}>Cashier</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Summary */}
      <View style={[globalStyles.card, styles.summaryCard]}>
        <Text style={styles.summaryTitle}>Today's Summary</Text>
        <Text style={styles.summaryAmount}>${dailyTotal.toFixed(2)}</Text>
        <Text style={globalStyles.textSecondary}>
          {todayPayments.length} transactions processed
        </Text>
      </View>

      {/* Quick Actions */}
      <Text style={globalStyles.subHeader}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, { backgroundColor: action.color }]}
            onPress={() => navigation.navigate(action.screen)}
          >
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pending Payments */}
      {pendingOrders.length > 0 && (
        <>
          <Text style={globalStyles.subHeader}>
            Pending Payments ({pendingOrders.length})
          </Text>
          {pendingOrders.slice(0, 3).map(order => (
            <PendingOrderCard key={order.id} order={order} />
          ))}
          {pendingOrders.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('OrderList')}
            >
              <Text style={styles.viewAllText}>View All Pending</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Recent Payments */}
      <Text style={globalStyles.subHeader}>
        Recent Payments ({todayPayments.length})
      </Text>
      {todayPayments.length > 0 ? (
        todayPayments.slice(0, 5).map((payment, index) => (
          <PaymentCard key={index} payment={payment} />
        ))
      ) : (
        <View style={globalStyles.card}>
          <Text style={globalStyles.textSecondary}>No payments today</Text>
        </View>
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
  summaryCard: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    color: COLORS.surface,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginVertical: 8,
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
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
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

export default CashierDashboard;