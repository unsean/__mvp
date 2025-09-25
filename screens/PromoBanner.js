import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// --- PromoBanner: Modern, animated, location-based promotional banner ---
export default function PromoBanner({ index }) {
  // Example promo banners, can be replaced with real data
  const promos = [
    {
      image: require('../assets/promo1.jpg'),
      text: 'Get 20% off on your first order!',
      type: 'Discount',
      expiry: 'Ends 30 June',
      tier: 'All',
      cta: 'Claim',
      special: true
    },
    {
      image: require('../assets/promo2.jpg'),
      text: 'Free dessert with every main course.',
      type: 'Food',
      expiry: 'Ends 25 June',
      tier: 'Silver+',
      cta: 'Learn More',
      special: false
    },
    {
      image: require('../assets/promo3.jpg'),
      text: 'Food Festival: Special Offers!',
      type: 'Event',
      expiry: '1-7 July',
      tier: 'All',
      cta: 'See Events',
      special: true
    }
  ];
  const promo = promos[index % promos.length];

  // --- Animated entrance ---
  const animRef = React.useRef(null);
  React.useEffect(() => {
    if (animRef.current && animRef.current.fadeIn) {
      animRef.current.fadeIn(600);
    }
  }, []);

  // --- Modular inner components ---
  const PromoImage = () => (
    <Image source={promo.image} style={styles.image} accessibilityLabel="Promo image" />
  );
  const PromoText = () => (
    <View style={{ flex: 1 }}>
      <Text style={styles.text}>{promo.text}</Text>
      <Text style={styles.subtext}>{promo.type} • {promo.expiry} • {promo.tier} tier</Text>
    </View>
  );
  const PromoCTA = () => (
    <TouchableOpacity
      style={styles.ctaBtn}
      onPress={() => alert(`${promo.cta} pressed!`)}
      accessibilityLabel={`${promo.cta} promo`}
      accessibilityRole="button"
    >
      <Text style={styles.ctaText}>{promo.cta}</Text>
    </TouchableOpacity>
  );
  // --- End modular inner components ---

  // --- Accessibility: ARIA roles, live region ---
  return (
    <View
      accessible
      accessibilityRole="banner"
      accessibilityLabel={`Promo: ${promo.text}, ${promo.type}, expires ${promo.expiry}`}
      style={styles.bannerWrap}
    >
      {/* TODO: Batik overlays, mascot badge, local branding, confetti for special promos */}
      <PromoImage />
      <PromoText />
      <PromoCTA />
      {/* TODO: AnimatedConfetti for special promos */}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E5',
    borderRadius: 14,
    marginVertical: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    // TODO: Batik background overlay
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 14
  },
  text: {
    fontSize: 15,
    color: '#FF6F61',
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  subtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginBottom: 2
  },
  ctaBtn: {
    backgroundColor: '#FF6F61',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10
  },
  ctaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13
  }
});
