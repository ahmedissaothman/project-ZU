// src/screens/medicines/AddMedicineScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import api from '../../config/api';

const AddMedicineScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage_form: '',
    strength: '',
    category_id: 1,
    company_id: 1,
    requires_prescription: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosage_form) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/medicines', formData);
      Alert.alert('Success', 'Medicine added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add medicine');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Add New Medicine</Text>
      
      <TextInput
        style={globalStyles.input}
        placeholder="Medicine Name *"
        value={formData.name}
        onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
      />
      
      <TextInput
        style={globalStyles.input}
        placeholder="Dosage Form (Tablet, Capsule, etc.) *"
        value={formData.dosage_form}
        onChangeText={(value) => setFormData(prev => ({ ...prev, dosage_form: value }))}
      />
      
      <TextInput
        style={globalStyles.input}
        placeholder="Strength (500mg, 10ml, etc.)"
        value={formData.strength}
        onChangeText={(value) => setFormData(prev => ({ ...prev, strength: value }))}
      />

      <TouchableOpacity
        style={[globalStyles.button, isLoading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? 'Adding...' : 'Add Medicine'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddMedicineScreen;