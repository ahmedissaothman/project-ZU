import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS, ORDER_STATUS, PAYMENT_STATUS, ROLES } from '../../utils/constants';
import SimplePicker from '../common/SimplePicker';
import api from '../../config/api';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const fetchOrderDetail = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      setNewStatus(response.data.order_status);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (newStatus === order.order_status) {
      Alert.alert('Info', 'Status is already set to this value');
      return;
    }

    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderId}`, {
        order_status: newStatus,
        payment_status: order.payment_status
      });
      
      Alert.alert('Success', 'Order status updated successfully');
      fetchOrderDetail(); // Refresh data
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const createDelivery = async () => {
    try {
      await api.post('/deliveries', {
        order_id: orderId,
        delivery_person_id: null, // Will be assigned later
        delivery_address: order.customer_address || 'Address not provided'
      });
      
      Alert.alert('Success', 'Delivery created successfully');
      navigation.navigate('DeliveryTracking');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create delivery');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return COLORS.warning;
      case 'DELIVERED': return COLORS.success;
      case 'CANCELLED': return COLORS.error;
      default: return COLORS.text;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID': return COLORS.success;
      case 'UNPAID': return COLORS.error;
      case 'PARTIAL': return COLORS.warning;
      default: return COLORS.text;
    }
  };

  const calculateItemTotal = (item) => {
    const subtotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
    const vatAmount = subtotal * (parseFloat(item.vat_percent || 0) / 100);
    return subtotal + vatAmount;
  };

  const calculateOrderTotals = () => {
    if (!order?.items) return { subtotal: 0, vat: 0, total: 0 };

    let subtotal = 0;
    let totalVat = 0;

    order.items.forEach(item => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      const itemVat = itemSubtotal * (parseFloat(item.vat_percent || 0) / 100);
      
      subtotal += itemSubtotal;
      totalVat += itemVat;
    });

    const total = subtotal + totalVat - parseFloat(order.discount || 0);

    return {
      subtotal: subtotal.toFixed(2),
      vat: totalVat.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const canUpdateStatus = () => {
    return [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN].includes(user?.role);
  };

  const canProcessPayment = () => {
    return [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER].includes(user?.role);
  };

  const canCreateDelivery = () => {
    return [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN].includes(user?.role);
  };

  const orderStatusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  if (isLoading) {
    return (
      <View style={globalStyles.loading}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={globalStyles.center}>
        <Text style={globalStyles.textSecondary}>Order not found</Text>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totals = calculateOrderTotals();

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchOrderDetail} />
      }
    >
      <View style={globalStyles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={globalStyles.header}>Order #{order.id}</Text>
          <View style={styles.statusBadges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) }]}>
              <Text style={styles.statusText}>{order.order_status}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(order.payment_status) }]}>
              <Text style={styles.statusText}>{order.payment_status}</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.subHeader}>Customer Information</Text>
          <Text style={globalStyles.textPrimary}>Name: {order.customer_name}</Text>
          <Text style={globalStyles.textSecondary}>Order Date: {new Date(order.created_at).toLocaleDateString()}</Text>
          <Text style={globalStyles.textSecondary}>Order Time: {new Date(order.created_at).toLocaleTimeString()}</Text>
          <Text style={globalStyles.textSecondary}>Ordered By: {order.ordered_by_name}</Text>
        </View>

        {/* Order Items */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.subHeader}>Order Items ({order.items?.length || 0})</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemCard}>
                <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                  <Text style={globalStyles.textPrimary}>{item.medicine_name}</Text>
                  <Text style={[globalStyles.textPrimary, { color: COLORS.success }]}>
                    ${calculateItemTotal(item).toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.itemDetails}>
                  <Text style={globalStyles.textSecondary}>Batch: {item.batch_number}</Text>
                  <Text style={globalStyles.textSecondary}>Quantity: {item.quantity}</Text>
                  <Text style={globalStyles.textSecondary}>Unit Price: ${item.unit_price}</Text>
                  {item.vat_percent > 0 && (
                    <Text style={globalStyles.textSecondary}>VAT: {item.vat_percent}%</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={globalStyles.textSecondary}>No items in this order</Text>
          )}
        </View>

        {/* Order Summary */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.subHeader}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={globalStyles.textSecondary}>Subtotal:</Text>
            <Text style={globalStyles.textSecondary}>${totals.subtotal}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={globalStyles.textSecondary}>VAT:</Text>
            <Text style={globalStyles.textSecondary}>${totals.vat}</Text>
          </View>
          
          {parseFloat(order.discount || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={globalStyles.textSecondary}>Discount:</Text>
              <Text style={[globalStyles.textSecondary, { color: COLORS.success }]}>
                -${parseFloat(order.discount).toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[globalStyles.textPrimary, { fontWeight: 'bold' }]}>Total:</Text>
            <Text style={[globalStyles.textPrimary, { fontWeight: 'bold', color: COLORS.success }]}>
              ${order.total_amount}
            </Text>
          </View>
        </View>

        {/* Status Update (Admin/Manager/Technician only) */}
        {canUpdateStatus() && (
          <View style={globalStyles.card}>
            <Text style={globalStyles.subHeader}>Update Order Status</Text>
            
            <SimplePicker
              selectedValue={newStatus}
              onValueChange={setNewStatus}
              items={orderStatusOptions}
              placeholder="Select Status"
            />

            <TouchableOpacity
              style={[
                globalStyles.button,
                (isUpdating || newStatus === order.order_status) && styles.disabledButton
              ]}
              onPress={updateOrderStatus}
              disabled={isUpdating || newStatus === order.order_status}
            >
              <Text style={globalStyles.buttonText}>
                {isUpdating ? 'Updating...' : 'Update Status'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Process Payment Button */}
          {canProcessPayment() && order.payment_status !== 'PAID' && (
            <TouchableOpacity
              style={[globalStyles.button, { backgroundColor: COLORS.success }]}
              onPress={() => navigation.navigate('Payment', { orderId: order.id })}
            >
              <Text style={globalStyles.buttonText}>Process Payment</Text>
            </TouchableOpacity>
          )}

          {/* View Receipt Button */}
          {order.payment_status === 'PAID' && (
            <TouchableOpacity
              style={[globalStyles.button, { backgroundColor: COLORS.info }]}
              onPress={() => navigation.navigate('Receipt', { orderId: order.id })}
            >
              <Text style={globalStyles.buttonText}>View Receipt</Text>
            </TouchableOpacity>
          )}

          {/* Create Delivery Button */}
          {canCreateDelivery() && order.order_status === 'PENDING' && order.payment_status === 'PAID' && (
            <TouchableOpacity
              style={[globalStyles.button, { backgroundColor: COLORS.secondary }]}
              onPress={createDelivery}
            >
              <Text style={globalStyles.buttonText}>Create Delivery</Text>
            </TouchableOpacity>
          )}

          {/* Track Delivery Button */}
          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: COLORS.warning }]}
            onPress={() => navigation.navigate('DeliveryTracking')}
          >
            <Text style={globalStyles.buttonText}>Track Delivery</Text>
          </TouchableOpacity>

          {/* Chat with Customer Button */}
          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: COLORS.text }]}
            onPress={() => navigation.navigate('Chat', { 
              userId: order.customer_id,
              userName: order.customer_name 
            })}
          >
            <Text style={globalStyles.buttonText}>Chat with Customer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  statusBadges: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemCard: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  itemDetails: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 8,
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default OrderDetailScreen;