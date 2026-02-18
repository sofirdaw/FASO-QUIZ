import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { estPremium } from '../utils/storage';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { CONFIG_MODES } from '../data';

const { width } = Dimensions.get('window');

const MODES = [
  { id: 'rapide', titre: 'Mode Rapide', emoji: '⚡', description: `${CONFIG_MODES.rapide.questions} questions · 15s par question`, couleur: ['#C8000A', '#8B0000'], nb: CONFIG_MODES.rapide.questions, temps: 15 },
  { id: 'normal', titre: 'Mode Normal', emoji: '🎯', description: `${CONFIG_MODES.normal.questions} questions · 30s par question`, couleur: ['#009A44', '#006B30'], nb: CONFIG_MODES.normal.questions, temps: 30 },
  { id: 'expert', titre: 'Mode Expert', emoji: '🏆', description: `${CONFIG_MODES.expert.questions} questions · 20s par question`, couleur: ['#C8900A', '#8B6000'], nb: CONFIG_MODES.expert.questions, temps: 20 },
  { id: 'marathon', titre: 'Marathon', emoji: '🔥', description: `${CONFIG_MODES.marathon.questions} questions · 45s par question`, couleur: ['#6A1B9A', '#4A148C'], nb: CONFIG_MODES.marathon.questions, temps: 45 },
];

const HomeScreen = ({ navigation }) => {
  const { utilisateur } = useAuth();
  const [premium, setPremium] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    
    // Vérifier le statut premium
    if (utilisateur) {
      estPremium(utilisateur.id).then(setPremium);
    }
  }, [utilisateur]);

  useEffect(() => {
    // Afficher une publicité interstitielle toutes les 3 minutes
    if (!premium) {
      const timer = setTimeout(() => {
        setShowInterstitial(true);
      }, 180000); // 3 minutes
      
      return () => clearTimeout(timer);
    }
  }, [premium]);

  const lancerMode = (mode) => {
    navigation.navigate('Quiz', { mode });
  };

  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bonsoir' : 'Bonne nuit';

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.salut}>{salut}, {utilisateur?.avatar} {utilisateur?.nom || 'Joueur'}</Text>
              <Text style={styles.sousTitre}>Prêt à tester tes connaissances ?</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreEmoji}>⭐</Text>
              <Text style={styles.scoreNb}>{utilisateur?.totalPoints || 0}</Text>
            </View>
          </View>

          {/* Bannière */}
          <View style={styles.banniere}>
            <LinearGradient colors={[COLORS.rouge, '#8B0000', COLORS.rouge]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banniereGrad}>
              <View style={styles.drapeauMini}>
                <View style={[styles.bandeMini, { backgroundColor: COLORS.rouge }]} />
                <View style={[styles.bandeMini, { backgroundColor: COLORS.vert }]} />
                <View style={styles.etoileMini}><Text>★</Text></View>
              </View>
              <View>
                <Text style={styles.banniereTitre}>🇧🇫 FASO QUIZ</Text>
                <Text style={styles.banniereStats}>{CONFIG_MODES.rapide.questions + CONFIG_MODES.normal.questions + CONFIG_MODES.expert.questions + CONFIG_MODES.marathon.questions + CONFIG_MODES.concours.questions}+ questions Standard · {CONFIG_MODES.concours.questions}+ questions Concours</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Stats rapides */}
          <View style={styles.statsRow}>
            {[
              { label: 'Parties', val: utilisateur?.nombrePartiesJouees || 0, emoji: '🎮' },
              { label: 'Meilleur', val: `${utilisateur?.meilleurScore || 0}/${CONFIG_MODES.normal.questions}`, emoji: '🏆' },
              { label: 'Points', val: utilisateur?.totalPoints || 0, emoji: '⭐' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Modes de jeu */}
          <Text style={styles.sectionTitre}>🎮 Choisir un mode</Text>
          
          {/* Publicité supprimée - application gratuite */}
          
          <View style={styles.modesGrid}>
            {MODES.map(mode => (
              <TouchableOpacity key={mode.id} style={styles.modeCard} onPress={() => lancerMode(mode)} activeOpacity={0.85}>
                <LinearGradient colors={mode.couleur} style={styles.modeGrad}>
                  <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                  <Text style={styles.modeTitre}>{mode.titre}</Text>
                  <Text style={styles.modeDesc}>{mode.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bouton Concours Premium */}
          <Text style={styles.sectionTitre}>🎓 Prépare tes concours</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Concours')} activeOpacity={0.85}>
            <LinearGradient colors={['#C8900A', '#6B4C00', '#C8900A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.concoursBtn}>
              <Text style={{ fontSize: 40 }}>🎓</Text>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.concoursTitre}>Mode Concours</Text>
                <Text style={styles.concoursDesc}>Maths · Sciences · Histoire · Français · Logique</Text>
                <Text style={styles.concoursDesc}>{CONFIG_MODES.concours.questions}+ questions pour tes examens et concours</Text>
              </View>
              <View style={styles.premiumBadge}>
                <Text style={{ fontSize: 16 }}>👑</Text>
                <Text style={styles.premiumBadgeTxt}>PREMIUM</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Liens Premium supprimés */}

          {/* Citation */}
          <View style={styles.citation}>
            <Text style={styles.citationTxt}>"Osez inventer l'avenir."</Text>
            <Text style={styles.citationAuteur}>— Thomas Sankara 🇧🇫</Text>
          </View>

          <Text style={styles.branding}>FASO QUIZ v1.0 · 🇧🇫</Text>

          {/* Interstitielle supprimée */}

        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  inner: { padding: SPACING.lg, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: SPACING.lg },
  salut: { fontSize: 16, color: '#fff', fontWeight: '700' },
  sousTitre: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6 },
  scoreEmoji: { fontSize: 14 },
  scoreNb: { color: COLORS.jauneEtoile, fontWeight: '900', fontSize: 14, marginLeft: 4 },
  banniere: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg },
  banniereGrad: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  drapeauMini: { width: 40, height: 28, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', marginRight: 12 },
  bandeMini: { flex: 1 },
  etoileMini: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
  banniereTitre: { fontSize: 16, fontWeight: '900', color: '#fff' },
  banniereStats: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, padding: 14, marginBottom: SPACING.lg },
  statItem: { flex: 1, alignItems: 'center' },
  statEmoji: { fontSize: 20 },
  statVal: { fontSize: 16, fontWeight: '900', color: COLORS.jauneEtoile, marginTop: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  sectionTitre: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 12, marginTop: 4 },
  modesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.lg },
  modeCard: { width: (width - SPACING.lg * 2 - 10) / 2, borderRadius: RADIUS.lg, overflow: 'hidden' },
  modeGrad: { padding: 16, minHeight: 110 },
  modeEmoji: { fontSize: 30, marginBottom: 8 },
  modeTitre: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 4 },
  modeDesc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  concoursBtn: { borderRadius: RADIUS.lg, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  concoursTitre: { fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 3 },
  concoursDesc: { fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 16 },
  premiumBadge: { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: 8, alignItems: 'center', marginLeft: 8 },
  premiumBadgeTxt: { fontSize: 8, fontWeight: '900', color: COLORS.jauneEtoile, letterSpacing: 1, marginTop: 2 },
  premiumLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginBottom: SPACING.lg },
  premiumLinkTxt: { color: 'rgba(255,215,0,0.7)', fontSize: 12 },
  citation: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.lg, padding: 16, marginBottom: SPACING.lg, borderLeftWidth: 3, borderLeftColor: COLORS.rouge },
  citationTxt: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 22 },
  citationAuteur: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 },
  branding: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11 },
});

export default HomeScreen;
