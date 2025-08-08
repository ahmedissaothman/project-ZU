// Alert management 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';

const NotificationListScreen = ({ navigation }) => {
  const { notifications, fetchNotifications, markNotificationAsRead } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    await fetchNotifications();
    setIsLoading(false);
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.title.includes('Low Stock') || notification.title.includes('Expiry')) {
      navigation.navigate('InventoryReport');
    } else if (notification.title.includes('Order')) {
      navigation.navigate('OrderList');
    } else if (notification.title.includes('Payment')) {
      navigation.navigate('PaymentHistory');
    }
  };

  const getNotificationIcon = (title) => {
    if (title.includes('Low Stock')) return '📦';
    if (title.includes('Expiry')) return '⚠️';
    if (title.includes('Order')) return '🛒';
    if (title.includes('Payment')) return '💳';
    if (title.includes('Delivery')) return '🚚';
    return '🔔';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const NotificationCard = ({ notification }) => (
    <TouchableOpacity
      style={[
        globalStyles.card,
        !notification.is_read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={globalStyles.row}>
        <Text style={styles.icon}>{getNotificationIcon(notification.title)}</Text>
        <View style={styles.notificationContent}>
          <View style={[globalStyles.row, globalStyles.spaceBetween]}>
            <Text style={[
              globalStyles.textPrimary,
              !notification.is_read && styles.unreadText
            ]}>
              {notification.title}
            </Text>
            <Text style={globalStyles.textSmall}>
              {formatTime(notification.created_at)}
            </Text>
          </View>
          <Text style={globalStyles.textSecondary} numberOfLines={2}>
            {notification.message}
          </Text>
          {!notification.is_read && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={globalStyles.header}>Notifications</Text>
      <Text style={globalStyles.textSecondary}>
        {notifications.filter(n => !n.is_read).length} unread
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={globalStyles.textSecondary}>No notifications yet</Text>
      <Text style={globalStyles.textSmall}>
        You'll receive alerts for stock levels, orders, and more
      </Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadNotifications} />
        }
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
});

export default NotificationListScreen;