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
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
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

const MedicineListScreen = ({ navigation }) => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
  });

  useEffect(() => {
    fetchMedicines();

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

  const StatCard = ({ title, value, color }) => (
    <View style={[dynamicStyles.statCard, { width: isTablet() ? wp(22) : wp(43) }]}>
      <Text style={[dynamicStyles.statValue, { color }]}>{value}</Text>
      <Text style={dynamicStyles.statTitle}>{title}</Text>
    </View>
  );

  const MedicineCard = ({ medicine }) => (
    <View style={dynamicStyles.medicineCard}>
      <View style={dynamicStyles.cardContent}>
        <View style={dynamicStyles.medicineInfo}>
          <Text style={dynamicStyles.medicineName} numberOfLines={2}>
            {medicine.name}
          </Text>
          <Text style={dynamicStyles.medicineEmail}>
            {medicine.dosage_form} • {medicine.strength}
          </Text>
          {medicine.category_name && (
            <Text style={dynamicStyles.medicineRole}>
              Category: {medicine.category_name}
            </Text>
          )}
          {medicine.company_name && (
            <Text style={dynamicStyles.medicineDate}>
              Manufacturer: {medicine.company_name}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={dynamicStyles.editButton}
          onPress={() => navigation.navigate('MedicineDetail', { medicineId: medicine.id })}
          activeOpacity={0.8}
        >
          <Text style={dynamicStyles.editButtonText}>View</Text>
        </TouchableOpacity>
      </View>
      
      {medicine.requires_prescription && (
        <View style={dynamicStyles.prescriptionBadge}>
          <Text style={dynamicStyles.prescriptionText}>Requires Prescription</Text>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={dynamicStyles.header}>
      <View style={dynamicStyles.headerTop}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={dynamicStyles.backIcon}>←</Text>
          <Text style={dynamicStyles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Medicine Management</Text>
      </View>
      
      <TextInput
        style={dynamicStyles.searchInput}
        placeholder="Search medicines by name, category, or manufacturer..."
        placeholderTextColor={COLORS.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
        blurOnSubmit={false}
      />

      {/* Stats Cards */}
      <View style={dynamicStyles.statsRow}>
        <StatCard
          title="Total Medicines"
          value={medicines.length.toString()}
          color={COLORS.primary}
        />
        <StatCard
          title="Filtered"
          value={filteredMedicines.length.toString()}
          color={COLORS.primary}
        />
      </View>

      <TouchableOpacity
        style={dynamicStyles.addButton}
        onPress={() => navigation.navigate('AddMedicine')}
        activeOpacity={0.8}
      >
        <Text style={dynamicStyles.addButtonText}>Add New Medicine</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={dynamicStyles.emptyContainer}>
      <Text style={dynamicStyles.emptyText}>
        {searchQuery ? 'No medicines found matching your search' : 'No medicines available'}
      </Text>
    </View>
  );

  // Dynamic styles that respond to screen size
  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background || '#f5f5f5',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
      flexGrow: 1,
      paddingHorizontal: wp(4),
      paddingBottom: hp(2),
    },
    header: {
      marginBottom: hp(2),
      marginTop: hp(1),
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
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
    searchInput: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      fontSize: responsiveFontSize(16),
      color: COLORS.text,
      marginBottom: hp(2),
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(2),
    },
    statCard: {
      backgroundColor: COLORS.surface,
      padding: wp(4),
      borderRadius: wp(2),
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
    },
    statValue: {
      fontSize: responsiveFontSize(24),
      fontWeight: 'bold',
      marginBottom: hp(0.5),
    },
    statTitle: {
      fontSize: responsiveFontSize(14),
      color: COLORS.textSecondary,
      textAlign: 'center',
    },
    addButton: {
      backgroundColor: COLORS.primary,
      borderRadius: wp(2),
      paddingVertical: hp(1.8),
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
      marginBottom: hp(2),
    },
    addButtonText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(16),
      fontWeight: '600',
    },
    medicineCard: {
      backgroundColor: COLORS.surface,
      borderRadius: wp(3),
      padding: wp(4),
      marginBottom: hp(1.5),
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: COLORS.border || '#e0e0e0',
      width: isTablet() ? wp(92) : '100%',
      alignSelf: 'center',
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    medicineInfo: {
      flex: 1,
      marginRight: wp(3),
    },
    medicineName: {
      fontSize: responsiveFontSize(18),
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: hp(0.5),
      lineHeight: responsiveFontSize(22),
    },
    medicineEmail: {
      fontSize: responsiveFontSize(14),
      color: COLORS.textSecondary,
      marginBottom: hp(0.5),
    },
    medicineRole: {
      fontSize: responsiveFontSize(14),
      color: COLORS.primary,
      fontWeight: '500',
      marginBottom: hp(0.5),
    },
    medicineDate: {
      fontSize: responsiveFontSize(13),
      color: COLORS.textSecondary,
    },
    editButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: wp(6),
      paddingVertical: hp(1),
      borderRadius: wp(1.5),
    },
    editButtonText: {
      color: COLORS.surface,
      fontSize: responsiveFontSize(14),
      fontWeight: '600',
    },
    prescriptionBadge: {
      backgroundColor: COLORS.warning + '20',
      marginTop: hp(1),
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(3),
      borderRadius: wp(1),
      borderLeftWidth: 3,
      borderLeftColor: COLORS.warning,
    },
    prescriptionText: {
      fontSize: responsiveFontSize(12),
      color: COLORS.warning,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: hp(8),
      minHeight: hp(40),
    },
    emptyText: {
      fontSize: responsiveFontSize(16),
      color: COLORS.textSecondary,
      textAlign: 'center',
      paddingHorizontal: wp(8),
      lineHeight: responsiveFontSize(22),
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.background || '#f5f5f5'}
        translucent={false}
      />
      <FlatList
        data={filteredMedicines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MedicineCard medicine={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={fetchMedicines}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={dynamicStyles.container}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        key={`${screenDimensions.width}-${screenDimensions.height}`}
      />
    </SafeAreaView>
  );
};

export default MedicineListScreen;