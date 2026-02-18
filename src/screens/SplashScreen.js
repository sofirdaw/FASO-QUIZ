import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Drapeau Burkina */}
        <View style={styles.drapeau}>
          <View style={[styles.bande, { backgroundColor: COLORS.rouge }]} />
          <View style={[styles.bande, { backgroundColor: COLORS.vert }]} />
          <View style={styles.etoile}><Text style={styles.etoileTxt}>★</Text></View>
        </View>

        <Text style={styles.titre}>FASO QUIZ</Text>
        <Text style={styles.sous}>🇧🇫 Le Quiz du Burkina Faso</Text>
        <Text style={styles.tagline}>Apprend et teste tes connaissances sur ton pays !</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNb}>1800+</Text>
            <Text style={styles.statLabel}>Questions Standard</Text>
          </View>
          <View style={styles.sep} />
          <View style={styles.statItem}>
            <Text style={styles.statNb}>1000+</Text>
            <Text style={styles.statLabel}>Questions Concours</Text>
          </View>
          <View style={styles.sep} />
          <View style={styles.statItem}>
            <Text style={styles.statNb}>4</Text>
            <Text style={styles.statLabel}>Modes de jeu</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnCommencer} onPress={() => navigation.navigate('Login')}>
          <LinearGradient colors={[COLORS.rouge, '#8B0000']} style={styles.btnGrad}>
            <Text style={styles.btnTxt}>Commencer →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.inscriptionTxt}>Pas encore de compte ? <Text style={{ color: COLORS.jauneEtoile, fontWeight: 'bold' }}>S'inscrire</Text></Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  drapeau: { width: 90, height: 60, borderRadius: 8, overflow: 'hidden', marginBottom: 24, flexDirection: 'row' },
  bande: { flex: 1 },
  etoile: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
  etoileTxt: { fontSize: 28, color: COLORS.jauneEtoile },
  titre: { fontSize: 38, fontWeight: '900', color: COLORS.jauneEtoile, letterSpacing: 3, marginBottom: 4 },
  sous: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 32, textAlign: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 32, width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statNb: { fontSize: 22, fontWeight: '900', color: COLORS.jauneEtoile },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 2 },
  sep: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },
  btnCommencer: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  btnGrad: { padding: 18, alignItems: 'center' },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '900' },
  inscriptionTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});

export default SplashScreen;
