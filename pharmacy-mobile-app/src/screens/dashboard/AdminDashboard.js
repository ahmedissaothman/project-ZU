import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => {
  return (percentage * screenWidth) / 100;
};

const hp = (percentage) => {
  return (percentage * screenHeight) / 100;
};

// Responsive font sizes based on screen width
const responsiveFontSize = (size) => {
  const baseWidth = 375; // iPhone X width as base
  const scale = screenWidth / baseWidth;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(newSize);
  } else {
    return Math.round(newSize) - 1;
  }
};

// Determine if device is tablet
const isTablet = () => {
  const aspectRatio = screenHeight / screenWidth;
  return (screenWidth >= 768 || (aspectRatio < 1.6 && screenWidth >= 468));
};

const AdminDashboard = ({ navigation }) => {
  const [systemStats, setSystemStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screenDimensions, setScreenDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();

    // Listen for orientation changes
    const updateDimensions = ({ window }) => {
      setScreenDimensions({
        width: window.width,
        height: window.height,
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch users data
      try {
        console.log('Fetching users from /api/users');
        const usersResponse = await api.get('/users');
        console.log('Users fetched successfully:', usersResponse.data?.length || 0, 'users');
        
        // Process user statistics
        const users = usersResponse.data || [];
        const totalUsers = users.length;
        
        // Calculate role distribution
        const roleDistribution = users.reduce((acc, user) => {
          const role = user.role || 'Unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});

        setUserStats({
          totalUsers: totalUsers,
          roles: roleDistribution,
          users: users
        });
      } catch (userError) {
        console.error('Error fetching users:', userError.response?.status, userError.message);
        setUserStats({
          totalUsers: 0,
          roles: {},
          users: []
        });
      }

      // Fetch other system stats
      try {
        console.log('Fetching sales and inventory reports...');
        const [salesResponse, inventoryResponse] = await Promise.all([
          api.get('/reports/sales?period=daily').catch(err => {
            console.log('Sales report not available:', err.response?.status);
            return { data: { total_sales: '$0' } };
          }),
          api.get('/reports/inventory').catch(err => {
            console.log('Inventory report not available:', err.response?.status);
            return { data: {} };
          }),
        ]);

        setSystemStats({
          sales: salesResponse.data,
          inventory: inventoryResponse.data
        });
      } catch (statsError) {
        console.warn('Error fetching system stats:', statsError);
        setSystemStats({
          sales: { total_sales: '$0' },
          inventory: {}
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load some dashboard data');
      
      // Set default values on error
      setUserStats({
        totalUsers: 0,
        roles: {},
        users: []
      });
      setSystemStats({
        sales: { total_sales: '$0' },
        inventory: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const adminActions = [
    { title: 'User Management', screen: 'UserManagement', color: COLORS.primary },
    { title: 'System Reports', screen: 'SalesReport', color: COLORS.success },
    { title: 'Database Backup', action: 'backup', color: COLORS.warning },
    { title: 'System Settings', screen: 'Settings', color: COLORS.info },
    { title: 'Medicine Management', screen: 'MedicineList', color: COLORS.secondary },
    { title: 'All Notifications', screen: 'Notifications', color: COLORS.text },
  ];

  const handleAction = (item) => {
    if (item.action === 'backup') {
      alert('Database backup initiated');
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <View style={[
      globalStyles.card, 
      dynamicStyles.statCard,
      { width: isTablet() ? wp(22) : wp(43) }
    ]}>
      <Text style={[dynamicStyles.statValue, { color }]}>{value}</Text>
      <Text style={dynamicStyles.statTitle}>{title}</Text>
      {subtitle && <Text style={dynamicStyles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  // Dynamic styles that respond to screen size
  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background || '#f5f5f5',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
      backgroundColor: COLORS.surface,
      marginBottom: hp(1),
      borderRadius: wp(2),
      marginHorizontal: wp(2),
      marginTop: hp(0.5),
    },
    welcome: {
      fontSize: responsiveFontSize(14),
      color: COLORS.textSecondary,
    },
    userName: {
      fontSize: responsiveFontSize(18),
      fontWeight: 'bold',
      color: COLORS.text,
      maxWidth: wp(50),
    },
    logoutButton: {
      paddingVertical: hp(0.8),
      paddingHorizontal: wp(2.5),
      backgroundColor: COLORS.error,
      borderRadius: wp(1),
    },
    logoutText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(13),
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: '600',
      color: COLORS.text,
      marginVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    statsRow: {
      flexDirection: isTablet() ? 'row' : 'row',
      flexWrap: 'wrap',
      justifyContent: isTablet() ? 'flex-start' : 'space-between',
      marginBottom: hp(2),
      paddingHorizontal: wp(4),
    },
    statCard: {
      padding: wp(4),
      marginHorizontal: wp(1),
      marginBottom: hp(1),
      alignItems: 'center',
      minHeight: hp(12),
      justifyContent: 'center',
    },
    statValue: {
      fontSize: responsiveFontSize(24),
      fontWeight: 'bold',
      marginBottom: hp(0.5),
    },
    statTitle: {
      fontSize: responsiveFontSize(14),
      color: COLORS.textSecondary,
      textAlign: 'center',
    },
    statSubtitle: {
      fontSize: responsiveFontSize(12),
      color: COLORS.textSecondary,
      textAlign: 'center',
      marginTop: hp(0.5),
    },
    roleStats: {
      paddingHorizontal: wp(4),
      marginBottom: hp(2),
    },
    roleCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp(4),
      backgroundColor: COLORS.surface,
      borderRadius: wp(2),
      marginBottom: hp(1),
    },
    roleText: {
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
      textTransform: 'capitalize',
    },
    roleCount: {
      fontSize: responsiveFontSize(16),
      fontWeight: '600',
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: wp(4),
      justifyContent: 'space-between',
      marginBottom: hp(2),
    },
    actionCard: {
      width: isTablet() ? wp(30) : wp(44),
      padding: isTablet() ? wp(4) : wp(5),
      borderRadius: wp(2),
      marginBottom: hp(1.5),
      alignItems: 'center',
      minHeight: hp(10),
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    actionText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(isTablet() ? 16 : 15),
      fontWeight: '600',
      textAlign: 'center',
    },
    systemHealthCard: {
      backgroundColor: COLORS.surface,
      padding: wp(4),
      borderRadius: wp(2),
      marginHorizontal: wp(4),
      marginBottom: hp(2),
    },
    healthItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#e0e0e0',
    },
    healthItemLast: {
      borderBottomWidth: 0,
    },
    healthLabel: {
      fontSize: responsiveFontSize(15),
      color: COLORS.text,
    },
    healthValue: {
      fontSize: responsiveFontSize(14),
      color: COLORS.textSecondary,
      fontWeight: '500',
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: COLORS.background || '#f5f5f5',
    },
    contentContainer: {
      paddingBottom: hp(3),
    },
    errorText: {
      color: COLORS.error,
      fontSize: responsiveFontSize(14),
      textAlign: 'center',
      paddingHorizontal: wp(4),
      marginBottom: hp(2),
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.background || '#f5f5f5'}
        translucent={false}
      />
      <ScrollView
        style={dynamicStyles.scrollContainer}
        contentContainerStyle={dynamicStyles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={dynamicStyles.header}>
          <View style={{ flex: 1, marginRight: wp(2) }}>
            <Text style={dynamicStyles.welcome}>System Administrator</Text>
            <Text style={dynamicStyles.userName} numberOfLines={1} ellipsizeMode="tail">
              {user?.full_name}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={dynamicStyles.logoutButton}>
            <Text style={dynamicStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <Text style={dynamicStyles.errorText}>{error}</Text>
        )}

        {/* System Overview */}
        <Text style={dynamicStyles.sectionTitle}>System Overview</Text>
        <View style={dynamicStyles.statsRow}>
          <StatCard
            title="Total Users"
            value={userStats?.totalUsers?.toString() || '0'}
            subtitle={`${userStats?.totalUsers === 1 ? 'user' : 'users'} registered`}
            color={COLORS.primary}
          />
          <StatCard
            title="Today's Sales"
            value={systemStats?.sales?.total_sales || '$0'}
            subtitle="Revenue today"
            color={COLORS.success}
          />
          {isTablet() && (
            <>
              <StatCard
                title="Active Sessions"
                value="24"
                subtitle="Current users"
                color={COLORS.info}
              />
              <StatCard
                title="System Load"
                value="45%"
                subtitle="CPU usage"
                color={COLORS.warning}
              />
            </>
          )}
        </View>

        {/* User Distribution */}
        {userStats?.roles && Object.keys(userStats.roles).length > 0 && (
          <>
            <Text style={dynamicStyles.sectionTitle}>User Distribution</Text>
            <View style={dynamicStyles.roleStats}>
              {Object.entries(userStats.roles).map(([role, count]) => (
                <View key={role} style={dynamicStyles.roleCard}>
                  <Text style={dynamicStyles.roleText}>{role}</Text>
                  <Text style={[dynamicStyles.roleCount, { color: COLORS.primary }]}>
                    {count} {count === 1 ? 'user' : 'users'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Admin Actions */}
        <Text style={dynamicStyles.sectionTitle}>Admin Controls</Text>
        <View style={dynamicStyles.actionsGrid}>
          {adminActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[dynamicStyles.actionCard, { backgroundColor: action.color }]}
              onPress={() => handleAction(action)}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* System Health */}
        {/* <Text style={dynamicStyles.sectionTitle}>System Health</Text>
        <View style={dynamicStyles.systemHealthCard}>
          <View style={dynamicStyles.healthItem}>
            <Text style={dynamicStyles.healthLabel}>Database Status</Text>
            <Text style={[dynamicStyles.healthValue, { color: COLORS.success }]}>Online</Text>
          </View>
          <View style={dynamicStyles.healthItem}>
            <Text style={dynamicStyles.healthLabel}>Last Backup</Text>
            <Text style={dynamicStyles.healthValue}>2 hours ago</Text>
          </View>
          <View style={dynamicStyles.healthItem}>
            <Text style={dynamicStyles.healthLabel}>API Status</Text>
            <Text style={[dynamicStyles.healthValue, { color: COLORS.success }]}>Running</Text>
          </View>
          <View style={[dynamicStyles.healthItem, dynamicStyles.healthItemLast]}>
            <Text style={dynamicStyles.healthLabel}>Storage Used</Text>
            <Text style={dynamicStyles.healthValue}>65%</Text>
          </View>
          <View style={[dynamicStyles.healthItem, dynamicStyles.healthItemLast]}>
            <Text style={dynamicStyles.healthLabel}>Total Users</Text>
            <Text style={[dynamicStyles.healthValue, { color: COLORS.primary }]}>
              {userStats?.totalUsers || 0}
            </Text>
          </View> 
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;