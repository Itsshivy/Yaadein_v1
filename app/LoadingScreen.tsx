import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const LoadingScreen = () => {
  // Create animated values
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in effect
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // For scaling effect

  // Start the animation when the component mounts
  useEffect(() => {
    Animated.parallel([
      // Fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500, // 1.5 seconds
        useNativeDriver: true,
      }),
      // Scale animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500, // 1.5 seconds
        easing: Easing.elastic(1.2), // Add a bounce effect
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Animated Brand Name */}
      <Animated.Text
        style={[
          styles.brandName,
          {
            opacity: fadeAnim, // Apply fade-in effect
            transform: [{ scale: scaleAnim }], // Apply scaling effect
          },
        ]}
      >
        Yaadein
      </Animated.Text>

      {/* Optional Tagline */}
      <Text style={styles.tagline}>Memories that last forever</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9370DB', // Purple background
  },
  brandName: {
    fontSize: 48, // Large font size
    fontWeight: 'bold', // Bold text
    color: '#FFFFFF', // White text color
    textAlign: 'center', // Center the text
    fontFamily: 'Helvetica', // Use a custom font if available
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Text shadow for emphasis
    textShadowOffset: { width: 2, height: 2 }, // Shadow offset
    textShadowRadius: 5, // Shadow radius
  },
  tagline: {
    fontSize: 18, // Smaller font size
    color: '#FFFFFF', // White text color
    textAlign: 'center', // Center the text
    fontStyle: 'italic', // Italic text
    marginTop: 10, // Space between brand name and tagline
  },
});

export default LoadingScreen;