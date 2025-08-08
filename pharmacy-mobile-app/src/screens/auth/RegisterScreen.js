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
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS, ROLES } from '../../utils/constants';
import SimplePicker from '../common/SimplePicker';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    password: '',
    role_id: 3, // Default to Technician
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const roleOptions = [
    { label: 'Admin', value: 1 },
    { label: 'Manager', value: 2 },
    { label: 'Technician Pharmacist', value: 3 },
    { label: 'Cashier', value: 4 },
    { label: 'Delivery Person', value: 5 },
  ];

  const handleRegister = async () => {
    if (!formData.full_name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register as pharmacy staff</Text>

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
          placeholder="Phone Number"
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
        />

        <SimplePicker
          selectedValue={formData.role_id}
          onValueChange={(value) => updateField('role_id', value)}
          items={roleOptions}
          placeholder="Select Role"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Password *"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
        />

        <TouchableOpacity
          style={[globalStyles.button, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={globalStyles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.primary,
    fontSize: 16,
  },
});

export default RegisterScreen;