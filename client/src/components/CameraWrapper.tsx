import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Use dynamic import with error handling
let Camera: any = null;
try {
  // Only import on native platforms
  if (Platform.OS !== 'web') {
    const ExpoCamera = require('expo-camera');
    Camera = ExpoCamera.Camera;
  }
} catch (error) {
  console.warn('Failed to load Camera component:', error);
}

export const CameraWrapper = (props: any) => {
  if (!Camera) {
    return (
      <View style={styles.fallback}>
        <Text style={{ fontSize: 14 }}>Camera not available on this platform</Text>
      </View>
    );
  }
  
  // Ensure we're not passing any string values for numeric style properties
  const safeProps = { ...props };
  if (safeProps.style) {
    // If style is an array, process each style object
    if (Array.isArray(safeProps.style)) {
      safeProps.style = safeProps.style.map((style: any) => {
        return typeof style === 'object' ? { ...style } : style;
      });
    } 
    // If style is an object, ensure all values are safe
    else if (typeof safeProps.style === 'object') {
      safeProps.style = { ...safeProps.style };
    }
  }
  
  return <Camera {...safeProps} />;
};

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
  },
});

// Also export the requestPermissions function
export const requestCameraPermissions = async () => {
  if (!Camera) return { status: 'denied' };
  try {
    const { Camera } = require('expo-camera');
    return await Camera.requestCameraPermissionsAsync();
  } catch (error) {
    console.warn('Failed to request camera permissions:', error);
    return { status: 'denied' };
  }
};
