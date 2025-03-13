import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { RootStackParamList } from '../types';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentPage, setCurrentPage] = useState(0);
  
  const pages = [
    {
      title: 'Welcome to Ava',
      description: "Your personal health assistant that helps you understand what's in your products.",
      image: '🧪', // Placeholder for an actual image
    },
    {
      title: 'Scan Product Labels',
      description: 'Take a photo of any product label to instantly analyze its ingredients.',
      image: '📷', // Placeholder for an actual image
    },
    {
      title: 'Get Health Insights',
      description: 'Understand potential risks and benefits based on your personal health profile.',
      image: '🔍', // Placeholder for an actual image
    },
    {
      title: 'Chat with Ava',
      description: 'Ask questions about ingredients and get personalized health advice.',
      image: '💬', // Placeholder for an actual image
    }
  ];
  
  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.navigate('Login');
    }
  };
  
  const handleSkip = () => {
    navigation.navigate('Login');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.emoji}>{pages[currentPage].image}</Text>
        <Text style={styles.title}>{pages[currentPage].title}</Text>
        <Text style={styles.description}>{pages[currentPage].description}</Text>
      </View>
      
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentPage && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={currentPage < pages.length - 1 ? 'Next' : 'Get Started'}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipContainer: {
    alignItems: 'flex-end',
    padding: 16,
  },
  skipText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E1E1E1',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4A90E2',
    width: 20,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  button: {
    height: 56,
  },
});

export default OnboardingScreen;
