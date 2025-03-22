import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Calendar, DateData } from 'react-native-calendars';

const HomeScreen = () => {
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Dummy data for demonstration
  const locationStatus = 'Active';
  const currentLocation = '123 Safe Street, Peaceful Town';
  const emergencyContact = {
    name: 'Mary Smith',
    relation: 'Daughter',
    phone: '+1 (555) 123-4567',
  };
  const therapies = [
    { id: '1', time: '10:00 AM', name: 'Morning Walk' },
    { id: '2', time: '02:00 PM', name: 'Memory Exercise' },
    { id: '3', time: '06:00 PM', name: 'Meditation' },
  ];

  const memories = [
    { id: '1', date: '2023-10-01', description: 'Family picnic at the park' },
    { id: '2', date: '2023-10-05', description: 'Celebrated Diwali with family' },
    { id: '3', date: '2023-10-10', description: 'Visited the old neighborhood' },
  ];

  const filteredMemories = memories.filter((memory) => memory.date === selectedDate);

  // Handle day press in calendar
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <View style={styles.profileCircle}>
            <FontAwesome name="user" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for memories..."
          placeholderTextColor="#999"
        />
        <Ionicons name="search" size={20} color="#999" />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Location Status Section */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={28} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Your Location</Text>
          </View>
          <Text style={styles.locationStatusText}>
            Location Sharing is{' '}
            <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{locationStatus}</Text>
          </Text>
          <Text style={styles.currentLocationText}>{currentLocation}</Text>
          <View style={styles.locationMapPlaceholder}>
            <Image source={require('../../assets/map.png')} style={styles.mapImage} />
          </View>
        </Animatable.View>

        {/* Therapies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Therapies</Text>
          <FlatList
            horizontal
            data={therapies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.therapyCard}>
                <Text style={styles.therapyTime}>{item.time}</Text>
                <Text style={styles.therapyName}>{item.name}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore Therapies</Text>
          </TouchableOpacity>
        </View>

        {/* Family Tree Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="users" size={28} color="#2196F3" />
            <Text style={styles.sectionTitle}>Family Tree</Text>
          </View>
          <Text style={styles.familyTreeText}>
            Stay connected with your loved ones. Tap below to see your family tree.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Family Tree</Text>
          </TouchableOpacity>
        </View>

        {/* Face Recognition Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={28} color="#FF9800" />
            <Text style={styles.sectionTitle}>Recognize Someone's Face</Text>
          </View>
          <Text style={styles.faceRecognitionText}>
            Use your camera to recognize a loved one's face.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Start Recognition</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Memories Calendar</Text>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#2196F3' },
            }}
            theme={{
              calendarBackground: '#FFFFFF',
              selectedDayBackgroundColor: '#2196F3',
              todayTextColor: '#2196F3',
              dayTextColor: '#333',
              textDisabledColor: '#999',
            }}
          />
          {selectedDate && (
            <View style={styles.memoriesList}>
              {filteredMemories.length > 0 ? (
                filteredMemories.map((memory) => (
                  <View key={memory.id} style={styles.memoryItem}>
                    <Text style={styles.memoryDate}>{memory.date}</Text>
                    <Text style={styles.memoryDescription}>{memory.description}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noMemoriesText}>No memories for this date.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSettingsVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={styles.settingsOption}>
              <Ionicons name="notifications" size={24} color="#333" />
              <Text style={styles.settingsText}>Set Notification Frequency</Text>
            </View>
            <View style={styles.settingsOption}>
              <Ionicons name="person-add" size={24} color="#333" />
              <Text style={styles.settingsText}>Add Emergency Contacts</Text>
            </View>
            <View style={styles.settingsOption}>
              <Ionicons name="people" size={24} color="#333" />
              <Text style={styles.settingsText}>View Emergency Contacts</Text>
            </View>
            <View style={styles.settingsOption}>
              <Ionicons name="cog" size={24} color="#333" />
              <Text style={styles.settingsText}>Other Settings</Text>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40, // Add padding to avoid going out of range
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40, // Add padding at the bottom
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  locationStatusText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  locationMapPlaceholder: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  therapyCard: {
    width: 150,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  therapyTime: {
    fontSize: 14,
    color: '#333',
  },
  therapyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  exploreButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  exploreButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  familyTreeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  faceRecognitionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  memoriesList: {
    marginTop: 16,
  },
  memoryItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memoryDate: {
    fontSize: 14,
    color: '#666',
  },
  memoryDescription: {
    fontSize: 16,
    color: '#333',
  },
  noMemoriesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default HomeScreen;