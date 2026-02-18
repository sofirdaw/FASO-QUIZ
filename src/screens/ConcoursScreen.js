import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { estPremium } from '../utils/storage';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { CONFIG_MODES } from '../data';

const CATEGORIES = [
  { id: 'mathematiques', label: 'Mathématiques', emoji: '🔢', couleur: ['#1565C0', '#0D47A1'], nb: 109, desc: 'Arithmétique, algèbre, géométrie' },
  { id: 'sciences', label: 'Sciences', emoji: '🔬', couleur: ['#1B5E20', '#0A3D10'], nb: 133, desc: 'Physique, chimie, SVT' },
  { id: 'histoire_geo', label: 'Histoire-Géographie', emoji: '🌍', couleur: ['#4A148C', '#2D0059'], nb: 100, desc: 'Histoire mondiale et géographie' },
  { id: 'francais', label: 'Français', emoji: '📚', couleur: ['#880E4F', '#560027'], nb: 105, desc: 'Grammaire, vocabulaire, expression' },
  { id: 'logique', label: 'Logique', emoji: '🧠', couleur: ['#E65100', '#BF360C'], nb: 50, desc: 'Raisonnement, suites, problèmes' },
  { id: 'mixte', label: 'Mix complet', emoji: '🎯', couleur: [COLORS.rouge, '#8B0000'], nb: 497, desc: `Toutes les matières mélangées · ${497}+ questions` },
];

const MODES_CONCOURS = [
  { id: 'entrainement', label: 'Entraînement', emoji: '📖', description: 'Pas de timer · Prends ton temps', temps: 0 },
  { id: 'examen', label: 'Examen', emoji: '📝', description: '90s par question · Conditions réelles', temps: 90 },
  { id: 'sprint', label: 'Sprint', emoji: '⚡', description: '45s par question · Mode intensif', temps: 45 },
];

const ConcoursScreen = ({ navigation }) => {
  const { utilisateur } = useAuth();
  const [premium, setPremium] = useState(false);
  const [categorieChoisie, setCategorieChoisie] = useState(null);
  const [modeChoisi, setModeChoisi] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    if (utilisateur) {
      estPremium(utilisateur.id).then(setPremium);
    }
  }, [utilisateur]);

  const lancerConcours = () => {
    if (!categorieChoisie || !modeChoisi) return;
    navigation.navigate('Quiz', {
      mode: {
        id: `concours_${categorieChoisie.id}`,
        titre: `${categorieChoisie.emoji} ${categorieChoisie.label}`,
        emoji: categorieChoisie.emoji,
        nb: categorieChoisie.nb,
        temps: modeChoisi.temps,
        estConcours: true,
        categorieConcours: categorieChoisie.id,
      }
    });
  };

  // L'accès concours est désormais ouvert à tous (application gratuite)

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8 }}>Accueil</Text>
        </TouchableOpacity>

        <Text style={styles.titre}>🎓 Mode Concours</Text>
        <Text style={styles.sous}>1000+ questions · Prépare tes examens et concours</Text>

        {/* Choisir catégorie */}
        <Text style={styles.sectionLabel}>1. Choisir la matière</Text>
        
        {/* Publicité supprimée - application gratuite */}
        
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catCard, categorieChoisie?.id === cat.id && styles.catCardActive]}
              onPress={() => setCategorieChoisie(cat)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={cat.couleur} style={styles.catGrad}>
                {categorieChoisie?.id === cat.id && (
                  <View style={styles.checkOverlay}><Text style={{ color: COLORS.jauneEtoile, fontWeight: '900', fontSize: 13 }}>✓ Sélectionné</Text></View>
                )}
                <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <Text style={styles.catDesc}>{cat.nb} questions</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Choisir mode */}
        <Text style={styles.sectionLabel}>2. Choisir le mode</Text>
        {MODES_CONCOURS.map(mode => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeCard, modeChoisi?.id === mode.id && styles.modeCardActive]}
            onPress={() => setModeChoisi(mode)}
          >
            <Text style={{ fontSize: 26 }}>{mode.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.modeTitre}>{mode.label}</Text>
              <Text style={styles.modeDesc}>{mode.description}</Text>
            </View>
            {modeChoisi?.id === mode.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.vert} />}
          </TouchableOpacity>
        ))}

        {/* Lancer */}
        <TouchableOpacity
          style={[styles.btnLancer, { opacity: (!categorieChoisie || !modeChoisi) ? 0.4 : 1 }]}
          onPress={lancerConcours}
          disabled={!categorieChoisie || !modeChoisi}
        >
          <LinearGradient colors={['#C8900A', '#6B4C00']} style={styles.btnLancerGrad}>
            <Text style={styles.btnLancerTxt}>
              {!categorieChoisie ? 'Choisis une matière' : !modeChoisi ? 'Choisis un mode' : `🚀 Lancer ${categorieChoisie.label} · ${modeChoisi.label}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Interstitielle supprimée */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  inner: { padding: SPACING.lg, paddingTop: 50, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  titre: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6 },
  sous: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 24 },
  sectionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: { width: '47%', borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  catCardActive: { borderColor: COLORS.jauneEtoile },
  catGrad: { padding: 16, minHeight: 100, justifyContent: 'flex-end' },
  checkOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  catLabel: { color: '#fff', fontWeight: '800', fontSize: 13, marginTop: 8 },
  catDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  modeCardActive: { borderColor: COLORS.vert, backgroundColor: 'rgba(0,154,68,0.1)' },
  modeTitre: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 3 },
  modeDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  btnLancer: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: 8 },
  btnLancerGrad: { padding: 18, alignItems: 'center' },
  btnLancerTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },
  avantagePremium: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.lg, padding: 16, marginBottom: 24, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  avantageItem: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 26 },
});

export default ConcoursScreen;
