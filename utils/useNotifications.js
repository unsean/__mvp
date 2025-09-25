import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';
import { logError } from './errorHandler';

/**
 * Hook to handle push notifications throughout the app
 * Manages permissions, token registration and notification handling
 */
export default function useNotifications(userId) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  async function registerForPushNotificationsAsync() {
    let token;
    
    if (Constants.isDevice) {
      // Check if we already have permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // If we don't have permission, ask for it
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      setPermissionStatus(finalStatus);
      
      // Can't get a token if permission not granted
      if (finalStatus !== 'granted') {
        return;
      }
      
      // Get Expo push token
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      // Save token to state
      if (token) {
        setExpoPushToken(token);
        
        // Save token to database if user is logged in
        if (userId) {
          saveTokenToDatabase(token, userId);
        }
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  
    // Android specific notification channel setup
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6F61',
      });
    }
  
    return token;
  }

  // Save token to database
  async function saveTokenToDatabase(token, userId) {
    try {
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert([
          {
            user_id: userId,
            token: token,
            device_type: Platform.OS,
            created_at: new Date().toISOString(),
          }
        ], { onConflict: 'user_id, token' });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      logError('useNotifications.saveTokenToDatabase', error);
    }
  }

  // Set up notification handlers
  useEffect(() => {
    // Handler for received notifications
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Handler for user interaction with notification
    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification } = response;
      // Handle notification action (e.g., deep linking)
      handleNotificationResponse(notification);
    });

    // Register for notifications when component mounts
    registerForPushNotificationsAsync();

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationReceivedListener);
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, [userId]); // Re-register when userId changes

  // Handle notification interactions (e.g., opening a specific screen)
  const handleNotificationResponse = (notification) => {
    try {
      const data = notification.request.content.data;
      
      // Check notification type and handle accordingly
      if (data.type === 'message') {
        // Handle message notification
        // navigate to chat screen
      } else if (data.type === 'reservation') {
        // Handle reservation notification
        // navigate to reservation details
      }
    } catch (error) {
      logError('useNotifications.handleNotificationResponse', error);
    }
  };

  // Schedule a local notification
  const scheduleLocalNotification = async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      logError('useNotifications.scheduleLocalNotification', error);
    }
  };

  return {
    expoPushToken,
    notification,
    permissionStatus,
    scheduleLocalNotification,
  };
}
