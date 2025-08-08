// // Medicine barcode scanning 
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
// } from 'react-native';
// import { BarCodeScanner } from 'expo-barcode-scanner';
// import { globalStyles } from '../../styles/globalStyles';
// import { COLORS } from '../../utils/constants';
// import api from '../../config/api';

// const BarcodeScannerScreen = ({ navigation }) => {
//   const [hasPermission, setHasPermission] = useState(null);
//   const [scanned, setScanned] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const getBarCodeScannerPermissions = async () => {
//       const { status } = await BarCodeScanner.requestPermissionsAsync();
//       setHasPermission(status === 'granted');
//     };

//     getBarCodeScannerPermissions();
//   }, []);

//   const handleBarCodeScanned = async ({ type, data }) => {
//     setScanned(true);
//     setIsLoading(true);

//     try {
//       // Try to find medicine by barcode (assuming barcode is stored in batch_number)
//       const response = await api.get('/medicines/batches/all');
//       const batch = response.data.find(b => b.batch_number === data);

//       if (batch) {
//         Alert.alert(
//           'Medicine Found!',
//           `${batch.medicine_name}\nBatch: ${batch.batch_number}\nStock: ${batch.quantity} units\nPrice: $${batch.selling_price}`,
//           [
//             { text: 'Scan Again', onPress: () => setScanned(false) },
//             { 
//               text: 'View Details', 
//               onPress: () => navigation.navigate('MedicineDetail', { 
//                 medicineId: batch.medicine_id 
//               })
//             },
//             {
//               text: 'Add to Order',
//               onPress: () => navigation.navigate('CreateOrder', {
//                 selectedBatch: batch
//               })
//             }
//           ]
//         );
//       } else {
//         // If not found in batches, search in medicines by name
//         const medicinesResponse = await api.get('/medicines');
//         const medicine = medicinesResponse.data.find(m => 
//           m.name.toLowerCase().includes(data.toLowerCase())
//         );

//         if (medicine) {
//           Alert.alert(
//             'Medicine Found!',
//             `${medicine.name}\n${medicine.dosage_form} • ${medicine.strength}`,
//             [
//               { text: 'Scan Again', onPress: () => setScanned(false) },
//               { 
//                 text: 'View Details', 
//                 onPress: () => navigation.navigate('MedicineDetail', { 
//                   medicineId: medicine.id 
//                 })
//               }
//             ]
//           );
//         } else {
//           Alert.alert(
//             'Not Found',
//             `No medicine found with barcode: ${data}`,
//             [
//               { text: 'Scan Again', onPress: () => setScanned(false) },
//               { text: 'Add New Medicine', onPress: () => navigation.navigate('AddMedicine', { barcode: data }) }
//             ]
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Error searching medicine:', error);
//       Alert.alert(
//         'Error',
//         'Failed to search for medicine',
//         [{ text: 'Scan Again', onPress: () => setScanned(false) }]
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (hasPermission === null) {
//     return (
//       <View style={styles.container}>
//         <Text>Requesting camera permission...</Text>
//       </View>
//     );
//   }

//   if (hasPermission === false) {
//     return (
//       <View style={styles.container}>
//         <Text style={globalStyles.textPrimary}>No access to camera</Text>
//         <TouchableOpacity
//           style={globalStyles.button}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={globalStyles.buttonText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <BarCodeScanner
//         onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
//         style={StyleSheet.absoluteFillObject}
//       />
      
//       <View style={styles.overlay}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backText}>← Back</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.scanArea}>
//           <View style={styles.scanFrame} />
//           <Text style={styles.instructionText}>
//             {isLoading 
//               ? 'Searching...' 
//               : scanned 
//                 ? 'Barcode scanned!' 
//                 : 'Point camera at barcode'
//             }
//           </Text>
//         </View>

//         <View style={styles.footer}>
//           {scanned && (
//             <TouchableOpacity
//               style={globalStyles.button}
//               onPress={() => setScanned(false)}
//             >
//               <Text style={globalStyles.buttonText}>Scan Again</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'transparent',
//   },
//   header: {
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   backButton: {
//     alignSelf: 'flex-start',
//   },
//   backText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   scanArea: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scanFrame: {
//     width: 250,
//     height: 250,
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//     borderRadius: 12,
//     backgroundColor: 'transparent',
//   },
//   instructionText: {
//     color: 'white',
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 20,
//     fontWeight: '600',
//   },
//   footer: {
//     paddingBottom: 50,
//     paddingHorizontal: 20,
//   },
// });

// export default BarcodeScannerScreen;









import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const BarcodeScannerScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Barcode Scanning</Text>
      <Text style={styles.subtitle}>This feature is under development.</Text>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={globalStyles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default BarcodeScannerScreen;
