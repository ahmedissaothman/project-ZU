// src/screens/profile/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await api.put(`/users/${user.id}`, formData);
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Profile</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.textPrimary}>Role: {user?.role}</Text>
        <Text style={globalStyles.textSecondary}>
          Member since: {new Date(user?.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={globalStyles.card}>
        <View style={[globalStyles.row, globalStyles.spaceBetween]}>
          <Text style={globalStyles.subHeader}>Personal Information</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: COLORS.primary }}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={globalStyles.textSecondary}>Full Name</Text>
        {isEditing ? (
          <TextInput
            style={globalStyles.input}
            value={formData.full_name}
            onChangeText={(value) => setFormData(prev => ({ ...prev, full_name: value }))}
          />
        ) : (
          <Text style={globalStyles.textPrimary}>{user?.full_name}</Text>
        )}

        <Text style={globalStyles.textSecondary}>Email</Text>
        {isEditing ? (
          <TextInput
            style={globalStyles.input}
            value={formData.email}
            onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
            keyboardType="email-address"
          />
        ) : (
          <Text style={globalStyles.textPrimary}>{user?.email}</Text>
        )}

        <Text style={globalStyles.textSecondary}>Phone</Text>
        {isEditing ? (
          <TextInput
            style={globalStyles.input}
            value={formData.phone}
            onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={globalStyles.textPrimary}>{user?.phone || 'Not provided'}</Text>
        )}

        <Text style={globalStyles.textSecondary}>Address</Text>
        {isEditing ? (
          <TextInput
            style={globalStyles.input}
            value={formData.address}
            onChangeText={(value) => setFormData(prev => ({ ...prev, address: value }))}
            multiline
          />
        ) : (
          <Text style={globalStyles.textPrimary}>{user?.address || 'Not provided'}</Text>
        )}

        {isEditing && (
          <TouchableOpacity
            style={[globalStyles.button, isLoading && { opacity: 0.6 }]}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            <Text style={globalStyles.buttonText}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.subHeader}>App Settings</Text>
        
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: COLORS.secondary }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={globalStyles.buttonText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: COLORS.info }]}
          onPress={() => Alert.alert('Help', 'Contact support at support@pharmacy.com')}
        >
          <Text style={globalStyles.buttonText}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: COLORS.error }]}
          onPress={handleLogout}
        >
          <Text style={globalStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;