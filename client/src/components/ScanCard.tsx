import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScanResult } from '../types';

interface ScanCardProps {
  scan: ScanResult;
  onPress: () => void;
}

export const ScanCard: React.FC<ScanCardProps> = ({ scan, onPress }) => {
  // Calculate health score (average of all ingredients)
  const calculateHealthScore = () => {
    if (!scan.ingredients || scan.ingredients.length === 0) return 0;
    
    const total = scan.ingredients.reduce((sum, ingredient) => sum + ingredient.healthRating, 0);
    return Math.round(total / scan.ingredients.length);
  };
  
  // Count risky ingredients
  const riskyCount = scan.ingredients.filter(ingredient => ingredient.isRisky).length;
  
  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return '#6FCF97'; // Good - green
    if (score >= 5) return '#F2C94C'; // Moderate - yellow
    return '#EB5757'; // Poor - red
  };
  
  const healthScore = calculateHealthScore();
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.productName}>
          {scan.product?.name || 'Unnamed Product'}
        </Text>
        <View style={[
          styles.scoreBadge,
          { backgroundColor: getHealthScoreColor(healthScore) }
        ]}>
          <Text style={styles.scoreText}>{healthScore}/10</Text>
        </View>
      </View>
      
      <Text style={styles.category}>
        {scan.product?.category || 'Uncategorized'}
      </Text>
      
      <View style={styles.stats}>
        <Text style={styles.statText}>
          {scan.ingredients.length} ingredients
        </Text>
        {riskyCount > 0 && (
          <Text style={styles.riskyText}>
            {riskyCount} risky ingredient{riskyCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
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
  category: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 14,
    color: '#666666',
  },
  riskyText: {
    fontSize: 14,
    color: '#EB5757',
    fontWeight: '500',
  },
});
