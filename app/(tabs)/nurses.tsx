import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const nursesData = [
  {
    id: 1,
    name: 'Nurse Ananya',
    location: 'Apollo Hospital, Okhla',
    skills: ['General Care', 'Post-Surgery Care', 'Elderly Care'],
    rating: 4.7,
    available: true,
  },
  {
    id: 2,
    name: 'Nurse Priya',
    location: 'Fortis Hospital, Okhla',
    skills: ['Pediatric Care', 'Emergency Care', 'Wound Dressing'],
    rating: 4.5,
    available: false,
  },
  {
    id: 3,
    name: 'Nurse Riya',
    location: 'Max Hospital, Okhla',
    skills: ['ICU Care', 'Diabetes Management', 'Physiotherapy'],
    rating: 4.8,
    available: true,
  },
  {
    id: 4,
    name: 'Nurse Sneha',
    location: 'AIIMS, Okhla',
    skills: ['Critical Care', 'Trauma Care', 'Ventilator Management'],
    rating: 4.9,
    available: true,
  },
];

const Nurses = () => {
  return (
    <LinearGradient colors={['#E6E6FA', '#FFFFFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Nurses Near You</Text>
        {nursesData.map((nurse) => (
          <View key={nurse.id} style={styles.card}>
            <View style={styles.details}>
              <Text style={styles.name}>{nurse.name}</Text>
              <Text style={styles.location}>{nurse.location}</Text>
              <View style={styles.skillsContainer}>
                {nurse.skills.map((skill, index) => (
                  <Text key={index} style={styles.skill}>
                    {skill}
                  </Text>
                ))}
              </View>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {nurse.rating}</Text>
                <Text
                  style={[
                    styles.availability,
                    { color: nurse.available ? '#4CAF50' : '#F44336' },
                  ]}>
                  {nurse.available ? 'Available' : 'Not Available'}
                </Text>
              </View>
              <TouchableOpacity style={styles.purpleButton}>
                <Text style={styles.buttonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 30,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  skill: {
    backgroundColor: '#E6E6FA',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 14,
    color: '#4B0082',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    color: '#FFD700',
  },
  availability: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  purpleButton: {
    backgroundColor: '#4B0082',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Nurses;