import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { PAYMENT_METHODS } from '../../utils/constants';
import SimplePicker from '../common/SimplePicker';
import api from '../../config/api';

const PaymentScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Cash',
    transaction_reference: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const paymentMethodOptions = PAYMENT_METHODS.map(method => ({
    label: method,
    value: method
  }));

  const processPayment = async () => {
    if (!paymentData.amount) {
      Alert.alert('Error', 'Please enter payment amount');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/payments', {
        order_id: orderId,
        ...paymentData,
        amount: parseFloat(paymentData.amount),
      });
      
      Alert.alert('Success', 'Payment processed successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Receipt', { orderId }) }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.header}>Process Payment</Text>
      <Text style={globalStyles.textSecondary}>Order #{orderId}</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Payment Amount"
        value={paymentData.amount}
        onChangeText={(value) => setPaymentData(prev => ({ ...prev, amount: value }))}
        keyboardType="numeric"
      />

      <SimplePicker
        selectedValue={paymentData.payment_method}
        onValueChange={(value) => setPaymentData(prev => ({ ...prev, payment_method: value }))}
        items={paymentMethodOptions}
        placeholder="Select Payment Method"
      />

      {paymentData.payment_method !== 'Cash' && (
        <TextInput
          style={globalStyles.input}
          placeholder="Transaction Reference"
          value={paymentData.transaction_reference}
          onChangeText={(value) => setPaymentData(prev => ({ ...prev, transaction_reference: value }))}
        />
      )}

      <TouchableOpacity
        style={[globalStyles.button, isLoading && { opacity: 0.6 }]}
        onPress={processPayment}
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? 'Processing...' : 'Process Payment'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PaymentScreen;