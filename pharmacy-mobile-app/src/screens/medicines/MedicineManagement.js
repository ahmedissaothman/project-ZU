import React, { useState, useEffect, useCallback } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const wp = (percentage) => (percentage * screenWidth) / 100;
const hp = (percentage) => (percentage * screenHeight) / 100;

const responsiveFontSize = (size) => {
  const scale = screenWidth / 375;
  return Math.round(size * scale);
};

const MedicineManagement = ({ navigation }) => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    dosage_form: '',
    strength: '',
    category_id: 1,
    company_id: 1,
    requires_prescription: false,
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.dosage_form.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (medicine.category_name && medicine.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMedicines(filtered);
    }
  }, [medicines, searchQuery]);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      Alert.alert('Error', 'Failed to fetch medicines');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      dosage_form: '',
      strength: '',
      category_id: 1,
      company_id: 1,
      requires_prescription: false,
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditModal = (medicine) => {
    setSelectedMedicine(medicine);
    setForm({
      name: medicine.name || '',
      dosage_form: medicine.dosage_form || '',
      strength: medicine.strength || '',
      category_id: medicine.category_id || 1,
      company_id: medicine.company_id || 1,
      requires_prescription: medicine.requires_prescription || false,
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const openDeleteModal = (medicine) => {
    setSelectedMedicine(medicine);
    setDeleteModalVisible(true);
  };

  const saveMedicine = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Medicine name is required');
      return;
    }

    try {
      setIsLoading(true);
      if (isEditing && selectedMedicine) {
        // Update medicine
        await api.put(`/medicines/${selectedMedicine.id}`, form);
        setMedicines(medicines.map(m =>
          m.id === selectedMedicine.id ? { ...m, ...form } : m
        ));
        Alert.alert('Success', 'Medicine updated successfully');
      } else {
        // Create medicine
        const response = await api.post('/medicines', form);
        setMedicines([...medicines, response.data]);
        Alert.alert('Success', 'Medicine added successfully');
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving medicine:', error);
      Alert.alert('Error', 'Failed to save medicine');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedicine = async () => {
    if (!selectedMedicine) return;

    try {
      setIsLoading(true);
      await api.delete(`/medicines/${selectedMedicine.id}`);
      setMedicines(medicines.filter(m => m.id !== selectedMedicine.id));
      setDeleteModalVisible(false);
      Alert.alert('Success', 'Medicine deleted successfully');
    } catch (error) {
      console.error('Error deleting medicine:', error);
      Alert.alert('Error', 'Failed to delete medicine');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized handlers to prevent re-renders
  const handleNameChange = useCallback((text) => {
    setForm(prev => ({ ...prev, name: text }));
  }, []);

  const handleDosageFormChange = useCallback((text) => {
    setForm(prev => ({ ...prev, dosage_form: text }));
  }, []);

  const handleStrengthChange = useCallback((text) => {
    setForm(prev => ({ ...prev, strength: text }));
  }, []);

  const handlePrescriptionToggle = useCallback((value) => {
    setForm(prev => ({ ...prev, requires_prescription: value }));
  }, []);

  const MedicineCard = ({ medicine, index }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>{medicine.name}</Text>
        <Text style={styles.medicineDetails}>
          {medicine.dosage_form} • {medicine.strength}
        </Text>
        <Text style={styles.categoryText}>
          Category: {medicine.category_name || 'N/A'}
        </Text>
        <Text style={styles.companyText}>
          Company: {medicine.company_name || 'N/A'}
        </Text>
        {medicine.requires_prescription && (
          <Text style={styles.prescriptionText}>⚠️ Prescription Required</Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(medicine)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => openDeleteModal(medicine)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FormModal = () => (
    <Modal 
      visible={modalVisible} 
      transparent 
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
          </Text>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Medicine Name *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={handleNameChange}
                placeholder="Enter medicine name"
                placeholderTextColor="#999"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Dosage Form</Text>
              <TextInput
                style={styles.input}
                value={form.dosage_form}
                onChangeText={handleDosageFormChange}
                placeholder="e.g., Tablet, Capsule, Syrup"
                placeholderTextColor="#999"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Strength</Text>
              <TextInput
                style={styles.input}
                value={form.strength}
                onChangeText={handleStrengthChange}
                placeholder="e.g., 500mg, 250ml"
                placeholderTextColor="#999"
                autoCorrect={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Requires Prescription</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[
                    styles.switchOption,
                    !form.requires_prescription && styles.switchActive
                  ]}
                  onPress={() => handlePrescriptionToggle(false)}
                >
                  <Text style={[
                    styles.switchText,
                    !form.requires_prescription && styles.switchTextActive
                  ]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.switchOption,
                    form.requires_prescription && styles.switchActive
                  ]}
                  onPress={() => handlePrescriptionToggle(true)}
                >
                  <Text style={[
                    styles.switchText,
                    form.requires_prescription && styles.switchTextActive
                  ]}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveMedicine}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const DeleteModal = () => (
    <Modal 
      visible={deleteModalVisible} 
      transparent 
      animationType="fade"
      onRequestClose={() => setDeleteModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.deleteModalContent}>
          <Text style={styles.deleteModalTitle}>Delete Medicine</Text>
          <Text style={styles.deleteModalText}>
            Are you sure you want to delete "{selectedMedicine?.name}"?
            This action cannot be undone.
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={deleteMedicine}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Management</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{medicines.length}</Text>
          <Text style={styles.statLabel}>Total Medicines</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredMedicines.length}</Text>
          <Text style={styles.statLabel}>Filtered Results</Text>
        </View>
      </View>

      {/* Medicine List */}
      <ScrollView
        style={styles.medicinesList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMedicines} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((medicine, index) => (
            <MedicineCard key={medicine.id} medicine={medicine} index={index} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No medicines found matching your search' : 'No medicines found'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FormModal />
      <DeleteModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    backgroundColor: '#fff',
    marginBottom: hp(1),
    borderRadius: wp(2),
    marginHorizontal: wp(2),
    marginTop: hp(0.5),
  },
  headerTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(2.5),
    backgroundColor: COLORS.primary,
    borderRadius: wp(1),
  },
  backButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(13),
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(2.5),
    backgroundColor: COLORS.success,
    borderRadius: wp(1),
  },
  addButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(13),
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    fontSize: responsiveFontSize(16),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    minWidth: wp(35),
  },
  statNumber: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: responsiveFontSize(12),
    color: '#666',
    marginTop: hp(0.5),
  },
  medicinesList: {
    paddingHorizontal: wp(4),
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medicineInfo: {
    flex: 1,
    marginRight: wp(2),
  },
  medicineName: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(0.3),
  },
  medicineDetails: {
    fontSize: responsiveFontSize(14),
    color: '#666',
    marginBottom: hp(0.3),
  },
  categoryText: {
    fontSize: responsiveFontSize(13),
    color: COLORS.primary,
    marginBottom: hp(0.2),
  },
  companyText: {
    fontSize: responsiveFontSize(13),
    color: '#666',
    marginBottom: hp(0.2),
  },
  prescriptionText: {
    fontSize: responsiveFontSize(12),
    color: COLORS.warning,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: hp(0.8),
  },
  actionButton: {
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: wp(1),
    minWidth: wp(16),
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: responsiveFontSize(16),
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(5),
    width: wp(90),
    maxHeight: hp(80),
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(5),
    width: wp(85),
  },
  modalTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#333',
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
    color: '#333',
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
    color: '#333',
    marginBottom: hp(0.8),
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    fontSize: responsiveFontSize(14),
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: wp(1),
    padding: wp(0.5),
  },
  switchOption: {
    flex: 1,
    paddingVertical: hp(1),
    alignItems: 'center',
    borderRadius: wp(0.5),
  },
  switchActive: {
    backgroundColor: COLORS.primary,
  },
  switchText: {
    fontSize: responsiveFontSize(14),
    color: '#666',
  },
  switchTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: COLORS.success,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
  },
});

export default MedicineManagement;