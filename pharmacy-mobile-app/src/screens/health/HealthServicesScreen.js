// src/screens/health/HealthServicesScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';

const HealthServicesScreen = ({ navigation }) => {
  const healthServices = [
    {
      name: 'General Clinic',
      description: 'Primary healthcare and consultation',
      hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
      contact: '+1234567890',
    },
    {
      name: 'Eye Care Center',
      description: 'Eye exams, glasses, contact lenses',
      hours: 'Mon-Sat: 9AM-5PM',
      contact: '+1234567891',
    },
    {
      name: 'Physiotherapy',
      description: 'Physical therapy and rehabilitation',
      hours: 'Mon-Fri: 7AM-7PM',
      contact: '+1234567892',
    },
    {
      name: 'Dental Services',
      description: 'Dental checkups, cleaning, and treatments',
      hours: 'Mon-Fri: 8AM-5PM',
      contact: '+1234567893',
    },
    {
      name: 'Fitness Center',
      description: 'Gym, personal training, and wellness programs',
      hours: 'Daily: 5AM-10PM',
      contact: '+1234567894',
    },
    {
      name: 'Laboratory Services',
      description: 'Blood tests, diagnostics, and health screenings',
      hours: 'Mon-Sat: 7AM-4PM',
      contact: '+1234567895',
    },
  ];

  const callService = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const ServiceCard = ({ service }) => (
    <View style={globalStyles.card}>
      <Text style={globalStyles.textPrimary}>{service.name}</Text>
      <Text style={globalStyles.textSecondary}>{service.description}</Text>
      <Text style={globalStyles.textSmall}>Hours: {service.hours}</Text>
      
      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 8, backgroundColor: COLORS.secondary }]}
        onPress={() => callService(service.contact)}
      >
        <Text style={globalStyles.buttonText}>Call {service.contact}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Health Services</Text>
      <Text style={globalStyles.textSecondary}>
        Additional healthcare services available at our location
      </Text>

      {healthServices.map((service, index) => (
        <ServiceCard key={index} service={service} />
      ))}

      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: COLORS.primary }]}
        onPress={() => navigation.navigate('PharmacyLocator')}
      >
        <Text style={globalStyles.buttonText}>Find Nearby Pharmacies</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HealthServicesScreen;