// Medicine catalog with search 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const MedicineListScreen = ({ navigation }) => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchQuery, medicines]);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedicines = () => {
    if (!searchQuery) {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  };

  const MedicineCard = ({ medicine }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() => navigation.navigate('MedicineDetail', { medicineId: medicine.id })}
    >
      <View style={[globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.textPrimary}>{medicine.name}</Text>
        {medicine.requires_prescription && (
          <View style={[globalStyles.badge, { backgroundColor: COLORS.warning }]}>
            <Text style={globalStyles.badgeText}>Rx</Text>
          </View>
        )}
      </View>
      
      <Text style={globalStyles.textSecondary}>
        {medicine.dosage_form} • {medicine.strength}
      </Text>
      
      {medicine.category_name && (
        <Text style={globalStyles.textSmall}>
          Category: {medicine.category_name}
        </Text>
      )}
      
      {medicine.company_name && (
        <Text style={globalStyles.textSmall}>
          Manufacturer: {medicine.company_name}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={globalStyles.header}>Medicines</Text>
      
      <TextInput
        style={globalStyles.input}
        placeholder="Search medicines..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('AddMedicine')}
      >
        <Text style={globalStyles.buttonText}>Add New Medicine</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={globalStyles.textSecondary}>
        {searchQuery ? 'No medicines found matching your search' : 'No medicines available'}
      </Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={filteredMedicines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MedicineCard medicine={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMedicines} />
        }
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default MedicineListScreen;