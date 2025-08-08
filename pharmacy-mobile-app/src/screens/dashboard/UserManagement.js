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
  Alert,
  TextInput,
  Modal,
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

const UserManagement = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { user } = useAuth();

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    role_id: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Memoize form update functions to prevent re-renders
  const updateFormField = React.useCallback((field, value) => {
    setEditForm(prevForm => ({
      ...prevForm,
      [field]: value
    }));
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      console.log('Users fetched:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = React.useCallback((user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      dob: user.dob || '',
      address: user.address || '',
      role_id: getRoleId(user.role),
    });
    setEditModalVisible(true);
  }, []);

  const handleDeleteUser = React.useCallback((user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  }, []);

  const getRoleId = (roleName) => {
    // Map role names to IDs - adjust based on your roles table
    const roleMap = {
      'admin': 1,
      'manager': 2,
      'pharmacist': 3,
      'cashier': 4,
      'customer': 5,
    };
    return roleMap[roleName.toLowerCase()] || 1;
  };

  const getRoleName = (roleId) => {
    const roleMap = {
      1: 'Admin',
      2: 'Manager', 
      3: 'Pharmacist',
      4: 'Cashier',
      5: 'Customer',
    };
    return roleMap[roleId] || 'Admin';
  };

  const saveUserChanges = React.useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      const response = await api.put(`/users/${selectedUser.id}`, editForm);
      console.log('User updated:', response.data);
      
      // Update the user in local state
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...editForm, role: getRoleName(editForm.role_id) }
          : u
      ));
      
      closeEditModal();
      Alert.alert('Success', 'User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, editForm]);

  const closeEditModal = React.useCallback(() => {
    setEditModalVisible(false);
    setSelectedUser(null);
    // Reset form to prevent stale data
    setEditForm({
      full_name: '',
      email: '',
      phone: '',
      dob: '',
      address: '',
      role_id: 1,
    });
  }, []);

  const closeDeleteModal = React.useCallback(() => {
    setDeleteModalVisible(false);
    setSelectedUser(null);
  }, []);

  const confirmDeleteUser = React.useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      await api.delete(`/users/${selectedUser.id}`);
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== selectedUser.id));
      
      closeDeleteModal();
      Alert.alert('Success', 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, closeDeleteModal]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const UserCard = React.memo(({ user, index }) => (
    <View style={[dynamicStyles.userCard, index === filteredUsers.length - 1 && dynamicStyles.lastCard]}>
      <View style={dynamicStyles.userInfo}>
        <Text style={dynamicStyles.userName}>{user.full_name}</Text>
        <Text style={dynamicStyles.userEmail}>{user.email}</Text>
        <Text style={dynamicStyles.userRole}>Role: {user.role}</Text>
        <Text style={dynamicStyles.userDate}>Joined: {formatDate(user.created_at)}</Text>
      </View>
      
      <View style={dynamicStyles.actionButtons}>
        <TouchableOpacity
          style={[dynamicStyles.actionButton, dynamicStyles.editButton]}
          onPress={() => handleEditUser(user)}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        {user.id !== user?.id && ( // Don't allow deleting current user
          <TouchableOpacity
            style={[dynamicStyles.actionButton, dynamicStyles.deleteButton]}
            onPress={() => handleDeleteUser(user)}
            activeOpacity={0.7}
          >
            <Text style={dynamicStyles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ));

  const EditUserModal = React.memo(() => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeEditModal}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={dynamicStyles.modalTitle}>Edit User</Text>
            
            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Full Name</Text>
              <TextInput
                style={dynamicStyles.input}
                value={editForm.full_name}
                onChangeText={(text) => updateFormField('full_name', text)}
                placeholder="Enter full name"
                returnKeyType="next"
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Email</Text>
              <TextInput
                style={dynamicStyles.input}
                value={editForm.email}
                onChangeText={(text) => updateFormField('email', text)}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Phone</Text>
              <TextInput
                style={dynamicStyles.input}
                value={editForm.phone}
                onChangeText={(text) => updateFormField('phone', text)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Address</Text>
              <TextInput
                style={dynamicStyles.input}
                value={editForm.address}
                onChangeText={(text) => updateFormField('address', text)}
                placeholder="Enter address"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>

            <View style={dynamicStyles.formGroup}>
              <Text style={dynamicStyles.label}>Role</Text>
              <View style={dynamicStyles.roleSelector}>
                {[
                  { id: 1, name: 'Admin' },
                  { id: 2, name: 'Manager' },
                  { id: 3, name: 'Pharmacist' },
                  { id: 4, name: 'Cashier' },
                  { id: 5, name: 'Customer' }
                ].map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      dynamicStyles.roleOption,
                      editForm.role_id === role.id && dynamicStyles.roleOptionSelected
                    ]}
                    onPress={() => updateFormField('role_id', role.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      dynamicStyles.roleOptionText,
                      editForm.role_id === role.id && dynamicStyles.roleOptionTextSelected
                    ]}>
                      {role.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                onPress={closeEditModal}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  dynamicStyles.modalButton, 
                  dynamicStyles.saveButton,
                  isLoading && { opacity: 0.6 }
                ]}
                onPress={saveUserChanges}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  ));

  const DeleteConfirmModal = React.memo(() => (
    <Modal
      visible={deleteModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeDeleteModal}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.deleteModalContent}>
          <Text style={dynamicStyles.deleteModalTitle}>Confirm Delete</Text>
          <Text style={dynamicStyles.deleteModalText}>
            Are you sure you want to delete user "{selectedUser?.full_name}"? 
            This action cannot be undone.
          </Text>
          
          <View style={dynamicStyles.modalActions}>
            <TouchableOpacity
              style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
              onPress={closeDeleteModal}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                dynamicStyles.modalButton, 
                dynamicStyles.deleteButton,
                isLoading && { opacity: 0.6 }
              ]}
              onPress={confirmDeleteUser}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  ));

  // Dynamic styles
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
    headerTitle: {
      fontSize: responsiveFontSize(20),
      fontWeight: 'bold',
      color: COLORS.text,
    },
    backButton: {
      paddingVertical: hp(0.8),
      paddingHorizontal: wp(2.5),
      backgroundColor: COLORS.primary,
      borderRadius: wp(1),
    },
    backButtonText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(13),
      fontWeight: '600',
    },
    searchContainer: {
      paddingHorizontal: wp(4),
      marginBottom: hp(2),
    },
    searchInput: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.2),
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: wp(4),
      marginBottom: hp(2),
    },
    statItem: {
      alignItems: 'center',
      backgroundColor: COLORS.surface,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
      borderRadius: wp(2),
      minWidth: wp(25),
    },
    statNumber: {
      fontSize: responsiveFontSize(20),
      fontWeight: 'bold',
      color: COLORS.primary,
    },
    statLabel: {
      fontSize: responsiveFontSize(12),
      color: COLORS.textSecondary,
      marginTop: hp(0.5),
    },
    usersList: {
      paddingHorizontal: wp(4),
    },
    userCard: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(2),
      padding: wp(4),
      marginBottom: hp(1.5),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    lastCard: {
      marginBottom: hp(3),
    },
    userInfo: {
      flex: 1,
      marginRight: wp(2),
    },
    userName: {
      fontSize: responsiveFontSize(16),
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: hp(0.3),
    },
    userEmail: {
      fontSize: responsiveFontSize(14),
      color: COLORS.textSecondary,
      marginBottom: hp(0.3),
    },
    userRole: {
      fontSize: responsiveFontSize(13),
      color: COLORS.primary,
      marginBottom: hp(0.3),
      textTransform: 'capitalize',
    },
    userDate: {
      fontSize: responsiveFontSize(12),
      color: COLORS.textSecondary,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: wp(2),
    },
    actionButton: {
      paddingVertical: hp(0.8),
      paddingHorizontal: wp(3),
      borderRadius: wp(1),
      minWidth: wp(18),
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: COLORS.info,
    },
    deleteButton: {
      backgroundColor: COLORS.error,
    },
    actionButtonText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(12),
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: hp(10),
    },
    emptyText: {
      fontSize: responsiveFontSize(16),
      color: COLORS.textSecondary,
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(3),
      padding: wp(5),
      width: wp(90),
      maxHeight: hp(80),
    },
    deleteModalContent: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(3),
      padding: wp(5),
      width: wp(85),
    },
    modalTitle: {
      fontSize: responsiveFontSize(20),
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    deleteModalTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: 'bold',
      color: COLORS.error,
      marginBottom: hp(2),
      textAlign: 'center',
    },
    deleteModalText: {
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
      textAlign: 'center',
      marginBottom: hp(3),
      lineHeight: hp(2.5),
    },
    formGroup: {
      marginBottom: hp(2),
    },
    label: {
      fontSize: responsiveFontSize(14),
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: hp(0.8),
    },
    input: {
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
      borderRadius: wp(2),
      paddingHorizontal: wp(3),
      paddingVertical: hp(1.2),
      fontSize: responsiveFontSize(14),
      color: COLORS.text,
      backgroundColor: COLORS.background || '#f9f9f9',
    },
    roleSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2),
    },
    roleOption: {
      paddingVertical: hp(1),
      paddingHorizontal: wp(3),
      borderRadius: wp(1),
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
      backgroundColor: COLORS.background || '#f9f9f9',
    },
    roleOptionSelected: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    roleOptionText: {
      fontSize: responsiveFontSize(13),
      color: COLORS.text,
    },
    roleOptionTextSelected: {
      color: COLORS.surface,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(3),
      gap: wp(3),
    },
    modalButton: {
      flex: 1,
      paddingVertical: hp(1.5),
      borderRadius: wp(2),
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: COLORS.textSecondary,
    },
    saveButton: {
      backgroundColor: COLORS.success,
    },
    cancelButtonText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(14),
      fontWeight: '600',
    },
    saveButtonText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(14),
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.background || '#f5f5f5'}
        translucent={false}
      />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={dynamicStyles.backButton}
        >
          <Text style={dynamicStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>User Management</Text>
        <View style={{width: wp(15)}} />
      </View>

      {/* Search */}
      <View style={dynamicStyles.searchContainer}>
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statItem}>
          <Text style={dynamicStyles.statNumber}>{users.length}</Text>
          <Text style={dynamicStyles.statLabel}>Total Users</Text>
        </View>
        <View style={dynamicStyles.statItem}>
          <Text style={dynamicStyles.statNumber}>{filteredUsers.length}</Text>
          <Text style={dynamicStyles.statLabel}>Filtered</Text>
        </View>
      </View>

      {/* Users List */}
      <ScrollView
        style={dynamicStyles.usersList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchUsers} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))
        ) : (
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <EditUserModal />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal />
    </SafeAreaView>
  );
};

export default UserManagement;