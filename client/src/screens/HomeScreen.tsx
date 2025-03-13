import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScanCard } from '../components/ScanCard';
import { Button } from '../components/Button';
import { useScan } from '../context/ScanContext';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { recentScans, loading } = useScan();
  
  const handleScanPress = () => {
    navigation.navigate('Main', { screen: 'Scan' });
  };
  
  const handleScanCardPress = (scanId: string) => {
    navigation.navigate('ScanResult', { scanId });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Scans</Text>
      </View>
      
      {recentScans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You haven't scanned any products yet.
          </Text>
          <Button 
            title="Scan a Product" 
            onPress={handleScanPress}
            style={styles.scanButton}
          />
        </View>
      ) : (
        <FlatList
          data={recentScans}
          keyExtractor={(item, index) => `scan-${index}`}
          renderItem={({ item, index }) => (
            <ScanCard 
              scan={item} 
              onPress={() => handleScanCardPress(index.toString())}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanButton: {
    width: 200,
  },
  listContent: {
    padding: 16,
  },
});

export default HomeScreen;
