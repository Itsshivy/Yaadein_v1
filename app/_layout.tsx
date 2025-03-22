import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { NotificationProvider } from './context/NotificationContext'; // Import the NotificationProvider
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from './LoadingScreen'; // Relative import for LoadingScreen



// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show an alert when a notification is received
    shouldPlaySound: true, // Play a sound when a notification is received
    shouldSetBadge: true, // Set the app badge when a notification is received
  }),
});

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true); // State for loading screen
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Request notification permissions when the app starts
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable notifications to use this feature.');
      }
    };

    requestNotificationPermissions();
  }, []);

  // Simulate loading process
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false); // Stop loading after 3 seconds
    }, 3000); // Adjust the delay as needed
  }, []);

  // Handle notification clicks
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { date } = response.notification.request.content.data; // Get the date from the notification data
      // navigation.navigate('/MemoryJournal'); // Redirect to the Memory Journal page

      // Speak the notification data using text-to-speech
      Speech.speak('Remember playing with Rahul, your grandson, in the park yesterday? Click here to remember all the details about the pleasant day!', {
        language: 'en', // Set the language
        rate: 1.0, // Adjust the speech rate
      });
    });

    return () => subscription.remove(); // Clean up the listener
  }, []);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Return null if fonts are not loaded
  }

  // Show LoadingScreen while loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      {/* Wrap the entire app with NotificationProvider */}
      <NotificationProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NotificationProvider>
    </ThemeProvider>
  );
}