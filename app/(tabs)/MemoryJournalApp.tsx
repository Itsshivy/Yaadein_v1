import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera as CameraIcon, Send, Image as ImageIcon, Mic, Circle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const MemoryJournalApp = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedAudio, setCapturedAudio] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ date: string; text: string; image?: string; audio?: string }>>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false); // State to track recording status

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

  // Request permission for audio recording
  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

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
      setIsRecording(true); // Set recording state to true
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
      setIsRecording(false); // Set recording state to false
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

  const addEntry = () => {
    if (!entry.trim() && !capturedImage && !capturedAudio) return;

    const newJournalEntry = {
      date: new Date().toISOString(),
      text: entry,
      image: capturedImage || undefined,
      audio: capturedAudio || undefined,
    };

    setEntries([newJournalEntry, ...entries]);
    setEntry('');
    setCapturedImage(null);
    setCapturedAudio(null);
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

          <Text style={styles.sectionTitle}>Memory Flashbacks</Text>
          {entries.length > 0 && (
            <View style={styles.flashback}>
              <Text style={styles.flashbackText}>
                Remember this memory from {formatDate(entries[0].date)}?
              </Text>
              <Text style={styles.flashbackText}>{entries[0].text}</Text>
              {entries[0].image && (
                <Image source={{ uri: entries[0].image }} style={styles.flashbackImage} />
              )}
              {entries[0].audio && (
                <TouchableOpacity onPress={() => playAudio(entries[0].audio!)} style={styles.audioButton}>
                  <Text style={styles.audioButtonText}>Play Audio</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
                      style={[
                        styles.actionButton,
                        isRecording && styles.recordingButton, // Apply recordingButton style when isRecording is true
                      ]}
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
  flashback: {
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
  flashbackText: {
    fontSize: 16,
    color: '#4B0082',
  },
  flashbackImage: {
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
    backgroundColor: '#ff0000', // Red color when recording
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MemoryJournalApp;