import React, { useState, useEffect } from 'react';
import Header from '../components/molecules/Header';
import AppButton from '../components/atoms/AppButton';
import ErrorMessage from '../components/atoms/ErrorMessage';
import Toast from '../components/atoms/Toast';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { shadow } from '../theme/shadows';
import { Animatable, fadeIn } from '../theme/animations';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// --- LoyaltyScreen: location-based, modern, animated loyalty experience ---
// --- Modular components (to be split out if needed) ---
const SkeletonLoader = () => {
  // Animated shimmer for points card and timeline
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);
  const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [-1, 1], outputRange: [-200, 200] });
  return (
    <View style={{ padding: 18 }}>
      <View style={[styles.pointsCard, { marginBottom: 20, overflow: 'hidden' }]}> 
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

const TierBadge = ({ tier }) => {
  // Animated badge for Bronze/Silver/Gold/Platinum
  const tierColors = {
    Bronze: ['#CD7F32', '#B87333'],
    Silver: ['#C0C0C0', '#B0B0B0'],
    Gold: ['#FFD700', '#FFC300'],
    Platinum: ['#E5E4E2', '#B3B6B7'],
  };
  return (
    <LinearGradient colors={tierColors[tier] || ['#eee', '#bbb']} style={styles.tierBadge}>
      <Text style={styles.tierBadgeText}>{tier}</Text>
    </LinearGradient>
  );
};

const RewardModal = ({ visible, onClose, onRedeem, rewards, selected, setSelected, redeeming }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.rewardModal}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Choose a Reward</Text>
        <ScrollView style={{ maxHeight: 260 }}>
          {rewards.map((reward, i) => (
            <TouchableOpacity
              key={reward.id}
              style={[styles.rewardOption, selected === i && styles.rewardOptionSelected]}
              onPress={() => setSelected(i)}
              accessibilityLabel={`Select reward: ${reward.label}`}
            >
              <Image source={reward.icon} style={styles.rewardIcon} />
              <Text style={{ flex: 1, fontWeight: 'bold', color: '#444' }}>{reward.label}</Text>
              <Text style={{ color: '#888', marginRight: 8 }}>{reward.points} pts</Text>
              {selected === i && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[styles.redeemBtn, { marginTop: 18, backgroundColor: selected !== null ? colors.primary : '#ccc' }]}
          onPress={onRedeem}
          disabled={redeeming || selected === null}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{redeeming ? 'Redeeming...' : 'Redeem'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeModalBtn} onPress={onClose} accessibilityLabel="Close reward selection">
          <Ionicons name="close" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const LoyaltyTimeline = ({ history }) => (
  <View style={{ marginTop: 24 }}>
    {history.length === 0 ? (
      <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>No transactions yet.</Text>
    ) : (
      history.map((item, idx) => (
        <Animatable.View key={item.id} animation="fadeInUp" delay={idx * 40} style={styles.timelineRow}>
          <View style={[styles.timelineIcon, { backgroundColor: item.action === 'earn_points' ? '#C8E6C9' : '#FFEBEE' }] }>
            <MaterialCommunityIcons name={item.action === 'earn_points' ? 'star-circle' : 'gift'} size={22} color={item.action === 'earn_points' ? '#43A047' : '#D32F2F'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.action === 'earn_points' ? 'Earned' : 'Redeemed'} {item.details?.amount || ''} pts</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{new Date(item.created_at).toLocaleString()}</Text>
            {item.details?.desc && <Text style={{ color: '#666', fontSize: 13 }}>{item.details.desc}</Text>}
          </View>
        </Animatable.View>
      ))
    )}
  </View>
);

const ProgressRing = ({ progress }) => {
  const ringAnim = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(ringAnim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [progress]);
  const ringStroke = ringAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.ringContainer}>
      <Animated.View style={[styles.ring, { transform: [{ rotate: ringStroke }] }]} />
    </View>
  );
};

const Leaderboard = () => {
  const dummyData = [
    { id: 1, name: 'John Doe', points: 1000, avatar: require('../assets/avatar1.png') },
    { id: 2, name: 'Jane Doe', points: 800, avatar: require('../assets/avatar2.png') },
    { id: 3, name: 'Bob Smith', points: 600, avatar: require('../assets/avatar3.png') },
  ];
  return (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.leaderboardHeader}>Leaderboard</Text>
      <FlatList
        data={dummyData}
        renderItem={({ item }) => (
          <View style={styles.leaderboardRow}>
            <Image source={item.avatar} style={styles.leaderboardAvatar} />
            <Text style={styles.leaderboardName}>{item.name}</Text>
            <Text style={styles.leaderboardPoints}>{item.points} pts</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const MissionList = () => {
  const dummyData = [
    { id: 1, title: 'Mission 1', description: 'Complete mission 1 to earn 100 points', points: 100 },
    { id: 2, title: 'Mission 2', description: 'Complete mission 2 to earn 200 points', points: 200 },
    { id: 3, title: 'Mission 3', description: 'Complete mission 3 to earn 300 points', points: 300 },
  ];
  return (
    <View style={styles.missionListContainer}>
      <Text style={styles.missionListHeader}>Missions</Text>
      <FlatList
        data={dummyData}
        renderItem={({ item }) => (
          <View style={styles.missionListRow}>
            <Text style={styles.missionListTitle}>{item.title}</Text>
            <Text style={styles.missionListDescription}>{item.description}</Text>
            <Text style={styles.missionListPoints}>{item.points} pts</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const GroupGiftModal = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.groupGiftModal}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Group Gift</Text>
        <Text style={{ color: '#666', fontSize: 16, marginBottom: 20 }}>Send a gift to your friends and earn points!</Text>
        <TouchableOpacity style={styles.groupGiftBtn} onPress={onClose}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send Gift</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const QRModal = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.qrModal}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>QR Code Scan</Text>
        <Text style={{ color: '#666', fontSize: 16, marginBottom: 20 }}>Scan a QR code to earn points!</Text>
        <TouchableOpacity style={styles.qrBtn} onPress={onClose}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const Confetti = () => {
  return (
    <View style={styles.confettiContainer}>
      <Image source={require('../assets/confetti.png')} style={styles.confettiImage} />
    </View>
  );
};

export default function LoyaltyScreen() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [rewardModal, setRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [tier, setTier] = useState('Bronze');
  const [confetti, setConfetti] = useState(false);
  const errorRef = useRef(null);
  const [error, setError] = useState('');

  // Example rewards (replace with backend)
  const rewards = [
    { id: 1, label: 'Free Drink', points: 100, icon: require('../assets/reward-drink.png') },
    { id: 2, label: 'Meal Voucher', points: 250, icon: require('../assets/reward-meal.png') },
    { id: 3, label: 'Local Souvenir', points: 500, icon: require('../assets/reward-souvenir.png') },
  ];

  useEffect(() => {
    fetchLoyalty();
  }, []);

  useEffect(() => {
    // Tier logic based on points
    if (points >= 1000) setTier('Platinum');
    else if (points >= 500) setTier('Gold');
    else if (points >= 250) setTier('Silver');
    else setTier('Bronze');
  }, [points]);

  useEffect(() => {
    // Accessibility: focus error if shown
    if (error && errorRef.current) {
      const node = findNodeHandle(errorRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [error]);

  const fetchLoyalty = async () => {
    setLoading(true);
    setError('');
    const start = Date.now();
    try {
      // Parallelize both API calls
      const [res, hist] = await Promise.all([
        api.get('/loyalty'),
        api.get('/loyalty/history'),
      ]);
      setPoints(res.data.points || 0);
      setHistory(hist.data || []);
      const duration = Date.now() - start;
      console.log(`[LoyaltyScreen] /loyalty and /loyalty/history fetched in ${duration}ms`);
    } catch {
      setError('Could not load loyalty data.');
      setPoints(0);
      setHistory([]);
    }
    setLoading(false);
  };


  const redeem = async () => {
    if (selectedReward == null) return;
    setRedeeming(true);
    try {
      await api.post('/loyalty/redeem', { amount: rewards[selectedReward].points });
      Alert.alert('Success', `${rewards[selectedReward].label} redeemed!`);
      setRewardModal(false);
      setSelectedReward(null);
      setConfetti(true); // TODO: show confetti animation
      fetchLoyalty();
    } catch {
      setError('Could not redeem reward.');
    }
    setRedeeming(false);
  };

  // --- Animated progress ring for points (simplified) ---
  const progress = Math.min(points / 1000, 1);
  const ringAnim = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(ringAnim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [progress]);
  const ringStroke = ringAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // --- Render ---
  return (
    <LinearGradient colors={['#FFF7F0', '#FFE5D0']} style={{ flex: 1 }}>
      {/* TODO: Batik pattern or mascot in background */}
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Loyalty Program</Text>
        {error ? (
          <Text ref={errorRef} accessibilityLiveRegion="polite" style={{ color: colors.error, textAlign: 'center', marginTop: 18 }}>{error}</Text>
        ) : null}
        {loading ? <SkeletonLoader /> : (
          <>
            {/* Points Card with animated ring and confetti */}
            <View style={styles.pointsCard}>
              {/* TODO: Confetti animation when redeeming */}
              <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <TierBadge tier={tier} />
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <ProgressRing progress={progress} />
                <Text style={styles.points}>{points} pts</Text>
                <Text style={{ color: '#666', fontSize: 13 }}>Tier: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{tier}</Text></Text>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, { backgroundColor: points >= 100 ? colors.primary : '#ccc', marginTop: 10 }]}
                onPress={() => setRewardModal(true)}
                disabled={points < 100}
                accessibilityLabel="Redeem points"
              >
                <Ionicons name="gift" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Redeem Points</Text>
              </TouchableOpacity>
            </View>
            {/* Timeline/history */}
            <Text style={styles.subheader}>Transaction History</Text>
            <LoyaltyTimeline history={history} />
            {/* Leaderboard */}
            <Leaderboard />
            {/* Missions */}
            <MissionList />
            {/* Group Gift */}
            <TouchableOpacity style={styles.groupGiftBtn} onPress={() => setGroupGiftModal(true)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send Group Gift</Text>
            </TouchableOpacity>
            {/* QR Code Scan */}
            <TouchableOpacity style={styles.qrBtn} onPress={() => setQRModal(true)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Scan QR Code</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <RewardModal
        visible={rewardModal}
        onClose={() => setRewardModal(false)}
        onRedeem={redeem}
        rewards={rewards}
        selected={selectedReward}
        setSelected={setSelectedReward}
        redeeming={redeeming}
      />
      <GroupGiftModal visible={groupGiftModal} onClose={() => setGroupGiftModal(false)} />
      <QRModal visible={qrModal} onClose={() => setQRModal(false)} />
      {confetti && <Confetti />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  points: { fontSize: 30, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 },
  redeemBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  subheader: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ringContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 10, borderColor: '#ccc' },
  ring: { width: 100, height: 100, borderRadius: 50, borderWidth: 10, borderColor: '#007AFF' },
  leaderboardContainer: { padding: 18, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  leaderboardHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  leaderboardAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  leaderboardName: { fontSize: 16, fontWeight: 'bold' },
  leaderboardPoints: { fontSize: 16, color: '#666' },
  missionListContainer: { padding: 18, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  missionListHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  missionListRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  missionListTitle: { fontSize: 16, fontWeight: 'bold' },
  missionListDescription: { fontSize: 16, color: '#666' },
  missionListPoints: { fontSize: 16, color: '#666' },
  groupGiftBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20, backgroundColor: '#007AFF' },
  qrBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20, backgroundColor: '#007AFF' },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  confettiImage: { width: 100, height: 100 },
});
