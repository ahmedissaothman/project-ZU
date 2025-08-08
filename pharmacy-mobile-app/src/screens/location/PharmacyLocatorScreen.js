// GPS + Map integration 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const PharmacyLocatorScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    fetchPharmacies();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to find nearby pharmacies');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const fetchPharmacies = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/locations');
      setPharmacies(response.data);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openDirections = (pharmacy) => {
    const url = `https://maps.google.com/?q=${pharmacy.latitude},${pharmacy.longitude}`;
    Linking.openURL(url);
  };

  const PharmacyCard = ({ pharmacy }) => {
    const distance = location 
      ? calculateDistance(
          location.latitude, 
          location.longitude, 
          parseFloat(pharmacy.latitude), 
          parseFloat(pharmacy.longitude)
        ).toFixed(1)
      : null;

    return (
      <TouchableOpacity
        style={[
          globalStyles.card,
          selectedPharmacy?.id === pharmacy.id && styles.selectedCard
        ]}
        onPress={() => setSelectedPharmacy(pharmacy)}
      >
        <Text style={globalStyles.textPrimary}>{pharmacy.pharmacy_name}</Text>
        <Text style={globalStyles.textSecondary}>{pharmacy.address}</Text>
        {distance && (
          <Text style={globalStyles.textSmall}>{distance} km away</Text>
        )}
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openDirections(pharmacy)}
          >
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('HealthServices', { pharmacyId: pharmacy.id })}
          >
            <Text style={styles.actionText}>Services</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={globalStyles.textPrimary}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            coordinate={{
              latitude: parseFloat(pharmacy.latitude),
              longitude: parseFloat(pharmacy.longitude),
            }}
            title={pharmacy.pharmacy_name}
            description={pharmacy.address}
            pinColor={selectedPharmacy?.id === pharmacy.id ? COLORS.primary : COLORS.error}
            onPress={() => setSelectedPharmacy(pharmacy)}
          />
        ))}
      </MapView>

      <View style={styles.bottomSheet}>
        <Text style={globalStyles.subHeader}>Nearby Pharmacies</Text>
        
        <FlatList
          data={pharmacies}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PharmacyCard pharmacy={item} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pharmacyList}
        />

        {selectedPharmacy && (
          <View style={styles.selectedInfo}>
            <Text style={globalStyles.textPrimary}>{selectedPharmacy.pharmacy_name}</Text>
            <Text style={globalStyles.textSecondary}>{selectedPharmacy.address}</Text>
            
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[globalStyles.button, styles.directionButton]}
                onPress={() => openDirections(selectedPharmacy)}
              >
                <Text style={globalStyles.buttonText}>Get Directions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[globalStyles.button, styles.serviceButton]}
                onPress={() => navigation.navigate('HealthServices', { 
                  pharmacyId: selectedPharmacy.id 
                })}
              >
                <Text style={globalStyles.buttonText}>View Services</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: '50%',
  },
  pharmacyList: {
    paddingVertical: 8,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  actionText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  directionButton: {
    flex: 1,
    marginRight: 8,
  },
  serviceButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: COLORS.secondary,
  },
});

export default PharmacyLocatorScreen;