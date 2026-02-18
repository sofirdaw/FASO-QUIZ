import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const ResultatScreen = ({ route, navigation }) => {
  const { bonne, total, note, points, mode } = route.params;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const pct = Math.round((bonne / total) * 100);
  const mention = note >= 18 ? '🏆 Excellent !' : note >= 16 ? '⭐ Très bien !' : note >= 12 ? '👍 Bien' : note >= 10 ? '😐 Passable' : '📚 À revoir';
  const couleurNote = note >= 16 ? COLORS.vert : note >= 10 ? COLORS.jauneEtoile : COLORS.rouge;

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>

          <Text style={styles.titre}>{mention}</Text>
          <Text style={styles.mode}>{mode?.emoji || '🎯'} {mode?.titre || 'Quiz'}</Text>

          {/* Note principale */}
          <View style={[styles.noteCircle, { borderColor: couleurNote }]}>
            <Text style={[styles.noteNb, { color: couleurNote }]}>{note}</Text>
            <Text style={styles.noteSur}>/20</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Bonnes réponses', val: bonne, emoji: '✅', couleur: COLORS.vert },
              { label: 'Mauvaises', val: total - bonne, emoji: '❌', couleur: COLORS.rouge },
              { label: 'Taux réussite', val: `${pct}%`, emoji: '📊', couleur: COLORS.jauneEtoile },
              { label: 'Points gagnés', val: `+${points}`, emoji: '⭐', couleur: COLORS.jauneEtoile },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={[styles.statVal, { color: s.couleur }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Message */}
          <View style={styles.messageCard}>
            <Text style={styles.messageTxt}>
              {pct === 100 ? '🇧🇫 Parfait ! Tu connais le Burkina comme ta poche !' :
               pct >= 80 ? '🎉 Excellent résultat ! Tu maîtrises bien le sujet.' :
               pct >= 60 ? '👍 Bon travail ! Encore un peu d\'effort pour atteindre l\'excellence.' :
               pct >= 40 ? '📚 Continue à apprendre sur le Burkina Faso !' :
               '💪 Ne te décourage pas, chaque partie t\'apprend quelque chose !'}
            </Text>
          </View>

          {/* Boutons */}
          <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('Quiz', { mode })}>
            <LinearGradient colors={[COLORS.rouge, '#8B0000']} style={styles.btnGrad}>
              <Text style={styles.btnTxt}>🔄 Rejouer ce mode</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MainTabs')}>
            <LinearGradient colors={[COLORS.vert, '#006B30']} style={styles.btnGrad}>
              <Text style={styles.btnTxt}>🏠 Retour à l'accueil</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Classement')} style={styles.lienClassement}>
            <Text style={styles.lienTxt}>📊 Voir le classement</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  inner: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  titre: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 6 },
  mode: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 },
  noteCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 28, backgroundColor: 'rgba(255,255,255,0.05)' },
  noteNb: { fontSize: 46, fontWeight: '900', lineHeight: 52 },
  noteSur: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: -4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20, width: '100%' },
  statCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.lg, padding: 16, alignItems: 'center', width: '47%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statVal: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center' },
  messageCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, padding: 16, marginBottom: 24, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  messageTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  btn: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: 12 },
  btnGrad: { padding: 17, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },
  lienClassement: { marginTop: 8, padding: 8 },
  lienTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});

export default ResultatScreen;
