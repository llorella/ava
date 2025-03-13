import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

// Common allergens and conditions
const COMMON_ALLERGENS = [
  'Fragrance', 'Parabens', 'Sulfates', 'Phthalates', 'Formaldehyde',
  'Gluten', 'Dairy', 'Nuts', 'Soy', 'Eggs'
];

const COMMON_SKIN_CONDITIONS = [
  'Sensitive Skin', 'Eczema', 'Acne', 'Rosacea', 'Psoriasis'
];

const COMMON_DIETARY_PREFERENCES = [
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto'
];

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { preferences, updatePreferences, loading } = useUser();
  
  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState(preferences);
  
  // Toggle editing mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Save changes
      updatePreferences(editedPreferences)
        .then(() => {
          setIsEditing(false);
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to update preferences');
        });
    } else {
      // Enter edit mode
      setEditedPreferences(preferences);
      setIsEditing(true);
    }
  };
  
  // Toggle an item in a preference array
  const togglePreference = (
    category: 'allergies' | 'dietaryPreferences' | 'skinConditions',
    item: string
  ) => {
    setEditedPreferences(prev => {
      const current = [...prev[category]];
      const index = current.indexOf(item);
      
      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(item);
      }
      
      return {
        ...prev,
        [category]: current
      };
    });
  };
  
  // Check if an item is selected
  const isSelected = (
    category: 'allergies' | 'dietaryPreferences' | 'skinConditions',
    item: string
  ) => {
    return (isEditing ? editedPreferences : preferences)[category].includes(item);
  };
  
  // Render a preference chip
  const renderPreferenceChip = (
    category: 'allergies' | 'dietaryPreferences' | 'skinConditions',
    item: string
  ) => {
    const selected = isSelected(category, item);
    
    return (
      <TouchableOpacity
        key={item}
        style={[
          styles.chip,
          selected && styles.chipSelected
        ]}
        onPress={() => isEditing && togglePreference(category, item)}
        disabled={!isEditing}
      >
        <Text style={[
          styles.chipText,
          selected && styles.chipTextSelected
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={toggleEditMode}
          disabled={loading}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.email}>{user?.email || 'User'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.chipContainer}>
            {COMMON_ALLERGENS.map(allergen => 
              renderPreferenceChip('allergies', allergen)
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Conditions</Text>
          <View style={styles.chipContainer}>
            {COMMON_SKIN_CONDITIONS.map(condition => 
              renderPreferenceChip('skinConditions', condition)
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.chipContainer}>
            {COMMON_DIETARY_PREFERENCES.map(diet => 
              renderPreferenceChip('dietaryPreferences', diet)
            )}
          </View>
        </View>
        
        <Button
          title="Logout"
          variant="outline"
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' }
              ]
            );
          }}
          style={styles.logoutButton}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
  },
  editButtonText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  email: {
    fontSize: 16,
    color: '#333333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#F1F1F1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
  },
  chipText: {
    color: '#666666',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  logoutButton: {
    marginTop: 24,
  },
});

export default ProfileScreen;
