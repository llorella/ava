import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ingredient } from '../types';

interface IngredientCardProps {
  ingredient: Ingredient;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({ ingredient }) => {
  const getHealthRatingColor = (rating: number) => {
    if (rating >= 8) return '#6FCF97'; // Good - green
    if (rating >= 5) return '#F2C94C'; // Moderate - yellow
    return '#EB5757'; // Poor - red
  };

  return (
    <View style={[
      styles.container,
      ingredient.isRisky && styles.riskyContainer
    ]}>
      <View style={styles.header}>
        <Text style={styles.name}>{ingredient.name}</Text>
        <View style={[
          styles.ratingBadge,
          { backgroundColor: getHealthRatingColor(ingredient.healthRating) }
        ]}>
          <Text style={styles.ratingText}>{ingredient.healthRating}/10</Text>
        </View>
      </View>
      
      <Text style={styles.category}>{ingredient.category}</Text>
      
      <Text style={styles.description}>{ingredient.description}</Text>
      
      {ingredient.riskFactors.length > 0 && (
        <View style={styles.riskFactorsContainer}>
          <Text style={styles.riskFactorsTitle}>Risk Factors:</Text>
          {ingredient.riskFactors.map((factor, index) => (
            <Text key={index} style={styles.riskFactor}>• {factor}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E1E1E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  riskyContainer: {
    borderLeftColor: '#EB5757',
    backgroundColor: '#FFF8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  category: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 22,
  },
  riskFactorsContainer: {
    marginTop: 8,
  },
  riskFactorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  riskFactor: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    marginBottom: 2,
  },
});
