import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { IngredientCard } from '../components/IngredientCard';
import { Button } from '../components/Button';
import { useScan } from '../context/ScanContext';
import { RootStackParamList } from '../types';

type ScanResultScreenRouteProp = RouteProp<RootStackParamList, 'ScanResult'>;
type ScanResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ScanResultScreen: React.FC = () => {
  const navigation = useNavigation<ScanResultScreenNavigationProp>();
  const route = useRoute<ScanResultScreenRouteProp>();
  const { scanId } = route.params;
  const { recentScans, currentScan } = useScan();
  
  // Get the scan result from either currentScan or recentScans
  const scan = currentScan || recentScans[parseInt(scanId)] || { ingredients: [] };
  
  // Count risky ingredients
  const riskyCount = scan.ingredients.filter(ingredient => ingredient.isRisky).length;
  
  // Calculate health score (average of all ingredients)
  const calculateHealthScore = () => {
    if (!scan.ingredients || scan.ingredients.length === 0) return 0;
    
    const total = scan.ingredients.reduce((sum, ingredient) => sum + ingredient.healthRating, 0);
    return Math.round(total / scan.ingredients.length);
  };
  
  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return '#6FCF97'; // Good - green
    if (score >= 5) return '#F2C94C'; // Moderate - yellow
    return '#EB5757'; // Poor - red
  };
  
  const healthScore = calculateHealthScore();
  
  const handleChatPress = () => {
    navigation.navigate('Main', { screen: 'Chat' });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {scan.product?.name || 'Unnamed Product'}
          </Text>
          <Text style={styles.category}>
            {scan.product?.category || 'Uncategorized'}
          </Text>
        </View>
        
        <View style={[
          styles.scoreBadge,
          { backgroundColor: getHealthScoreColor(healthScore) }
        ]}>
          <Text style={styles.scoreText}>{healthScore}/10</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{scan.ingredients.length}</Text>
          <Text style={styles.statLabel}>Ingredients</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            riskyCount > 0 && styles.riskyValue
          ]}>
            {riskyCount}
          </Text>
          <Text style={[
            styles.statLabel,
            riskyCount > 0 && styles.riskyLabel
          ]}>
            Risky
          </Text>
        </View>
      </View>
      
      <View style={styles.ingredientsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={handleChatPress}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#4A90E2" />
            <Text style={styles.chatButtonText}>Ask Ava</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={scan.ingredients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IngredientCard ingredient={item} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666666',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  statItem: {
    marginRight: 24,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  riskyValue: {
    color: '#EB5757',
  },
  riskyLabel: {
    color: '#EB5757',
  },
  ingredientsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chatButtonText: {
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default ScanResultScreen;
