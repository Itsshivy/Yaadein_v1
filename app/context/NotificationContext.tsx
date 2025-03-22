import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; // Add this import

type NotificationData = {
  date: string;
  journalText: string;
  notifications: string[]; // Array of notifications (memory, music, exercise)
  therapy: {
    music: string;
    exercise: string;
  };
  image?: string;
  audio?: string;
};

type NotificationContextType = {
  notifications: Record<string, NotificationData>;
  addNotification: (date: string, notificationData: NotificationData) => void;
  removeNotification: (date: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: {},
  addNotification: () => {},
  removeNotification: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Record<string, NotificationData>>({});

  // Load notifications from AsyncStorage on app start
  useEffect(() => {
    const loadNotifications = async () => {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        scheduleRandomNotifications(parsedNotifications); // Schedule notifications on app start
      }
    };
    loadNotifications();
  }, []);

  // Save notifications to AsyncStorage whenever they change
  useEffect(() => {
    const saveNotifications = async () => {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    };
    saveNotifications();
  }, [notifications]);

  // Function to schedule notifications at random intervals
  const scheduleRandomNotifications = (notifications: Record<string, NotificationData>) => {
    const notificationEntries = Object.values(notifications);

    notificationEntries.forEach((notification) => {
      const randomDelay = Math.floor(Math.random() * 120000); // Random delay up to 2 minutes (120,000 ms)
      const notificationText = notification.notifications[0]; // Use the memory notification

      // Schedule the notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Memory Reminder',
          body: notificationText,
          data: { date: notification.date }, // Pass the date to identify the notification
        },
        trigger: {
          seconds: randomDelay / 1000, // Convert milliseconds to seconds
          repeats: false, // Optional: Set to true if you want the notification to repeat
          type: 'timeInterval', // Specify the trigger type
        } as Notifications.TimeIntervalTriggerInput, // Explicitly type the trigger object
      });
    });
  };

  const addNotification = (date: string, notificationData: NotificationData) => {
    setNotifications((prev) => ({
      ...prev,
      [date]: notificationData,
    }));

    // Schedule the new notification
    scheduleRandomNotifications({ [date]: notificationData });
  };

  const removeNotification = (date: string) => {
    setNotifications((prev) => {
      const updatedNotifications = { ...prev };
      delete updatedNotifications[date];
      return updatedNotifications;
    });
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;