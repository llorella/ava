import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import { Button } from '../components/Button';
import { useScan } from '../context/ScanContext';
import { RootStackParamList } from '../types';

type ScanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanScreenNavigationProp>();
  const { scanLabel, analyzeIngredients, loading } = useScan();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [manualText, setManualText] = useState('');
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('camera');
  
  // Request camera permission
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status === 'granted') {
      setCameraVisible(true);
    } else {
      Alert.alert(
        'Camera Permission',
        'We need camera permission to scan product labels.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Take a picture
  const takePicture = async () => {
    // In a real app, this would use the camera to take a picture
    // For this prototype, we'll simulate taking a picture
    setImage('mock-image-data');
    setCameraVisible(false);
  };
  
  // Toggle between camera and manual input
  const toggleInputMode = () => {
    setInputMode(inputMode === 'camera' ? 'manual' : 'camera');
  };
  
  // Process the scan
  const processScan = async () => {
    try {
      if (inputMode === 'camera' && image) {
        const result = await scanLabel(
          image,
          productName || undefined,
          productCategory || undefined
        );
        
        // Navigate to scan result
        navigation.navigate('ScanResult', { scanId: '0' });
      } else if (inputMode === 'manual' && manualText) {
        const result = await analyzeIngredients(manualText);
        
        // Navigate to scan result
        navigation.navigate('ScanResult', { scanId: '0' });
      } else {
        Alert.alert(
          'Missing Information',
          inputMode === 'camera' 
            ? 'Please take a picture first' 
            : 'Please enter ingredient text',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to process scan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan Product Label</Text>
          <Button
            title={inputMode === 'camera' ? 'Manual Input' : 'Camera'}
            variant="outline"
            onPress={toggleInputMode}
            style={styles.toggleButton}
          />
        </View>
        
        {inputMode === 'camera' ? (
          // Camera mode
          <View style={styles.cameraContainer}>
            {cameraVisible ? (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.cameraText}>Camera Preview</Text>
                <Button
                  title="Take Picture"
                  onPress={takePicture}
                  style={styles.cameraButton}
                />
              </View>
            ) : image ? (
              <View style={styles.imagePreview}>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Image Preview</Text>
                </View>
                <Button
                  title="Retake"
                  variant="outline"
                  onPress={() => {
                    setImage(null);
                    setCameraVisible(true);
                  }}
                  style={styles.retakeButton}
                />
              </View>
            ) : (
              <Button
                title="Open Camera"
                onPress={requestCameraPermission}
                style={styles.openCameraButton}
              />
            )}
            
            {image && (
              <View style={styles.productInfoContainer}>
                <Text style={styles.sectionTitle}>Product Information (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={productName}
                  onChangeText={setProductName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Category (e.g., Skincare, Food)"
                  value={productCategory}
                  onChangeText={setProductCategory}
                />
              </View>
            )}
          </View>
        ) : (
          // Manual input mode
          <View style={styles.manualInputContainer}>
            <Text style={styles.sectionTitle}>Enter Ingredients</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Paste ingredient list here..."
              multiline
              numberOfLines={8}
              value={manualText}
              onChangeText={setManualText}
            />
          </View>
        )}
        
        <Button
          title="Analyze Ingredients"
          onPress={processScan}
          loading={loading}
          disabled={loading || (inputMode === 'camera' ? !image : !manualText)}
          style={styles.analyzeButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  toggleButton: {
    minWidth: 120,
  },
  cameraContainer: {
    marginBottom: 24,
  },
  cameraPlaceholder: {
    height: 300,
    backgroundColor: '#E1E1E1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  cameraButton: {
    minWidth: 150,
  },
  imagePreview: {
    marginBottom: 16,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#E1E1E1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#666666',
  },
  retakeButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  openCameraButton: {
    marginBottom: 16,
  },
  productInfoContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  manualInputContainer: {
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 200,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    marginTop: 8,
  },
});

export default ScanScreen;
