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

const DeliveryDashboard = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [todayStats, setTodayStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/deliveries');
      const userDeliveries = response.data.filter(
        delivery => delivery.delivery_person_id === user.id
      );
      
      setDeliveries(userDeliveries);

      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayDeliveries = userDeliveries.filter(delivery =>
        delivery.created_at?.startsWith(today)
      );

      setTodayStats({
        total: todayDeliveries.length,
        completed: todayDeliveries.filter(d => d.status === 'DELIVERED').length,
        pending: todayDeliveries.filter(d => d.status !== 'DELIVERED').length,
      });

    } catch (error) {
      console.error('Error fetching delivery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status });
      fetchDeliveryData(); // Refresh data
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return COLORS.warning;
      case 'IN_TRANSIT': return COLORS.info;
      case 'DELIVERED': return COLORS.success;
      default: return COLORS.text;
    }
  };

  const DeliveryCard = ({ delivery }) => (
    <View style={globalStyles.card}>
      <View style={[globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.textPrimary}>Order #{delivery.order_id}</Text>
        <Text style={[styles.status, { color: getStatusColor(delivery.status) }]}>
          {delivery.status}
        </Text>
      </View>
      
      <Text style={globalStyles.textSecondary}>
        Customer: {delivery.customer_name}
      </Text>
      <Text style={globalStyles.textSecondary}>
        Amount: ${delivery.total_amount}
      </Text>
      <Text style={globalStyles.textSmall}>
        Address: {delivery.delivery_address}
      </Text>

      {delivery.status !== 'DELIVERED' && (
        <View style={styles.actionButtons}>
          {delivery.status === 'PENDING' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.info }]}
              onPress={() => updateDeliveryStatus(delivery.id, 'IN_TRANSIT')}
            >
              <Text style={styles.actionButtonText}>Start Delivery</Text>
            </TouchableOpacity>
          )}
          
          {delivery.status === 'IN_TRANSIT' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={() => updateDeliveryStatus(delivery.id, 'DELIVERED')}
            >
              <Text style={styles.actionButtonText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {delivery.status === 'DELIVERED' && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
          onPress={() => navigation.navigate('DeliveryFeedback', { 
            orderId: delivery.order_id 
          })}
        >
          <Text style={styles.actionButtonText}>Add Feedback</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const StatCard = ({ title, value, color }) => (
    <View style={[globalStyles.card, styles.statCard]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchDeliveryData} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.role}>Delivery Person</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Stats */}
      <Text style={globalStyles.subHeader}>Today's Deliveries</Text>
      <View style={styles.statsRow}>
        <StatCard
          title="Total"
          value={todayStats.total}
          color={COLORS.primary}
        />
        <StatCard
          title="Completed"
          value={todayStats.completed}
          color={COLORS.success}
        />
        <StatCard
          title="Pending"
          value={todayStats.pending}
          color={COLORS.warning}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('DeliveryTracking')}
        >
          <Text style={styles.quickActionText}>Track All Deliveries</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: COLORS.secondary }]}
          onPress={() => navigation.navigate('DeliveryFeedback')}
        >
          <Text style={styles.quickActionText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Assigned Deliveries */}
      <Text style={globalStyles.subHeader}>
        My Deliveries ({deliveries.length})
      </Text>
      
      {deliveries.length > 0 ? (
        deliveries.map(delivery => (
          <DeliveryCard key={delivery.id} delivery={delivery} />
        ))
      ) : (
        <View style={globalStyles.card}>
          <Text style={globalStyles.textSecondary}>No deliveries assigned</Text>
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionText: {
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
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DeliveryDashboard;