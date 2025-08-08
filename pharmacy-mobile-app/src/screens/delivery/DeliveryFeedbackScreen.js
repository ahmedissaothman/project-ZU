// src/screens/delivery/DeliveryFeedbackScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import api from '../../config/api';

const DeliveryFeedbackScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [feedback, setFeedback] = useState({
    message: '',
    rating: 5,
  });
  const [isLoading, setIsLoading] = useState(false);

  const submitFeedback = async () => {
    if (!feedback.message) {
      Alert.alert('Error', 'Please enter feedback message');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/deliveries/feedback', {
        order_id: orderId,
        ...feedback,
      });
      
      Alert.alert('Success', 'Feedback submitted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Delivery Feedback</Text>
      <Text style={globalStyles.textSecondary}>Order #{orderId}</Text>

      <Text style={globalStyles.subHeader}>Rating</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map(rating => (
          <TouchableOpacity
            key={rating}
            style={[
              { padding: 8, margin: 4, borderRadius: 4, minWidth: 40, alignItems: 'center' },
              feedback.rating === rating 
                ? { backgroundColor: '#FFD700' } 
                : { backgroundColor: '#E0E0E0' }
            ]}
            onPress={() => setFeedback(prev => ({ ...prev, rating }))}
          >
            <Text style={{ fontSize: 18 }}>⭐</Text>
            <Text>{rating}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[globalStyles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="Enter your feedback..."
        value={feedback.message}
        onChangeText={(value) => setFeedback(prev => ({ ...prev, message: value }))}
        multiline
      />

      <TouchableOpacity
        style={[globalStyles.button, isLoading && { opacity: 0.6 }]}
        onPress={submitFeedback}
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? 'Submitting...' : 'Submit Feedback'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DeliveryFeedbackScreen;