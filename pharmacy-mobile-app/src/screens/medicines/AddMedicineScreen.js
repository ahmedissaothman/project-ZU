// src/screens/medicines/AddMedicineScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal,
  FlatList,
  Switch,
} from 'react-native';
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

const AddMedicineScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage_form: '',
    strength: '',
    category_id: '',
    company_id: '',
    requires_prescription: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
  });

  useEffect(() => {
    fetchDropdownData();

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

  const fetchDropdownData = async () => {
    try {
      let categoriesData = [];
      let companiesData = [];

      console.log('Fetching dropdown data...');

      // Fetch categories
      try {
        console.log('Fetching categories from /api/categories');
        const categoriesResponse = await api.get('/categories');
        categoriesData = categoriesResponse.data || [];
        console.log('Categories fetched successfully:', categoriesData.length, 'items');
      } catch (catError) {
        console.error('Categories fetch error:', catError.response?.status, catError.message);
        // Use default categories if endpoint fails
        categoriesData = [
          { id: 1, name: 'Pain Relief' },
          { id: 2, name: 'Antibiotics' },
          { id: 3, name: 'Vitamins' },
          { id: 4, name: 'Cold & Flu' },
          { id: 5, name: 'Digestive' },
          { id: 6, name: 'Other' }
        ];
        console.log('Using default categories');
      }

      // Fetch companies
      try {
        console.log('Fetching companies from /api/companies');
        const companiesResponse = await api.get('/companies');
        companiesData = companiesResponse.data || [];
        console.log('Companies fetched successfully:', companiesData.length, 'items');
      } catch (compError) {
        console.error('Companies fetch error:', compError.response?.status, compError.message);
        // Use default companies if endpoint fails
        companiesData = [
          { id: 1, name: 'PharmaCorp Ltd' },
          { id: 2, name: 'Pfizer' },
          { id: 3, name: 'Johnson & Johnson' },
          { id: 4, name: 'Novartis' },
          { id: 5, name: 'Generic' },
          { id: 6, name: 'Local Manufacturer' }
        ];
        console.log('Using default companies');
      }
      
      setCategories(categoriesData);
      setCompanies(companiesData);
      console.log('Dropdown data set successfully');
      
    } catch (error) {
      console.error('General error fetching dropdown data:', error);
      // Set minimal default data even if there's an error
      setCategories([
        { id: 1, name: 'Pain Relief' },
        { id: 2, name: 'Antibiotics' },
        { id: 3, name: 'Other' }
      ]);
      setCompanies([
        { id: 1, name: 'PharmaCorp Ltd' },
        { id: 2, name: 'Generic' }
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosage_form || !formData.category_id || !formData.company_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        company_id: parseInt(formData.company_id),
      };
      
      console.log('Submitting medicine data:', submitData);
      
      await api.post('/medicines', submitData);
      Alert.alert('Success', 'Medicine added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding medicine:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to add medicine';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id.toString() === formData.category_id.toString());
    return category ? category.name : 'Select Category';
  };

  const getSelectedCompanyName = () => {
    const company = companies.find(comp => comp.id.toString() === formData.company_id.toString());
    return company ? company.name : 'Select Company';
  };

  const renderDropdownModal = ({ visible, setVisible, data, onSelect, title, selectedValue }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <Text style={dynamicStyles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={dynamicStyles.modalCloseButton}
            >
              <Text style={dynamicStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  dynamicStyles.modalItem,
                  selectedValue === item.id.toString() && dynamicStyles.selectedItem
                ]}
                onPress={() => {
                  onSelect(item.id.toString());
                  setVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  dynamicStyles.modalItemText,
                  selectedValue === item.id.toString() && dynamicStyles.selectedItemText
                ]}>
                  {item.name}
                </Text>
                {selectedValue === item.id.toString() && (
                  <Text style={dynamicStyles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            style={dynamicStyles.modalList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  // Dynamic styles that respond to screen size
  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background || '#f5f5f5',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: wp(4),
      paddingBottom: hp(3),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(3),
      marginTop: hp(1),
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary,
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.6),
      borderRadius: wp(1.5),
      marginRight: wp(4),
    },
    backIcon: {
      fontSize: responsiveFontSize(12),
      color: COLORS.surface,
      fontWeight: 'bold',
      marginRight: wp(0.5),
    },
    backText: {
      fontSize: responsiveFontSize(12),
      color: COLORS.surface,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: responsiveFontSize(20),
      fontWeight: 'bold',
      color: COLORS.text,
      flex: 1,
    },
    formContainer: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(3),
      padding: wp(4),
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      marginBottom: hp(2),
    },
    inputGroup: {
      marginBottom: hp(2),
    },
    label: {
      fontSize: responsiveFontSize(14),
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: hp(0.5),
    },
    requiredIndicator: {
      color: COLORS.error,
    },
    input: {
      backgroundColor: COLORS.background || '#f5f5f5',
      borderRadius: wp(2),
      paddingHorizontal: wp(3),
      paddingVertical: hp(1.5),
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
      minHeight: hp(6),
    },
    dropdown: {
      backgroundColor: COLORS.background || '#f5f5f5',
      borderRadius: wp(2),
      paddingHorizontal: wp(3),
      paddingVertical: hp(1.5),
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
      minHeight: hp(6),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownText: {
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
      flex: 1,
    },
    dropdownPlaceholder: {
      fontSize: responsiveFontSize(16),
      color: COLORS.textSecondary,
      flex: 1,
    },
    dropdownIcon: {
      fontSize: responsiveFontSize(16),
      color: COLORS.textSecondary,
      marginLeft: wp(2),
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(2),
    },
    switchLabel: {
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
      flex: 1,
    },
    submitButton: {
      backgroundColor: COLORS.primary,
      borderRadius: wp(2),
      paddingVertical: hp(2),
      paddingHorizontal: wp(6),
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      alignSelf: isTablet() ? 'center' : 'stretch',
      maxWidth: isTablet() ? wp(50) : '100%',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(16),
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(3),
      width: wp(90),
      maxHeight: hp(60),
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp(4),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#e0e0e0',
    },
    modalTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: '600',
      color: COLORS.text,
    },
    modalCloseButton: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      backgroundColor: COLORS.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCloseText: {
      fontSize: responsiveFontSize(20),
      color: COLORS.surface,
      fontWeight: 'bold',
    },
    modalList: {
      maxHeight: hp(40),
    },
    modalItem: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#e0e0e0',
    },
    selectedItem: {
      backgroundColor: COLORS.primary + '10',
    },
    modalItemText: {
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
    },
    selectedItemText: {
      color: COLORS.primary,
      fontWeight: '600',
    },
    checkmark: {
      fontSize: responsiveFontSize(18),
      color: COLORS.primary,
      fontWeight: 'bold',
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
        contentContainerStyle={dynamicStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity
            style={dynamicStyles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.backIcon}>←</Text>
            <Text style={dynamicStyles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Add New Medicine</Text>
        </View>

        {/* Form */}
        <View style={dynamicStyles.formContainer}>
          
          {/* Medicine Name */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>
              Medicine Name <Text style={dynamicStyles.requiredIndicator}>*</Text>
            </Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter medicine name"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.name}
              onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          {/* Dosage Form */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>
              Dosage Form <Text style={dynamicStyles.requiredIndicator}>*</Text>
            </Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Tablet, Capsule, Syrup, etc."
              placeholderTextColor={COLORS.textSecondary}
              value={formData.dosage_form}
              onChangeText={(value) => setFormData(prev => ({ ...prev, dosage_form: value }))}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          {/* Strength */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Strength</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="500mg, 10ml, etc."
              placeholderTextColor={COLORS.textSecondary}
              value={formData.strength}
              onChangeText={(value) => setFormData(prev => ({ ...prev, strength: value }))}
              autoCorrect={false}
            />
          </View>

          {/* Category Dropdown */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>
              Category <Text style={dynamicStyles.requiredIndicator}>*</Text>
            </Text>
            <TouchableOpacity
              style={dynamicStyles.dropdown}
              onPress={() => setCategoryModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[
                formData.category_id ? dynamicStyles.dropdownText : dynamicStyles.dropdownPlaceholder
              ]}>
                {getSelectedCategoryName()}
              </Text>
              <Text style={dynamicStyles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Company Dropdown */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>
              Manufacturer <Text style={dynamicStyles.requiredIndicator}>*</Text>
            </Text>
            <TouchableOpacity
              style={dynamicStyles.dropdown}
              onPress={() => setCompanyModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[
                formData.company_id ? dynamicStyles.dropdownText : dynamicStyles.dropdownPlaceholder
              ]}>
                {getSelectedCompanyName()}
              </Text>
              <Text style={dynamicStyles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Requires Prescription Switch */}
          <View style={dynamicStyles.switchContainer}>
            <Text style={dynamicStyles.switchLabel}>Requires Prescription</Text>
            <Switch
              value={formData.requires_prescription}
              onValueChange={(value) => setFormData(prev => ({ ...prev, requires_prescription: value }))}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={formData.requires_prescription ? COLORS.surface : COLORS.textSecondary}
            />
          </View>

        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            dynamicStyles.submitButton,
            isLoading && dynamicStyles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={dynamicStyles.submitButtonText}>
            {isLoading ? 'Adding Medicine...' : 'Add Medicine'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Category Modal */}
      {renderDropdownModal({
        visible: categoryModalVisible,
        setVisible: setCategoryModalVisible,
        data: categories,
        onSelect: (value) => setFormData(prev => ({ ...prev, category_id: value })),
        title: 'Select Category',
        selectedValue: formData.category_id
      })}

      {/* Company Modal */}
      {renderDropdownModal({
        visible: companyModalVisible,
        setVisible: setCompanyModalVisible,
        data: companies,
        onSelect: (value) => setFormData(prev => ({ ...prev, company_id: value })),
        title: 'Select Manufacturer',
        selectedValue: formData.company_id
      })}

    </SafeAreaView>
  );
};

export default AddMedicineScreen;