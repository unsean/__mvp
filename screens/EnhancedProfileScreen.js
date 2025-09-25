import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { supabase } from '../services/supabase';

// Import new components
import ProfileHeader from '../components/molecules/ProfileHeader';
import UserStats from '../components/molecules/UserStats';
import QuickActions from '../components/molecules/QuickActions';
import SignOutButton from '../components/atoms/SignOutButton';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import CustomAlert from '../components/atoms/CustomAlert';

export default function EnhancedProfileScreen({ navigation }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlert({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlert({ visible: false, title: '', message: '', type: 'info' });
  };

  // Fetch or create profile
  useEffect(() => {
    async function fetchOrCreateProfile() {
      if (!isLoaded || !user) return;
      
      setLoading(true);
      
      try {
        // Try to get existing profile
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', user.id)
          .single();
        
        // If no profile exists, create one
        if (!data || error) {
          const newProfile = {
            id: user.id,
            clerk_user_id: user.id,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'User',
            email: user.primaryEmailAddress?.emailAddress || '',
            avatar_url: user.imageUrl || '',
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .upsert([newProfile])
            .select()
            .single();
          
          if (!insertError) {
            setProfile(insertedData);
          }
        } else {
          setProfile(data);
        }

        // Fetch or create stats
        let { data: statData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!statData) {
          const mockStats = { 
            user_id: user.id, 
            bookings: Math.floor(Math.random() * 10) + 1, 
            reviews: Math.floor(Math.random() * 8) + 1, 
            favorites: Math.floor(Math.random() * 15) + 1, 
            loyalty: Math.floor(Math.random() * 1000) + 100 
          };
          
          await supabase.from('user_stats').upsert([mockStats]);
          setStats(mockStats);
        } else {
          setStats(statData);
        }

      } catch (err) {
        console.error('Profile error:', err);
        showAlert('Error', 'Could not load profile data', 'error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrCreateProfile();
  }, [user, isLoaded]);

  const handleEditProfile = () => {
    showAlert('Edit Profile', 'Profile editing feature coming soon!', 'info');
  };

  const handleAIChat = () => {
    if (navigation) {
      navigation.navigate('AIChat');
    } else {
      showAlert('AI Chat', 'AI Chat feature ready! Navigate to AI Chat screen.', 'success');
    }
  };

  const handleBooking = () => {
    showAlert('Book Table', 'Table booking feature coming soon!', 'info');
  };

  const handleFavorites = () => {
    if (navigation) {
      navigation.navigate('Favorites');
    } else {
      showAlert('Favorites', 'Navigate to your favorites!', 'info');
    }
  };

  const handleSearch = () => {
    if (navigation) {
      navigation.navigate('Search');
    } else {
      showAlert('Search', 'Navigate to search restaurants!', 'info');
    }
  };

  const handleSignOut = () => {
    showAlert('Signed Out', 'You have been signed out successfully!', 'success');
  };

  if (!isLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={40} color="#FF6F61" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#FF6F61', '#FF8A75']} style={styles.signInPrompt}>
          <Ionicons name="person-circle" size={80} color="#fff" />
          <Text style={styles.signInTitle}>Welcome to MakanBro!</Text>
          <Text style={styles.signInSubtitle}>Sign in to access your profile and personalized features</Text>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => navigation?.navigate('SignIn')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader user={profile} onEdit={handleEditProfile} />
        
        <UserStats stats={stats} />
        
        <QuickActions 
          onAIChat={handleAIChat}
          onBooking={handleBooking}
          onFavorites={handleFavorites}
          onSearch={handleSearch}
        />

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <TouchableOpacity style={styles.featureItem} onPress={handleAIChat}>
            <View style={styles.featureIcon}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Food Recommendations</Text>
              <Text style={styles.featureDescription}>Get personalized restaurant suggestions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="location" size={24} color="#34C759" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Nearby Restaurants</Text>
              <Text style={styles.featureDescription}>Discover great food around you</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="star" size={24} color="#FFB300" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Reviews & Ratings</Text>
              <Text style={styles.featureDescription}>Share your dining experiences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="gift" size={24} color="#FF3B30" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Loyalty Rewards</Text>
              <Text style={styles.featureDescription}>Earn points and get rewards</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications" size={20} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="moon" size={20} color="#666" />
            <Text style={styles.settingText}>Dark Mode</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="language" size={20} color="#666" />
            <Text style={styles.settingText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle" size={20} color="#666" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.signOutSection}>
          <SignOutButton onSignOut={handleSignOut} />
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  signInPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 20,
    padding: 32,
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  signInButtonText: {
    color: '#FF6F61',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  signOutSection: {
    margin: 16,
    marginBottom: 32,
  },
};
