import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import api from '../config/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [syncData, setSyncData] = useState([]);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const addToSyncQueue = (action) => {
    setSyncData(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const syncOfflineData = async () => {
    if (!isOnline || syncData.length === 0) return;

    try {
      for (const action of syncData) {
        await api.request(action);
      }
      setSyncData([]);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const value = {
    notifications,
    isOnline,
    syncData,
    fetchNotifications,
    markNotificationAsRead,
    addToSyncQueue,
    syncOfflineData,
    setIsOnline,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};