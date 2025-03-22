

// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Image,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { Camera as CameraIcon, Send, Image as ImageIcon, Mic, Circle } from 'lucide-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as FileSystem from 'expo-file-system';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Audio } from 'expo-av';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import NotificationContext from '../context/NotificationContext'; // Import the NotificationContext

// const MemoryJournalApp = () => {
//   const [entry, setEntry] = useState('');
//   const [mood, setMood] = useState<string | null>(null);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [capturedAudio, setCapturedAudio] = useState<string | null>(null);
//   const [entries, setEntries] = useState<Array<{ date: string; text: string; image?: string; audio?: string }>>([]);
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isLoading, setIsLoading] = useState(false); // Loading state for notifications

//   const { notifications, addNotification } = useContext(NotificationContext); // Use the NotificationContext

//   const apiKey = 'AIzaSyCGIiVPxz-3AGe1WfcVcnWIHisi6X54djU'; // Replace with your Gemini API key
//   const genAI = new GoogleGenerativeAI(apiKey);

//   useEffect(() => {
//     const loadEntries = async () => {
//       const savedEntries = await AsyncStorage.getItem('journalEntries');
//       if (savedEntries) {
//         setEntries(JSON.parse(savedEntries));
//       }
//     };
//     loadEntries();
//   }, []);

//   useEffect(() => {
//     const saveEntries = async () => {
//       const limitedEntries = entries.slice(0, 50);
//       await AsyncStorage.setItem('journalEntries', JSON.stringify(limitedEntries));
//     };
//     saveEntries();
//   }, [entries]);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: false,
//       aspect: [4, 3],
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       const imageUri = result.assets[0].uri;
//       if (!FileSystem.documentDirectory) {
//         alert('File system is not available.');
//         return;
//       }
//       const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
//       const newPath = FileSystem.documentDirectory + fileName;
//       await FileSystem.moveAsync({ from: imageUri, to: newPath });
//       setCapturedImage(newPath);
//     }
//   };

//   const takePhoto = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: false,
//       aspect: [4, 3],
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       const imageUri = result.assets[0].uri;
//       if (!FileSystem.documentDirectory) {
//         alert('File system is not available.');
//         return;
//       }
//       const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
//       const newPath = FileSystem.documentDirectory + fileName;
//       await FileSystem.moveAsync({ from: imageUri, to: newPath });
//       setCapturedImage(newPath);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });
//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );
//       setRecording(recording);
//       setIsRecording(true);
//     } catch (err) {
//       console.error('Failed to start recording', err);
//     }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;

//     try {
//       await recording.stopAndUnloadAsync();
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//       });
//       const uri = recording.getURI();
//       if (!FileSystem.documentDirectory) {
//         alert('File system is not available.');
//         return;
//       }
//       const fileName = uri?.split('/').pop() || `audio_${Date.now()}.m4a`;
//       const newPath = FileSystem.documentDirectory + fileName;
//       await FileSystem.moveAsync({ from: uri!, to: newPath });
//       setCapturedAudio(newPath);
//       setRecording(null);
//       setIsRecording(false);
//     } catch (err) {
//       console.error('Failed to stop recording', err);
//     }
//   };

//   const toggleRecording = async () => {
//     if (isRecording) {
//       await stopRecording();
//     } else {
//       await startRecording();
//     }
//   };

//   const sendToGemini = async (journalData: { date: string; text: string; image?: string; audio?: string }) => {
//     const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
//     const prompt = `
//       You are a memory assistant for dementia patients. Analyze the following journal entry and generate:
//       1. Personalized notification to help the user remember this memory.
//       2. Therapy recommendations (music and exercise) based on the sentiment of the journal text.
  
//       Journal Data:
//       - Date: ${journalData.date}
//       - Text: ${journalData.text}
//       - Image: ${journalData.image ? 'Available' : 'Not Available'}
//       - Audio: ${journalData.audio ? 'Available' : 'Not Available'}
  
//       Return the response in JSON format:
//       {
//         "date": "${journalData.date}",
//         "journalText": "${journalData.text}",
//         "notifications": "Notification",
//         "therapy": {
//           "music": "Music Recommendation",
//           "exercise": "Exercise Recommendation"
//         }
//       }
//     `;
  
//     try {
//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       const text = response.text();
  
//       // Log the raw response for debugging
//       console.log('Raw Gemini Response:', text);
  
//       // Extract JSON from the response (if needed)
//       const jsonMatch = text.match(/\{.*\}/s); // Match the first JSON object in the response
//       if (!jsonMatch) {
//         throw new Error('No valid JSON found in the response');
//       }
  
//       const jsonString = jsonMatch[0];
//       const parsedResponse = JSON.parse(jsonString);
  
//       return parsedResponse;
//     } catch (error) {
//       console.error('Error sending data to Gemini:', error);
//       return null;
//     }
//   };

//   const addEntry = async () => {
//     if (!entry.trim() && !capturedImage && !capturedAudio) return;

//     setIsLoading(true); // Start loading

//     const newJournalEntry = {
//       date: new Date().toISOString(),
//       text: entry,
//       image: capturedImage || undefined,
//       audio: capturedAudio || undefined,
//     };

//     // Send journal data to Gemini
//     const geminiResponse = await sendToGemini(newJournalEntry);
//     if (geminiResponse) {
//       console.log('Gemini Response:', geminiResponse);

//       // Add notifications to context
//       addNotification(newJournalEntry.date, geminiResponse);
//     }

//     // Save journal entry
//     setEntries([newJournalEntry, ...entries]);
//     setEntry('');
//     setCapturedImage(null);
//     setCapturedAudio(null);
//     setIsLoading(false); // Stop loading
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

//     if (diffInDays === 0) return 'Today';
//     if (diffInDays === 1) return 'Yesterday';
//     if (diffInDays < 7) return 'Last Week';
//     if (diffInDays < 30) return 'Last Month';
//     return 'Older';
//   };

//   const moods = [
//     { emoji: '😀', label: 'Happy' },
//     { emoji: '😐', label: 'Neutral' },
//     { emoji: '😢', label: 'Sad' },
//   ];

//   const playAudio = async (audioUri: string) => {
//     const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
//     await sound.playAsync();
//   };

//   const NotificationTab = () => {
//     return (
//       <ScrollView style={styles.notificationTab}>
//         {Object.keys(notifications).length === 0 ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#4B0082" />
//             <Text style={styles.loadingText}>Loading notifications...</Text>
//           </View>
//         ) : (
//           Object.entries(notifications).map(([date, data]) => (
//             <View key={date} style={styles.notificationCard}>
//               <Text style={styles.notificationDate}>{formatDate(date)}</Text>
//               <Text style={styles.notificationText}>{data.journalText}</Text>
//               {/* Check if notifications is an array before mapping */}
//               {Array.isArray(data.notifications) && data.notifications.map((notification, index) => (
//                 <Text key={index} style={styles.notificationItem}>
//                   {notification}
//                 </Text>
//               ))}
//               {data.image && <Image source={{ uri: data.image }} style={styles.notificationImage} />}
//               {data.audio && (
//                 <TouchableOpacity onPress={() => playAudio(data.audio!)} style={styles.audioButton}>
//                   <Text style={styles.audioButtonText}>Play Audio</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))
//         )}
//       </ScrollView>
//     );
//   };

//   return (
//     <LinearGradient colors={['#E6E6FA', '#D8BFD8']} style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Memory Journal</Text>
//         <View style={styles.tabs}>
//           <TouchableOpacity onPress={() => setActiveTab('dashboard')}>
//             <Text style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}>Dashboard</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setActiveTab('journal')}>
//             <Text style={[styles.tab, activeTab === 'journal' && styles.activeTab]}>Journal</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setActiveTab('notifications')}>
//             <Text style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}>Notifications</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {activeTab === 'dashboard' && (
//         <ScrollView style={styles.dashboard}>
//           <Text style={styles.sectionTitle}>Recent Memories</Text>
//           {entries.slice(0, 3).map((entry, index) => (
//             <View key={index} style={styles.dashboardEntry}>
//               <Text style={styles.dashboardEntryDate}>{formatDate(entry.date)}</Text>
//               <Text style={styles.dashboardEntryText}>{entry.text}</Text>
//               {entry.image && <Image source={{ uri: entry.image }} style={styles.dashboardEntryImage} />}
//               {entry.audio && (
//                 <TouchableOpacity onPress={() => playAudio(entry.audio!)} style={styles.audioButton}>
//                   <Text style={styles.audioButtonText}>Play Audio</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))}
//         </ScrollView>
//       )}

//       {activeTab === 'journal' && (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.journal}
//         >
//           <ScrollView>
//             <View style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <Text style={styles.cardTitle}>Today's Memory</Text>
//               </View>
//               <View style={styles.cardContent}>
//                 <View style={styles.moodContainer}>
//                   {moods.map(({ emoji, label }) => (
//                     <TouchableOpacity
//                       key={label}
//                       onPress={() => setMood(label)}
//                       style={[styles.moodButton, mood === label && styles.activeMood]}
//                     >
//                       <Text style={styles.moodEmoji}>{emoji}</Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>

//                 {capturedImage && (
//                   <View style={styles.capturedImageContainer}>
//                     <Text style={styles.capturedImageLabel}>Memory Image:</Text>
//                     <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
//                   </View>
//                 )}

//                 {capturedAudio && (
//                   <View style={styles.capturedAudioContainer}>
//                     <Text style={styles.capturedAudioLabel}>Memory Audio:</Text>
//                     <TouchableOpacity onPress={() => playAudio(capturedAudio)} style={styles.audioButton}>
//                       <Text style={styles.audioButtonText}>Play Audio</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}

//                 <View style={styles.textInputContainer}>
//                   <TextInput
//                     value={entry}
//                     onChangeText={setEntry}
//                     placeholder="Describe this memory..."
//                     style={styles.textInput}
//                     multiline
//                     placeholderTextColor="#888"
//                   />
//                   <View style={styles.actions}>
//                     <TouchableOpacity onPress={takePhoto} style={styles.actionButton}>
//                       <CameraIcon size={24} color="#fff" />
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
//                       <ImageIcon size={24} color="#fff" />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={toggleRecording}
//                       style={[styles.actionButton, isRecording && styles.recordingButton]}
//                     >
//                       {isRecording ? (
//                         <View style={styles.recordingIndicator}>
//                           <Circle size={24} color="#fff" fill="#ff0000" />
//                         </View>
//                       ) : (
//                         <Mic size={24} color="#fff" />
//                       )}
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={addEntry} style={styles.actionButton}>
//                       <Send size={24} color="#fff" />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       )}

//       {activeTab === 'notifications' && <NotificationTab />}
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   header: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#4B0082',
//   },
//   tabs: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   tab: {
//     fontSize: 16,
//     marginHorizontal: 10,
//     color: '#4B0082',
//   },
//   activeTab: {
//     color: '#9370DB',
//     fontWeight: 'bold',
//   },
//   dashboard: {
//     flex: 1,
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#4B0082',
//   },
//   dashboardEntry: {
//     backgroundColor: '#E6E6FA',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dashboardEntryDate: {
//     fontSize: 14,
//     color: '#4B0082',
//     marginBottom: 8,
//   },
//   dashboardEntryText: {
//     fontSize: 16,
//     color: '#4B0082',
//   },
//   dashboardEntryImage: {
//     width: '100%',
//     height: 150,
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   journal: {
//     flex: 1,
//     padding: 16,
//   },
//   card: {
//     backgroundColor: '#E6E6FA',
//     borderRadius: 8,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardHeader: {
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#4B0082',
//   },
//   cardContent: {
//     padding: 16,
//   },
//   moodContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 16,
//   },
//   moodButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: '#bca8e6',
//   },
//   activeMood: {
//     backgroundColor: '#c490d1',
//   },
//   moodEmoji: {
//     fontSize: 24,
//   },
//   capturedImageContainer: {
//     marginTop: 16,
//   },
//   capturedImageLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#c393e6',
//   },
//   capturedImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   capturedAudioContainer: {
//     marginTop: 16,
//   },
//   capturedAudioLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#c393e6',
//   },
//   audioButton: {
//     backgroundColor: '#9370DB',
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   audioButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   textInputContainer: {
//     marginTop: 16,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 16,
//     minHeight: 100,
//     fontSize: 16,
//     color: '#333',
//     backgroundColor: '#fff',
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 16,
//   },
//   actionButton: {
//     padding: 12,
//     borderRadius: 50,
//     backgroundColor: '#9370DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   recordingButton: {
//     backgroundColor: '#ff0000',
//   },
//   recordingIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   notificationTab: {
//     flex: 1,
//     padding: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#4B0082',
//     marginTop: 10,
//   },
//   notificationCard: {
//     backgroundColor: '#E6E6FA',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   notificationDate: {
//     fontSize: 14,
//     color: '#4B0082',
//     marginBottom: 8,
//   },
//   notificationText: {
//     fontSize: 16,
//     color: '#4B0082',
//     marginBottom: 8,
//   },
//   notificationItem: {
//     fontSize: 14,
//     color: '#4B0082',
//     marginBottom: 4,
//   },
//   notificationImage: {
//     width: '100%',
//     height: 150,
//     borderRadius: 8,
//     marginTop: 10,
//   },
// });

// export default MemoryJournalApp;




import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera as CameraIcon, Send, Image as ImageIcon, Mic, Circle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { GoogleGenerativeAI } from '@google/generative-ai';
import NotificationContext from '../context/NotificationContext'; // Import the NotificationContext
import * as Notifications from 'expo-notifications';

const MemoryJournalApp = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedAudio, setCapturedAudio] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ date: string; text: string; image?: string; audio?: string }>>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for notifications

  const { notifications, addNotification, removeNotification } = useContext(NotificationContext); // Use the NotificationContext

  const apiKey = 'AIzaSyCGIiVPxz-3AGe1WfcVcnWIHisi6X54djU'; // Replace with your Gemini API key
  const genAI = new GoogleGenerativeAI(apiKey);

  useEffect(() => {
    const loadEntries = async () => {
      const savedEntries = await AsyncStorage.getItem('journalEntries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    };
    loadEntries();
  }, []);

  useEffect(() => {
    const saveEntries = async () => {
      const limitedEntries = entries.slice(0, 50);
      await AsyncStorage.setItem('journalEntries', JSON.stringify(limitedEntries));
    };
    saveEntries();
  }, [entries]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      if (!FileSystem.documentDirectory) {
        alert('File system is not available.');
        return;
      }
      const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.moveAsync({ from: imageUri, to: newPath });
      setCapturedImage(newPath);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      if (!FileSystem.documentDirectory) {
        alert('File system is not available.');
        return;
      }
      const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.moveAsync({ from: imageUri, to: newPath });
      setCapturedImage(newPath);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      if (!FileSystem.documentDirectory) {
        alert('File system is not available.');
        return;
      }
      const fileName = uri?.split('/').pop() || `audio_${Date.now()}.m4a`;
      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.moveAsync({ from: uri!, to: newPath });
      setCapturedAudio(newPath);
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const sendToGemini = async (journalData: { date: string; text: string; image?: string; audio?: string }) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
    const prompt = `
      You are a memory assistant for dementia patients. Analyze the following journal entry and generate:
      1. A personalized notification to help the user remember this memory.
      2. A music therapy recommendation based on the sentiment of the journal text.
      3. An exercise therapy recommendation based on the sentiment of the journal text.
  
      Journal Data:
      - Date: ${journalData.date}
      - Text: ${journalData.text}
      - Image: ${journalData.image ? 'Available' : 'Not Available'}
      - Audio: ${journalData.audio ? 'Available' : 'Not Available'}
  
      Return the response in JSON format:
      {
        "date": "${journalData.date}",
        "journalText": "${journalData.text}",
        "notifications": {
          "memory": "Memory Notification",
          "music": "Music Therapy Recommendation",
          "exercise": "Exercise Therapy Recommendation"
        },
        "image": "${journalData.image || ''}",
        "audio": "${journalData.audio || ''}"
      }
    `;
  
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
  
      // Log the raw response for debugging
      console.log('Raw Gemini Response:', text);
  
      // Extract JSON from the response
      const jsonMatch = text.match(/\{.*\}/s); // Match the first JSON object in the response
      if (!jsonMatch) {
        throw new Error('No valid JSON found in the response');
      }
  
      const jsonString = jsonMatch[0];
      const parsedResponse = JSON.parse(jsonString);
  
      return parsedResponse;
    } catch (error) {
      console.error('Error sending data to Gemini:', error);
      return null;
    }
  };

  

  const addEntry = async () => {
    if (!entry.trim() && !capturedImage && !capturedAudio) return;
  
    setIsLoading(true); // Start loading
  
    const newJournalEntry = {
      date: new Date().toISOString(),
      text: entry,
      image: capturedImage || undefined,
      audio: capturedAudio || undefined,
    };
  
    // Send journal data to Gemini
    const geminiResponse = await sendToGemini(newJournalEntry);
    if (geminiResponse) {
      console.log('Gemini Response:', geminiResponse);
  
      // Add notifications to context
      const notificationData = {
        date: geminiResponse.date,
        journalText: geminiResponse.journalText,
        notifications: [
          geminiResponse.notifications.memory,
          geminiResponse.notifications.music,
          geminiResponse.notifications.exercise,
        ],
        therapy: {
          music: geminiResponse.notifications.music,
          exercise: geminiResponse.notifications.exercise,
        },
        image: geminiResponse.image,
        audio: geminiResponse.audio,
      };
  
      addNotification(geminiResponse.date, notificationData);
    }
  
    // Save journal entry
    setEntries([newJournalEntry, ...entries]);
    setEntry('');
    setCapturedImage(null);
    setCapturedAudio(null);
    setIsLoading(false); // Stop loading

    // Schedule a fake notification
    await Notifications.scheduleNotificationAsync({
    content: {
      title: 'REMEMBER ME', // Notification title
      body: 'notification', // Notification body
      data: { date: newJournalEntry.date }, // Pass the date to identify the notification
    },
    trigger: { seconds: 60 }, 
  });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return 'Last Week';
    if (diffInDays < 30) return 'Last Month';
    return 'Older';
  };

  const moods = [
    { emoji: '😀', label: 'Happy' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😢', label: 'Sad' },
  ];

  const playAudio = async (audioUri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();
  };

  const NotificationTab = () => {
  
    return (
      <ScrollView style={styles.notificationTab}>
        {Object.keys(notifications).length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B0082" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          Object.entries(notifications).map(([date, data]) => (
            <View key={date} style={styles.notificationCard}>
              {/* Cross Button to Delete Notification */}
              <TouchableOpacity
                onPress={() => removeNotification(date)} // Call removeNotification
                style={styles.crossButton}
              >
                <Text style={styles.crossButtonText}>×</Text>
              </TouchableOpacity>
  
              <Text style={styles.notificationDate}>{formatDate(date)}</Text>
              <Text style={styles.notificationText}>{data.journalText}</Text>
  
              {/* Display Memory Notification */}
              <Text style={styles.notificationItem}>
                <Text style={{ fontWeight: 'bold' }}>Memory: </Text>
                {data.notifications[0]}
              </Text>
  
              {/* Display Music Therapy Recommendation */}
              <Text style={styles.notificationItem}>
                <Text style={{ fontWeight: 'bold' }}>Music Therapy: </Text>
                {data.notifications[1]}
              </Text>
  
              {/* Display Exercise Therapy Recommendation */}
              <Text style={styles.notificationItem}>
                <Text style={{ fontWeight: 'bold' }}>Exercise Therapy: </Text>
                {data.notifications[2]}
              </Text>
  
              {/* Display Image */}
              {data.image && <Image source={{ uri: data.image }} style={styles.notificationImage} />}
  
              {/* Display Audio */}
              {data.audio && (
                <TouchableOpacity onPress={() => playAudio(data.audio!)} style={styles.audioButton}>
                  <Text style={styles.audioButtonText}>Play Audio</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <LinearGradient colors={['#E6E6FA', '#D8BFD8']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memory Journal</Text>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab('dashboard')}>
            <Text style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('journal')}>
            <Text style={[styles.tab, activeTab === 'journal' && styles.activeTab]}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('notifications')}>
            <Text style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}>Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'dashboard' && (
        <ScrollView style={styles.dashboard}>
          <Text style={styles.sectionTitle}>Recent Memories</Text>
          {entries.slice(0, 3).map((entry, index) => (
            <View key={index} style={styles.dashboardEntry}>
              <Text style={styles.dashboardEntryDate}>{formatDate(entry.date)}</Text>
              <Text style={styles.dashboardEntryText}>{entry.text}</Text>
              {entry.image && <Image source={{ uri: entry.image }} style={styles.dashboardEntryImage} />}
              {entry.audio && (
                <TouchableOpacity onPress={() => playAudio(entry.audio!)} style={styles.audioButton}>
                  <Text style={styles.audioButtonText}>Play Audio</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {activeTab === 'journal' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.journal}
        >
          <ScrollView>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Today's Memory</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.moodContainer}>
                  {moods.map(({ emoji, label }) => (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setMood(label)}
                      style={[styles.moodButton, mood === label && styles.activeMood]}
                    >
                      <Text style={styles.moodEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {capturedImage && (
                  <View style={styles.capturedImageContainer}>
                    <Text style={styles.capturedImageLabel}>Memory Image:</Text>
                    <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                  </View>
                )}

                {capturedAudio && (
                  <View style={styles.capturedAudioContainer}>
                    <Text style={styles.capturedAudioLabel}>Memory Audio:</Text>
                    <TouchableOpacity onPress={() => playAudio(capturedAudio)} style={styles.audioButton}>
                      <Text style={styles.audioButtonText}>Play Audio</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.textInputContainer}>
                  <TextInput
                    value={entry}
                    onChangeText={setEntry}
                    placeholder="Describe this memory..."
                    style={styles.textInput}
                    multiline
                    placeholderTextColor="#888"
                  />
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={takePhoto} style={styles.actionButton}>
                      <CameraIcon size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
                      <ImageIcon size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={toggleRecording}
                      style={[styles.actionButton, isRecording && styles.recordingButton]}
                    >
                      {isRecording ? (
                        <View style={styles.recordingIndicator}>
                          <Circle size={24} color="#fff" fill="#ff0000" />
                        </View>
                      ) : (
                        <Mic size={24} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addEntry} style={styles.actionButton}>
                      <Send size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {activeTab === 'notifications' && <NotificationTab />}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4B0082',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  tab: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#4B0082',
  },
  activeTab: {
    color: '#9370DB',
    fontWeight: 'bold',
  },
  dashboard: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4B0082',
  },
  dashboardEntry: {
    backgroundColor: '#E6E6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dashboardEntryDate: {
    fontSize: 14,
    color: '#4B0082',
    marginBottom: 8,
  },
  dashboardEntryText: {
    fontSize: 16,
    color: '#4B0082',
  },
  dashboardEntryImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  journal: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#E6E6FA',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  cardContent: {
    padding: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  moodButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#bca8e6',
  },
  activeMood: {
    backgroundColor: '#c490d1',
  },
  moodEmoji: {
    fontSize: 24,
  },
  capturedImageContainer: {
    marginTop: 16,
  },
  capturedImageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c393e6',
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  capturedAudioContainer: {
    marginTop: 16,
  },
  capturedAudioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c393e6',
  },
  audioButton: {
    backgroundColor: '#9370DB',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  textInputContainer: {
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#9370DB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingButton: {
    backgroundColor: '#ff0000',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTab: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4B0082',
    marginTop: 10,
  },
  notificationCard: {
    backgroundColor: '#E6E6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative', // Required for positioning the cross button
  },
  crossButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff0000',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  notificationDate: {
    fontSize: 14,
    color: '#4B0082',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 16,
    color: '#4B0082',
    marginBottom: 8,
  },
  notificationItem: {
    fontSize: 14,
    color: '#4B0082',
    marginBottom: 4,
  },
  notificationImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default MemoryJournalApp;