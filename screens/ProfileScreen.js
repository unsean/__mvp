import React, { useEffect, useState, useContext, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, ScrollView, Modal, TextInput, Animated, Alert, Switch, FlatList, AccessibilityInfo, findNodeHandle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { shadow } from '../theme/shadows';
import api from '../services/api';
import { supabase } from '../services/supabase';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import Header from '../components/molecules/Header';
import AppButton from '../components/atoms/AppButton';
import SignOutButton from '../components/atoms/SignOutButton';
import ErrorMessage from '../components/atoms/ErrorMessage';
import Toast from '../components/atoms/Toast';
import CustomAlert from '../components/atoms/CustomAlert';
import QuickActions from '../components/molecules/QuickActions';
import UserStats from '../components/molecules/UserStats';
import FriendList from '../components/organisms/FriendList';
import ChatList from '../components/organisms/ChatList';
import AuthStateBanner from '../components/molecules/AuthStateBanner';
import ProfileContent from '../components/organisms/ProfileContent';

// --- ProfileScreen: modern, animated, accessible user profile ---
// Cleaned and modularized. All chips/cards should use atomic components if present.

// --- Modular components ---
const styles = {};

const SkeletonLoader = () => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();
  }, [shimmerAnim]);
  const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [-1, 1], outputRange: [-200, 200] });
  return (
    <View style={{ padding: 18 }}>
      <View style={{ height: 140, backgroundColor: '#f3f3f3', borderRadius: 18, marginBottom: 20, overflow: 'hidden' }}>
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
      </View>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={{ height: 40, backgroundColor: '#f3f3f3', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
        </View>
      ))}
    </View>
  );
};

const ProfileCard = ({ user, onEdit }) => {
  if (!user) {
    return (
      <View style={{ alignItems: 'center', marginTop: 48 }}>
        <Text style={{ color: '#888', fontSize: 16 }}>Not logged in.</Text>
      </View>
    );
  }
  return (
    <LinearGradient colors={['#FFF7F0', '#FFDAB9']} style={styles.profileCard}>
      <View style={{ alignItems: 'center' }}>
        <Image source={user.avatar ? { uri: user.avatar } : require('../assets/avatar-placeholder.png')} style={styles.avatar} />
        <Text style={styles.profileName}>{user.firstName || ''} {user.lastName || user.name || ''}</Text>
        
        <TouchableOpacity style={styles.editBtn} onPress={onEdit} accessibilityLabel="Edit profile">
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: 'bold', marginLeft: 6 }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const EditModal = ({ visible, onClose, user, onSave }) => {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [localImage, setLocalImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });
  const [success, setSuccess] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  
  const showAlert = (title, message, type = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        showAlert('Permission Needed', 'We need access to your camera to take a profile picture.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.9 });
      if (!res.canceled && res.assets?.length > 0) {
        setLocalImage(res.assets[0].uri);
      }
    } catch (e) {
      showAlert('Camera Error', 'Unable to open camera. Please try again.');
    }
  };
  
  const hideAlert = () => {
    setAlert({ visible: false, title: '', message: '', type: 'info' });
  };
  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        showAlert('Permission Needed', 'We need access to your photos to change your profile picture.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.9 });
      if (!res.canceled && res.assets?.length > 0) {
        setLocalImage(res.assets[0].uri);
      }
    } catch (e) {
      showAlert('Image Error', 'Unable to pick image. Please try again.');
    }
  };

  // Only parent closes modal after save, not here
  const handleSave = async () => {
    setFirstNameError('');
    setLastNameError('');
    if (!firstName.trim()) {
      setFirstNameError('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setLastNameError('Last name is required.');
      return;
    }
    setSaving(true);
    try {
      // Update Clerk user profile names
      if (user && user.id && user.update) {
        await user.update({ firstName: firstName?.trim() || '', lastName: lastName?.trim() || '' });
      }
      // Update profile picture if selected
      if (user && user.setProfileImage && localImage) {
        const resp = await fetch(localImage);
        const blob = await resp.blob();
        await user.setProfileImage({ file: blob });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSave?.({ firstName, lastName, imageChanged: !!localImage });
      }, 1200);
    } catch (err) {
      showAlert('Save Failed', 'Could not save profile information. Please try again.');
    }
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.editModal}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 18 }}>Edit Profile</Text>
          <ScrollView style={{ width: '100%' }}>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />
            {firstNameError ? <Text style={{ color: 'red', marginBottom: 6 }}>{firstNameError}</Text> : null}
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />
            {lastNameError ? <Text style={{ color: 'red', marginBottom: 6 }}>{lastNameError}</Text> : null}
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={pickImage} style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 10 }}>
                  <Text style={{ color: '#333', fontWeight: '600' }}>{localImage ? 'Change Photo' : 'Choose Photo'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 10 }}>
                  <Text style={{ color: '#333', fontWeight: '600' }}>Take Photo</Text>
                </TouchableOpacity>
              </View>
              {localImage && (
                <Image source={{ uri: localImage }} style={{ width: 90, height: 90, borderRadius: 45, marginTop: 12 }} />
              )}
            </View>
          </ScrollView>
          <AppButton style={styles.saveBtn} onPress={handleSave} disabled={saving || (!firstName.trim() && !lastName.trim())} accessibilityLabel="Save profile">
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{saving ? 'Saving...' : 'Save'}</Text>
          </AppButton>
          <Toast visible={success} message="Profile updated!" type="success" duration={1200} />
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose} accessibilityLabel="Close edit profile">
            <Ionicons name="close" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
    </Modal>
  );
};

const BadgeScroller = ({ badges }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
    {badges.map((badge, i) => (
      <View key={i} style={styles.badge}>
        <Image source={badge.icon} style={styles.badgeIcon} />
        <Text style={styles.badgeLabel}>{badge.label}</Text>
      </View>
    ))}
  </ScrollView>
);

const StatChart = ({ stats }) => (
  <View style={styles.statChartWrap}>
    {/* TODO: Replace with animated chart/progress bar */}
    <Text style={styles.statChartTitle}>Stats</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
      <View style={styles.statBar}><Text style={styles.statBarLabel}>Bookings</Text><View style={[styles.bar, { width: `${Math.min((stats.bookings || 0)/10*100,100)}%`, backgroundColor: '#007AFF' }]} /></View>
      <View style={styles.statBar}><Text style={styles.statBarLabel}>Reviews</Text><View style={[styles.bar, { width: `${Math.min((stats.reviews || 0)/10*100,100)}%`, backgroundColor: '#FF6F61' }]} /></View>
      <View style={styles.statBar}><Text style={styles.statBarLabel}>Favorites</Text><View style={[styles.bar, { width: `${Math.min((stats.favorites || 0)/10*100,100)}%`, backgroundColor: '#A259FF' }]} /></View>
      <View style={styles.statBar}><Text style={styles.statBarLabel}>Loyalty</Text><View style={[styles.bar, { width: `${Math.min((stats.loyalty || 0)/1000*100,100)}%`, backgroundColor: '#FFB300' }]} /></View>
    </View>
  </View>
);

const ActivityTimeline = ({ activities }) => (
  <View style={{ marginTop: 24 }}>
    {activities.length === 0 ? (
      <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>No activity yet.</Text>
    ) : (
      activities.map((item, idx) => (
        <Animatable.View key={item.id} animation="fadeInUp" delay={idx * 40} style={styles.timelineRow}>
          <View style={[styles.timelineIcon, { backgroundColor: '#FFF5E5' }] }>
            <MaterialCommunityIcons name={item.icon || 'star'} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.label}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{item.date}</Text>
            {item.desc && <Text style={{ color: '#666', fontSize: 13 }}>{item.desc}</Text>}
          </View>
        </Animatable.View>
      ))
    )}
  </View>
);

const SettingsSection = ({ settings, onToggle, onLogout }) => (
  <View style={styles.settingsSection}>
    <Text style={styles.settingsHeader}>Settings</Text>
    {settings.map((item, i) => (
      <View key={item.key} style={styles.settingRow}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        {item.type === 'switch' ? (
          <Switch value={item.value} onValueChange={() => onToggle(item.key)} />
        ) : (
          <TouchableOpacity onPress={item.action} accessibilityLabel={item.label}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    ))}
    <View style={{ borderTopWidth: 1, borderTopColor: '#f3f3f3', marginVertical: 18 }} />
    <AppButton style={styles.logoutBtn} onPress={onLogout} accessibilityLabel="Logout">
      <Ionicons name="log-out-outline" size={18} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Logout</Text>
    </AppButton>
  </View>
);



export default function ProfileScreen({ navigation }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [editVisible, setEditVisible] = useState(false);

  // Fetch stats, badges, activities from Supabase using user_id (UUID)
  useEffect(() => {
    async function fetchAppData() {
      if (!isLoaded || !user) return;
      setLoading(true);
      setError(null);
      try {
        // Get profile row from Supabase to find UUID id for this Clerk user
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_user_id', user.id)
          .single();
        if (!profile || profileError) {
          setStats(null);
          setBadges([]);
          setActivities([]);
          setLoading(false);
          return;
        }
        const uuid = profile.id;
        // Fetch stats
        let { data: statData } = await supabase.from('user_stats').select('*').eq('user_id', uuid).single();
        setStats(statData || null);
        // Fetch badges
        let { data: badgeData } = await supabase.from('user_badges').select('*').eq('user_id', uuid);
        setBadges(badgeData || []);
        // Fetch activities
        let { data: actData } = await supabase.from('user_activities').select('*').eq('user_id', uuid).order('date', { ascending: false });
        setActivities(actData || []);
      } catch (err) {
        setError('Could not load app data');
      }
      setLoading(false);
    }
    fetchAppData();
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#FF6F61" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 22, color: '#333', marginBottom: 8 }}>Not signed in</Text>
        <TouchableOpacity onPress={() => navigation?.navigate('SignIn')} style={{ padding: 16, backgroundColor: '#FF6F61', borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Clerk profile info */}
        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 24 }}>
          <Image source={user.imageUrl ? { uri: user.imageUrl } : require('../assets/avatar-placeholder.png')} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 12 }} />
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>{user.firstName || ''} {user.lastName || ''}</Text>
          <Text style={{ color: '#888', marginBottom: 12 }}>{user.primaryEmailAddress?.emailAddress || ''}</Text>
          <TouchableOpacity onPress={() => setEditVisible(true)} style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee' }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        {/* User stats */}
        {stats ? <UserStats stats={stats} /> : <Text style={{color:'#aaa',textAlign:'center'}}>No stats yet.</Text>}
        {/* Quick actions */}
        {/* Use Expo Router for navigation to tabs */}
        <QuickActions
          onAIChat={() => router.push('/(tabs)/aichat')}
          onBooking={() => router.push('/(tabs)/booking')}
          onFavorites={() => router.push('/(tabs)/favorites')}
          onSearch={() => router.push('/(tabs)/search')} />
        {/* Activities */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>Recent Activity</Text>
          {activities.length === 0 ? (
            <Text style={{ color: '#aaa', textAlign: 'center' }}>No activity yet.</Text>
          ) : (
            activities.map((item, idx) => (
              <View key={item.id || idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <Ionicons name={item.icon || 'star'} size={22} color="#FF6F61" style={{ marginRight: 12 }} />
                <View>
                  <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.label}</Text>
                  <Text style={{ color: '#888', fontSize: 12 }}>{item.date}</Text>
                  {item.description && <Text style={{ color: '#666', fontSize: 13 }}>{item.description}</Text>}
                </View>
              </View>
            ))
          )}
        </View>
        {/* Sign out button */}
        <View style={{ marginTop: 36, marginBottom: 24 }}>
          <SignOutButton />
        </View>
      </ScrollView>
      <EditModal visible={editVisible} onClose={() => setEditVisible(false)} user={user} onSave={() => setEditVisible(false)} />
    </SafeAreaView>
  );
}


