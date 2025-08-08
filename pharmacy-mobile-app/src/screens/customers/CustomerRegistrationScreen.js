import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const CustomerRegistrationScreen = ({ navigation }) => {
  const [registrationType, setRegistrationType] = useState('walk-in'); // 'walk-in' or 'doctor-referred'
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    password: '',
    role_id: 5, // Customer role
    doctor_name: '',
    doctor_license: '',
    medical_history: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.full_name || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Generate a temporary password if not provided
      const customerData = {
        ...formData,
        password: formData.password || Math.random().toString(36).slice(-8),
      };

      const response = await api.post('/auth/register', customerData);
      
      Alert.alert(
        'Success',
        `Customer registered successfully! ${!formData.password ? `Temporary password: ${customerData.password}` : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      // If doctor-referred, also create doctor record
      if (registrationType === 'doctor-referred' && formData.doctor_name) {
        try {
          await api.post('/doctors', {
            full_name: formData.doctor_name,
            license_number: formData.doctor_license,
            contact_info: 'Referred patient: ' + formData.full_name,
          });
        } catch (error) {
          console.log('Doctor record creation failed:', error);
        }
      }

    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.content}>
        <Text style={globalStyles.header}>Customer Registration</Text>

        {/* Registration Type Selector */}
        <Text style={globalStyles.subHeader}>Registration Type</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              registrationType === 'walk-in' && styles.activeType
            ]}
            onPress={() => setRegistrationType('walk-in')}
          >
            <Text style={[
              styles.typeText,
              registrationType === 'walk-in' && styles.activeTypeText
            ]}>
              Walk-in Customer
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              registrationType === 'doctor-referred' && styles.activeType
            ]}
            onPress={() => setRegistrationType('doctor-referred')}
          >
            <Text style={[
              styles.typeText,
              registrationType === 'doctor-referred' && styles.activeTypeText
            ]}>
              Doctor Referred
            </Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <Text style={globalStyles.subHeader}>Basic Information</Text>
        
        <TextInput
          style={globalStyles.input}
          placeholder="Full Name *"
          value={formData.full_name}
          onChangeText={(value) => updateField('full_name', value)}
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Phone Number *"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          value={formData.dob}
          onChangeText={(value) => updateField('dob', value)}
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(value) => updateField('address', value)}
          multiline
          numberOfLines={3}
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Password (optional - auto-generated if empty)"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
        />

        {/* Doctor Information (if doctor-referred) */}
        {registrationType === 'doctor-referred' && (
          <>
            <Text style={globalStyles.subHeader}>Doctor Information</Text>
            
            <TextInput
              style={globalStyles.input}
              placeholder="Doctor's Name"
              value={formData.doctor_name}
              onChangeText={(value) => updateField('doctor_name', value)}
            />

            <TextInput
              style={globalStyles.input}
              placeholder="Doctor's License Number"
              value={formData.doctor_license}
              onChangeText={(value) => updateField('doctor_license', value)}
            />
          </>
        )}

        {/* Medical History */}
        <Text style={globalStyles.subHeader}>Medical History</Text>
        <TextInput
          style={[globalStyles.input, styles.textArea]}
          placeholder="Any allergies, chronic conditions, or medical notes..."
          value={formData.medical_history}
          onChangeText={(value) => updateField('medical_history', value)}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[globalStyles.button, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={globalStyles.buttonText}>
            {isLoading ? 'Registering...' : 'Register Customer'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeType: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  activeTypeText: {
    color: COLORS.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default CustomerRegistrationScreen;