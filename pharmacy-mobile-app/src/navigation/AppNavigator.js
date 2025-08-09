// Complete navigation setup 
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Dashboard Screens
import AdminDashboard from '../screens/dashboard/AdminDashboard';
import ManagerDashboard from '../screens/dashboard/ManagerDashboard';
import TechnicianDashboard from '../screens/dashboard/TechnicianDashboard';
import CashierDashboard from '../screens/dashboard/CashierDashboard';
import DeliveryDashboard from '../screens/dashboard/DeliveryDashboard';
import UserManagement from '../screens/dashboard/UserManagement';

// Other Screens
//import MedicineManagement from '../screens/medicines/MedicineManagement';

// Other Screens
import MedicineListScreen from '../screens/medicines/MedicineListScreen';
import MedicineDetailScreen from '../screens/medicines/MedicineDetailScreen';
import AddMedicineScreen from '../screens/medicines/AddMedicineScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import CreateOrderScreen from '../screens/orders/CreateOrderScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import CustomerRegistrationScreen from '../screens/customers/CustomerRegistrationScreen';
import PaymentScreen from '../screens/payments/PaymentScreen';
import ReceiptScreen from '../screens/payments/ReceiptScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import BarcodeScannerScreen from '../screens/barcode/BarcodeScannerScreen';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';
import PharmacyLocatorScreen from '../screens/location/PharmacyLocatorScreen';
import HealthServicesScreen from '../screens/health/HealthServicesScreen';
import DeliveryTrackingScreen from '../screens/delivery/DeliveryTrackingScreen';
import DeliveryFeedbackScreen from '../screens/delivery/DeliveryFeedbackScreen';
import SalesReportScreen from '../screens/reports/SalesReportScreen';
import InventoryReportScreen from '../screens/reports/InventoryReportScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { ROLES } from '../utils/constants';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={globalStyles.loading}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const getDashboardScreen = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return AdminDashboard;
      case ROLES.MANAGER:
        return ManagerDashboard;
      case ROLES.TECHNICIAN:
        return TechnicianDashboard;
      case ROLES.CASHIER:
        return CashierDashboard;
      case ROLES.DELIVERY:
        return DeliveryDashboard;
      default:
        return TechnicianDashboard;
    }
  };

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        // Add smooth transitions
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Register' }}
          />
        </>
      ) : (
        // Authenticated Stack
        <>
          {/* Dashboard Screen */}
          <Stack.Screen 
            name="Dashboard" 
            component={getDashboardScreen()} 
            options={{ title: `${user?.role || 'User'} Dashboard` }}
          />
          
          {/* Admin/Manager Screens */}
          <Stack.Screen 
            name="UserManagement" 
            component={UserManagement}
            options={{ title: 'User Management' }}
          />
          <Stack.Screen 
            name="SalesReport" 
            component={SalesReportScreen}
            options={{ title: 'Sales Report' }}
          />
          <Stack.Screen 
            name="InventoryReport" 
            component={InventoryReportScreen}
            options={{ title: 'Inventory Report' }}
          />
          
          {/* Medicine Screens */}
          <Stack.Screen name="MedicineList" component={MedicineListScreen} />
          <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
          <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
          
          {/* Order Screens */}
          <Stack.Screen 
            name="OrderList" 
            component={OrderListScreen}
            options={{ title: 'Orders' }}
          />
          <Stack.Screen 
            name="CreateOrder" 
            component={CreateOrderScreen}
            options={{ title: 'Create Order' }}
          />
          <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetailScreen}
            options={{ title: 'Order Details' }}
          />
          
          {/* Customer Screens */}
          <Stack.Screen 
            name="CustomerRegistration" 
            component={CustomerRegistrationScreen}
            options={{ title: 'Register Customer' }}
          />
          
          {/* Payment Screens */}
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{ title: 'Payment' }}
          />
          <Stack.Screen 
            name="Receipt" 
            component={ReceiptScreen}
            options={{ title: 'Receipt' }}
          />
          
          {/* Chat Screens */}
          <Stack.Screen 
            name="ChatList" 
            component={ChatListScreen}
            options={{ title: 'Messages' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'Chat' }}
          />
          
          {/* Utility Screens */}
          <Stack.Screen 
            name="BarcodeScanner" 
            component={BarcodeScannerScreen}
            options={{ title: 'Scan Barcode' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationListScreen}
            options={{ title: 'Notifications' }}
          />
          
          {/* Location & Services */}
          <Stack.Screen 
            name="PharmacyLocator" 
            component={PharmacyLocatorScreen}
            options={{ title: 'Find Pharmacy' }}
          />
          <Stack.Screen 
            name="HealthServices" 
            component={HealthServicesScreen}
            options={{ title: 'Health Services' }}
          />
          
          {/* Delivery Screens */}
          <Stack.Screen 
            name="DeliveryTracking" 
            component={DeliveryTrackingScreen}
            options={{ title: 'Track Delivery' }}
          />
          <Stack.Screen 
            name="DeliveryFeedback" 
            component={DeliveryFeedbackScreen}
            options={{ title: 'Delivery Feedback' }}
          />
          
          {/* Profile & Settings */}
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={ProfileScreen} // You might want to create a separate Settings screen
            options={{ title: 'Settings' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;