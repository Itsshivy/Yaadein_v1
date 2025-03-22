// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Linking, Dimensions } from 'react-native';
// import { Card, Title, Button } from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import { Audio } from 'expo-av';
// import MapView, { Marker } from 'react-native-maps';
// import * as SecureStore from 'expo-secure-store';

// // Google Maps API Key (Replace with your own key)
// const GOOGLE_MAPS_API_KEY = 'AIzaSyD-tx3JbXEmFu9jPHIRmcwmUrYl5gOhZNI';

// const { width } = Dimensions.get('window');

// const LocationTracker = () => {
//   const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
//   const [homeLocation, setHomeLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [currentLocationName, setCurrentLocationName] = useState('');
//   const [homeLocationName, setHomeLocationName] = useState('');
//   const [manualLatitude, setManualLatitude] = useState('');
//   const [manualLongitude, setManualLongitude] = useState('');
//   const [distance, setDistance] = useState<number | null>(null);
//   const [isOutOfRange, setIsOutOfRange] = useState(false);
//   const [safeRadius, setSafeRadius] = useState(100);
//   const [emergencyContact, setEmergencyContact] = useState('');
//   const [isSaving, setIsSaving] = useState(false);
//   const [showNotification, setShowNotification] = useState(false);
//   const [showDirections, setShowDirections] = useState(false);
//   const [sirenPlaying, setSirenPlaying] = useState(false);

//   const sirenRef = useRef<Audio.Sound | null>(null);

//   // Load saved contact and home location on mount
//   useEffect(() => {
//     const loadSavedData = async () => {
//       const savedContact = await SecureStore.getItemAsync('emergencyContact');
//       if (savedContact) {
//         setEmergencyContact(savedContact);
//       }

//       const savedRadius = await SecureStore.getItemAsync('safeRadius');
//       if (savedRadius) {
//         setSafeRadius(Number(savedRadius));
//       }

//       const savedHome = await SecureStore.getItemAsync('homeLocation');
//       if (savedHome) {
//         try {
//           const parsed = JSON.parse(savedHome);
//           setHomeLocation(parsed);
//           setManualLatitude(parsed.latitude.toString());
//           setManualLongitude(parsed.longitude.toString());
//           fetchLocationName(parsed.latitude, parsed.longitude, setHomeLocationName);
//         } catch (error) {
//           console.error('Error parsing saved home location:', error);
//           await SecureStore.deleteItemAsync('homeLocation');
//         }
//       }
//     };

//     loadSavedData();
//   }, []);

//   // Initialize siren audio
//   useEffect(() => {
//     const loadSiren = async () => {
//       const { sound } = await Audio.Sound.createAsync(require('../../assets/alert-siren.mp3'));
//       sirenRef.current = sound;
//     };

//     loadSiren();

//     return () => {
//       if (sirenRef.current) {
//         sirenRef.current.unloadAsync();
//       }
//     };
//   }, []);

//   // Function to play siren
//   const playSiren = useCallback(async () => {
//     if (sirenRef.current && !sirenPlaying) {
//       await sirenRef.current.replayAsync();
//       setSirenPlaying(true);
//     }
//   }, [sirenPlaying]);

//   // Function to stop siren
//   const stopSiren = useCallback(async () => {
//     if (sirenRef.current) {
//       await sirenRef.current.stopAsync();
//       setSirenPlaying(false);
//     }
//     setIsOutOfRange(false);
//     setShowNotification(false); // Disable notifications
//   }, []);

//   // Save emergency contact and safe radius
//   const saveEmergencyContact = async () => {
//     if (!emergencyContact) {
//       Alert.alert('Error', 'Please enter a valid phone number.');
//       return;
//     }

//     setIsSaving(true);
//     try {
//       const phoneRegex = /^\+?[\d\s-]{10,}$/;
//       if (!phoneRegex.test(emergencyContact)) {
//         throw new Error('Please enter a valid phone number with country code.');
//       }

//       await SecureStore.setItemAsync('emergencyContact', emergencyContact);
//       await SecureStore.setItemAsync('safeRadius', safeRadius.toString());

//       Alert.alert('Success', 'Emergency contact and safe radius saved successfully!');
//     } catch (error) {
//       Alert.alert('Error', (error as Error).message || 'Error saving emergency contact. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Calculate distance between two coordinates
//   const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = (lat1 * Math.PI) / 180;
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//     const a =
//       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c; // Distance in meters
//   }, []);

//   // Fetch location name from coordinates
//   const fetchLocationName = async (latitude: number, longitude: number, setLocationName: (name: string) => void) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
//       );
//       const data = await response.json();
//       if (data.results && data.results[0]) {
//         setLocationName(data.results[0].formatted_address);
//       }
//     } catch (error) {
//       console.error('Error fetching location name:', error);
//     }
//   };

//   // Set current location as home
//   const setCurrentAsHome = useCallback(async () => {
//     if (currentLocation) {
//       const newHomeLocation = {
//         latitude: currentLocation.coords.latitude,
//         longitude: currentLocation.coords.longitude,
//       };
//       setHomeLocation(newHomeLocation);
//       setManualLatitude(newHomeLocation.latitude.toString());
//       setManualLongitude(newHomeLocation.longitude.toString());
//       await SecureStore.setItemAsync('homeLocation', JSON.stringify(newHomeLocation));
//       fetchLocationName(newHomeLocation.latitude, newHomeLocation.longitude, setHomeLocationName);
//     }
//   }, [currentLocation]);

//   // Set manual home location
//   const setManualHomeLocation = async () => {
//     const lat = parseFloat(manualLatitude);
//     const lng = parseFloat(manualLongitude);

//     if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
//       Alert.alert('Error', 'Please enter valid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
//       return;
//     }

//     const newHomeLocation = { latitude: lat, longitude: lng };
//     setHomeLocation(newHomeLocation);
//     await SecureStore.setItemAsync('homeLocation', JSON.stringify(newHomeLocation));
//     fetchLocationName(lat, lng, setHomeLocationName);

//     if (currentLocation) {
//       const newDistance = calculateDistance(
//         currentLocation.coords.latitude,
//         currentLocation.coords.longitude,
//         lat,
//         lng
//       );
//       setDistance(newDistance);

//       const outOfRange = newDistance > safeRadius;
//       if (outOfRange && !isOutOfRange) {
//         setIsOutOfRange(true);
//         setShowNotification(true);
//         setShowDirections(true);
//         showSimpleNotification();
//         setTimeout(() => playSiren(), 1000); // Start siren after 1 second
//       } else if (!outOfRange && isOutOfRange) {
//         stopSiren();
//       }
//     }
//   };

//   // Show a simple notification
//   const showSimpleNotification = useCallback(() => {
//     if (showNotification) {
//       Alert.alert(
//         'Location Alert',
//         'You have wandered too far from home!',
//         [
//           {
//             text: 'Get Directions',
//             onPress: () => Linking.openURL(getDirectionsUrl()),
//           },
//           { text: 'OK', onPress: () => {} },
//         ]
//       );
//     }
//   }, [currentLocation, homeLocation, showNotification]);

//   // Get Google Maps directions URL
//   const getDirectionsUrl = useCallback(() => {
//     if (currentLocation && homeLocation) {
//       return `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.coords.latitude},${currentLocation.coords.longitude}&destination=${homeLocation.latitude},${homeLocation.longitude}&travelmode=walking`;
//     }
//     return '';
//   }, [currentLocation, homeLocation]);

//   // Watch user's location
//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Location access is required for this app to function.');
//         return;
//       }

//       Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         (location) => {
//           setCurrentLocation(location);
//           fetchLocationName(location.coords.latitude, location.coords.longitude, setCurrentLocationName);

//           if (homeLocation) {
//             const dist = calculateDistance(
//               location.coords.latitude,
//               location.coords.longitude,
//               homeLocation.latitude,
//               homeLocation.longitude
//             );
//             setDistance(dist);

//             const outOfRange = dist > safeRadius;
//             if (outOfRange && !isOutOfRange && showNotification) {
//               setIsOutOfRange(true);
//               setShowNotification(true);
//               setShowDirections(true);
//               showSimpleNotification();
//               setTimeout(() => playSiren(), 1000); // Start siren after 1 second
//             } else if (!outOfRange && isOutOfRange) {
//               stopSiren();
//             }
//           }
//         }
//       );
//     })();
//   }, [homeLocation, safeRadius, calculateDistance, showSimpleNotification, isOutOfRange, stopSiren, playSiren, showNotification]);

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Card style={styles.card}>
//         <Card.Content>
//           <Title style={styles.title}>Emergency Contact Setup</Title>
//           <TextInput
//             style={styles.input}
//             placeholder="Emergency Contact Number (with country code)"
//             value={emergencyContact}
//             onChangeText={setEmergencyContact}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Safe Radius (meters)"
//             value={safeRadius.toString()}
//             onChangeText={(text) => setSafeRadius(Number(text))}
//             keyboardType="numeric"
//           />
//           <Button mode="contained" onPress={saveEmergencyContact} disabled={isSaving} style={styles.button}>
//             {isSaving ? 'Saving...' : 'Save Emergency Contact & Safe Radius'}
//           </Button>
//         </Card.Content>
//       </Card>

//       <Card style={styles.card}>
//         <Card.Content>
//           <Title style={styles.title}>Location Status</Title>
//           {currentLocation && (
//             <View>
//               <Text style={styles.sectionTitle}>Current Location</Text>
//               <Text style={styles.text}>{currentLocationName || 'Loading...'}</Text>
//               <Button mode="contained" onPress={setCurrentAsHome} style={styles.button}>
//                 Set as Home Location
//               </Button>
//             </View>
//           )}

//           {homeLocation && (
//             <View>
//               <Text style={styles.sectionTitle}>Home Location</Text>
//               <Text style={styles.text}>{homeLocationName || 'Loading...'}</Text>
//               {distance && <Text style={styles.text}>Distance from home: {distance.toFixed(0)} meters</Text>}
//             </View>
//           )}

//           <TextInput
//             style={styles.input}
//             placeholder="Latitude (e.g., 51.5074)"
//             value={manualLatitude}
//             onChangeText={setManualLatitude}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Longitude (e.g., -0.1278)"
//             value={manualLongitude}
//             onChangeText={setManualLongitude}
//           />
//           <Button mode="contained" onPress={setManualHomeLocation} style={styles.button}>
//             Set Manual Home Location
//           </Button>

//           {isOutOfRange && (
//             <View style={styles.alert}>
//               <MaterialCommunityIcons name="alert" size={24} color="red" />
//               <Text style={styles.alertText}>You have wandered {distance?.toFixed(0)} meters away from home!</Text>
//               <Button mode="contained" onPress={() => Linking.openURL(getDirectionsUrl())} style={styles.button}>
//                 Get Directions to Home
//               </Button>
//             </View>
//           )}

//           {isOutOfRange && (
//             <Button mode="contained" onPress={stopSiren} color="red" style={styles.button}>
//               Stop Siren
//             </Button>
//           )}
//         </Card.Content>
//       </Card>

//       {currentLocation && (
//         <Card style={styles.card}>
//           <Card.Content>
//             <Title style={styles.title}>{showDirections ? 'Directions Back Home' : 'Location Map'}</Title>
//             <MapView
//               style={styles.map}
//               initialRegion={{
//                 latitude: currentLocation.coords.latitude,
//                 longitude: currentLocation.coords.longitude,
//                 latitudeDelta: 0.0922,
//                 longitudeDelta: 0.0421,
//               }}
//             >
//               <Marker coordinate={currentLocation.coords} />
//               {homeLocation && <Marker coordinate={homeLocation} pinColor="green" />}
//             </MapView>
//             {showDirections && homeLocation && (
//               <Button mode="contained" onPress={() => Linking.openURL(getDirectionsUrl())} style={styles.button}>
//                 Open Directions in Google Maps
//               </Button>
//             )}
//           </Card.Content>
//         </Card>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20, // Increased padding
//     paddingBottom: 40, // Extra padding at the bottom
//   },
//   card: {
//     marginBottom: 20, // Increased margin
//     borderRadius: 8,
//     elevation: 4,
//     width: width - 40, // Adjusted width to fit within screen
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#555',
//   },
//   input: {
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#fff',
//   },
//   button: {
//     marginTop: 8,
//     marginBottom: 8,
//     paddingVertical: 8,
//   },
//   text: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#666',
//   },
//   alert: {
//     flexDirection: 'column', // Changed to column layout
//     alignItems: 'flex-start', // Align items to the left
//     marginBottom: 16,
//     backgroundColor: '#ffebee',
//     padding: 12,
//     borderRadius: 4,
//   },
//   alertText: {
//     fontSize: 16,
//     marginBottom: 8, // Added margin below the text
//     color: '#d32f2f',
//   },
//   map: {
//     height: 300,
//     marginBottom: 16,
//     borderRadius: 8,
//   },
// });

// export default LocationTracker;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Linking, Dimensions } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import MapView, { Marker } from 'react-native-maps';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Google Maps API Key (Replace with your own key)
const GOOGLE_MAPS_API_KEY = 'AIzaSyD-tx3JbXEmFu9jPHIRmcwmUrYl5gOhZNI';

const { width } = Dimensions.get('window');

const LocationTracker = () => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [homeLocation, setHomeLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('');
  const [homeLocationName, setHomeLocationName] = useState('');
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [isOutOfRange, setIsOutOfRange] = useState(false);
  const [safeRadius, setSafeRadius] = useState(100);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  const sirenRef = useRef<Audio.Sound | null>(null);

  // Load saved contact and home location on mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedContact = await SecureStore.getItemAsync('emergencyContact');
      if (savedContact) {
        setEmergencyContact(savedContact);
      }

      const savedRadius = await SecureStore.getItemAsync('safeRadius');
      if (savedRadius) {
        setSafeRadius(Number(savedRadius));
      }

      const savedHome = await SecureStore.getItemAsync('homeLocation');
      if (savedHome) {
        try {
          const parsed = JSON.parse(savedHome);
          setHomeLocation(parsed);
          setManualLatitude(parsed.latitude.toString());
          setManualLongitude(parsed.longitude.toString());
          fetchLocationName(parsed.latitude, parsed.longitude, setHomeLocationName);
        } catch (error) {
          console.error('Error parsing saved home location:', error);
          await SecureStore.deleteItemAsync('homeLocation');
        }
      }
    };

    loadSavedData();
  }, []);

  // Initialize siren audio
  useEffect(() => {
    const loadSiren = async () => {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/alert-siren.mp3'));
      sirenRef.current = sound;
    };

    loadSiren();

    return () => {
      if (sirenRef.current) {
        sirenRef.current.unloadAsync();
      }
    };
  }, []);

  // Function to play siren
  const playSiren = useCallback(async () => {
    if (sirenRef.current && !sirenPlaying) {
      await sirenRef.current.replayAsync();
      setSirenPlaying(true);
    }
  }, [sirenPlaying]);

  // Function to stop siren
  const stopSiren = useCallback(async () => {
    if (sirenRef.current) {
      await sirenRef.current.stopAsync();
      setSirenPlaying(false);
    }
    setIsOutOfRange(false);
    setShowNotification(false); // Disable notifications
  }, []);

  // Save emergency contact and safe radius
  const saveEmergencyContact = async () => {
    if (!emergencyContact) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    setIsSaving(true);
    try {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(emergencyContact)) {
        throw new Error('Please enter a valid phone number with country code.');
      }

      await SecureStore.setItemAsync('emergencyContact', emergencyContact);
      await SecureStore.setItemAsync('safeRadius', safeRadius.toString());

      Alert.alert('Success', 'Emergency contact and safe radius saved successfully!');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Error saving emergency contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  // Fetch location name from coordinates
  const fetchLocationName = async (latitude: number, longitude: number, setLocationName: (name: string) => void) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        setLocationName(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
  };

  // Send SMS using Twilio
  // Update the sendSMS function in your Expo project
const sendSMS = async (message: string) => {
  const savedContact = await SecureStore.getItemAsync('emergencyContact');
  if (!savedContact) {
    console.error('No emergency contact found.');
    return;
  }

  try {
    const response = await axios.post('https://your-vercel-or-netlify-url/api/send-sms', {
      to: savedContact,
      body: message,
    });

    if (response.data.success) {
      console.log('SMS sent successfully!');
    } else {
      console.error('Failed to send SMS:', response.data.message);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

  // Set current location as home
  const setCurrentAsHome = useCallback(async () => {
    if (currentLocation) {
      const newHomeLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setHomeLocation(newHomeLocation);
      setManualLatitude(newHomeLocation.latitude.toString());
      setManualLongitude(newHomeLocation.longitude.toString());
      await SecureStore.setItemAsync('homeLocation', JSON.stringify(newHomeLocation));
      fetchLocationName(newHomeLocation.latitude, newHomeLocation.longitude, setHomeLocationName);
    }
  }, [currentLocation]);

  // Set manual home location
  const setManualHomeLocation = async () => {
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Error', 'Please enter valid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }

    const newHomeLocation = { latitude: lat, longitude: lng };
    setHomeLocation(newHomeLocation);
    await SecureStore.setItemAsync('homeLocation', JSON.stringify(newHomeLocation));
    fetchLocationName(lat, lng, setHomeLocationName);

    if (currentLocation) {
      const newDistance = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        lat,
        lng
      );
      setDistance(newDistance);

      const outOfRange = newDistance > safeRadius;
      if (outOfRange && !isOutOfRange) {
        setIsOutOfRange(true);
        setShowNotification(true);
        setShowDirections(true);
        showSimpleNotification();
        setTimeout(() => playSiren(), 1000); // Start siren after 1 second

        // Send SMS
        const message = `The person has wandered off the secure location zone. Current location: ${currentLocationName}`;
        sendSMS(message);
      } else if (!outOfRange && isOutOfRange) {
        stopSiren();
      }
    }
  };

  // Show a simple notification
  const showSimpleNotification = useCallback(() => {
    if (showNotification) {
      Alert.alert(
        'Location Alert',
        'You have wandered too far from home!',
        [
          {
            text: 'Get Directions',
            onPress: () => Linking.openURL(getDirectionsUrl()),
          },
          { text: 'OK', onPress: () => {} },
        ]
      );
    }
  }, [currentLocation, homeLocation, showNotification]);

  // Get Google Maps directions URL
  const getDirectionsUrl = useCallback(() => {
    if (currentLocation && homeLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.coords.latitude},${currentLocation.coords.longitude}&destination=${homeLocation.latitude},${homeLocation.longitude}&travelmode=walking`;
    }
    return '';
  }, [currentLocation, homeLocation]);

  // Watch user's location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for this app to function.');
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation(location);
          fetchLocationName(location.coords.latitude, location.coords.longitude, setCurrentLocationName);

          if (homeLocation) {
            const dist = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              homeLocation.latitude,
              homeLocation.longitude
            );
            setDistance(dist);

            const outOfRange = dist > safeRadius;
            if (outOfRange && !isOutOfRange && showNotification) {
              setIsOutOfRange(true);
              setShowNotification(true);
              setShowDirections(true);
              showSimpleNotification();
              setTimeout(() => playSiren(), 1000); // Start siren after 1 second

              // Send SMS
              const message = `The person has wandered off the secure location zone. Current location: ${currentLocationName}`;
              sendSMS(message);
            } else if (!outOfRange && isOutOfRange) {
              stopSiren();
            }
          }
        }
      );
    })();
  }, [homeLocation, safeRadius, calculateDistance, showSimpleNotification, isOutOfRange, stopSiren, playSiren, showNotification]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Emergency Contact Setup</Title>
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Number (with country code)"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />
          <TextInput
            style={styles.input}
            placeholder="Safe Radius (meters)"
            value={safeRadius.toString()}
            onChangeText={(text) => setSafeRadius(Number(text))}
            keyboardType="numeric"
          />
          <Button mode="contained" onPress={saveEmergencyContact} disabled={isSaving} style={styles.button}>
            {isSaving ? 'Saving...' : 'Save Emergency Contact & Safe Radius'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Location Status</Title>
          {currentLocation && (
            <View>
              <Text style={styles.sectionTitle}>Current Location</Text>
              <Text style={styles.text}>{currentLocationName || 'Loading...'}</Text>
              <Button mode="contained" onPress={setCurrentAsHome} style={styles.button}>
                Set as Home Location
              </Button>
            </View>
          )}

          {homeLocation && (
            <View>
              <Text style={styles.sectionTitle}>Home Location</Text>
              <Text style={styles.text}>{homeLocationName || 'Loading...'}</Text>
              {distance && <Text style={styles.text}>Distance from home: {distance.toFixed(0)} meters</Text>}
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Latitude (e.g., 51.5074)"
            value={manualLatitude}
            onChangeText={setManualLatitude}
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude (e.g., -0.1278)"
            value={manualLongitude}
            onChangeText={setManualLongitude}
          />
          <Button mode="contained" onPress={setManualHomeLocation} style={styles.button}>
            Set Manual Home Location
          </Button>

          {isOutOfRange && (
            <View style={styles.alert}>
              <MaterialCommunityIcons name="alert" size={24} color="red" />
              <Text style={styles.alertText}>You have wandered {distance?.toFixed(0)} meters away from home!</Text>
              <Button mode="contained" onPress={() => Linking.openURL(getDirectionsUrl())} style={styles.button}>
                Get Directions to Home
              </Button>
            </View>
          )}

          {isOutOfRange && (
            <Button mode="contained" onPress={stopSiren} color="red" style={styles.button}>
              Stop Siren
            </Button>
          )}
        </Card.Content>
      </Card>

      {currentLocation && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{showDirections ? 'Directions Back Home' : 'Location Map'}</Title>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker coordinate={currentLocation.coords} />
              {homeLocation && <Marker coordinate={homeLocation} pinColor="green" />}
            </MapView>
            {showDirections && homeLocation && (
              <Button mode="contained" onPress={() => Linking.openURL(getDirectionsUrl())} style={styles.button}>
                Open Directions in Google Maps
              </Button>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20, // Increased padding
    paddingBottom: 40, // Extra padding at the bottom
  },
  card: {
    marginBottom: 20, // Increased margin
    borderRadius: 8,
    elevation: 4,
    width: width - 40, // Adjusted width to fit within screen
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  alert: {
    flexDirection: 'column', // Changed to column layout
    alignItems: 'flex-start', // Align items to the left
    marginBottom: 16,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 4,
  },
  alertText: {
    fontSize: 16,
    marginBottom: 8, // Added margin below the text
    color: '#d32f2f',
  },
  map: {
    height: 300,
    marginBottom: 16,
    borderRadius: 8,
  },
});

export default LocationTracker;