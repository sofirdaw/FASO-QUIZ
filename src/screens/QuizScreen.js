import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, BackHandler, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { sauvegarderPartie } from '../utils/storage';
import { getQuestionsMode, getQuestionsConcours } from '../data/index';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const { width } = Dimensions.get('window');

const QuizScreen = ({ route, navigation }) => {
  const { mode } = route.params;
  const { utilisateur } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [indexQ, setIndexQ] = useState(0);
  const [reponsesChoisies, setReponsesChoisies] = useState([]);
  const [reponseSelectionnee, setReponseSelectionnee] = useState(null);
  const [valide, setValide] = useState(false);
  const [timer, setTimer] = useState(mode.temps || 30);
  const [enCours, setEnCours] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  // Charger les questions
  useEffect(() => {
    let qs;
    if (mode.estConcours) {
      qs = getQuestionsConcours(mode.categorieConcours, mode.nb || 30);
    } else {
      qs = getQuestionsMode(mode.id || 'rapide');
    }
    setQuestions(qs);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Bloquer le retour physique
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Quitter ?', 'Ta partie sera perdue.', [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Quitter', onPress: () => navigation.goBack() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, []);

  // Timer
  useEffect(() => {
    if (!enCours || valide || questions.length === 0) return;
    if (mode.temps === 0) return;
    setTimer(mode.temps);
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          validerReponse(null, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [indexQ, questions]);

  const validerReponse = useCallback((index, expiration = false) => {
    if (valide || !enCours) return;
    clearInterval(intervalRef.current);
    const reponseFinale = expiration ? null : index;
    setReponseSelectionnee(reponseFinale);
    setValide(true);
    setReponsesChoisies(prev => [...prev, reponseFinale]);
  }, [valide, enCours]);

  const questionSuivante = () => {
    if (indexQ + 1 >= questions.length) {
      terminerPartie();
      return;
    }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setIndexQ(i => i + 1);
    setReponseSelectionnee(null);
    setValide(false);
  };

  const terminerPartie = async () => {
    setEnCours(false);
    const bonne = reponsesChoisies.filter((r, i) => r === questions[i]?.answer).length;
    const total = questions.length;
    const note = Math.round((bonne / total) * 20 * 10) / 10;
    const points = bonne * 10 + (note >= 16 ? 50 : note >= 12 ? 20 : 0);

    const partie = { mode: mode.id || mode.titre, nbQuestions: total, bonnes: bonne, note, points };
    if (utilisateur) await sauvegarderPartie(utilisateur.id, partie);

    navigation.replace('Resultat', { bonne, total, note, points, mode });
  };

  if (questions.length === 0) {
    return (
      <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Chargement des questions...</Text>
      </LinearGradient>
    );
  }

  const q = questions[indexQ];
  const progression = ((indexQ + 1) / questions.length) * 100;
  const timerPct = mode.temps > 0 ? (timer / mode.temps) * 100 : 100;
  const timerCouleur = timer <= 5 ? COLORS.rouge : timer <= 10 ? COLORS.jauneEtoile : COLORS.vert;

  const getCouleurReponse = (i) => {
    if (!valide) return 'rgba(255,255,255,0.08)';
    if (i === q.answer) return 'rgba(0,154,68,0.35)';
    if (i === reponseSelectionnee && i !== q.answer) return 'rgba(200,0,10,0.35)';
    return 'rgba(255,255,255,0.04)';
  };

  const getBordureReponse = (i) => {
    if (!valide) return reponseSelectionnee === i ? COLORS.jauneEtoile : 'rgba(255,255,255,0.12)';
    if (i === q.answer) return COLORS.vert;
    if (i === reponseSelectionnee && i !== q.answer) return COLORS.rouge;
    return 'rgba(255,255,255,0.06)';
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.modeLabel}>{mode.emoji || '🎯'} {mode.titre}</Text>
          <Text style={styles.progression}>{indexQ + 1} / {questions.length}</Text>
        </View>

        {/* Barre progression */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progression}%` }]} />
        </View>

        {/* Timer */}
        {mode.temps > 0 && (
          <View style={styles.timerRow}>
            <View style={styles.timerBar}>
              <Animated.View style={[styles.timerFill, { width: `${timerPct}%`, backgroundColor: timerCouleur }]} />
            </View>
            <Text style={[styles.timerTxt, { color: timerCouleur }]}>{timer}s</Text>
          </View>
        )}

        {/* Question */}
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
          {q.categorie && (
            <View style={styles.categorieBadge}>
              <Text style={styles.categorieTxt}>{q.categorie}</Text>
            </View>
          )}
          <Text style={styles.questionTxt}>{q.question}</Text>
        </Animated.View>

        {/* Réponses */}
        <View style={styles.reponses}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.reponseCard, { backgroundColor: getCouleurReponse(i), borderColor: getBordureReponse(i) }]}
              onPress={() => validerReponse(i)}
              disabled={valide}
              activeOpacity={0.8}
            >
              <View style={[styles.reponseLetter, { backgroundColor: getBordureReponse(i) }]}>
                <Text style={styles.reponseLetterTxt}>{['A', 'B', 'C', 'D'][i]}</Text>
              </View>
              <Text style={styles.reponseTxt}>{opt}</Text>
              {valide && i === q.answer && <Text style={{ fontSize: 18, marginLeft: 8 }}>✅</Text>}
              {valide && i === reponseSelectionnee && i !== q.answer && <Text style={{ fontSize: 18, marginLeft: 8 }}>❌</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Explication + Suivant */}
        {valide && (
          <View style={styles.bas}>
            <View style={[styles.feedbackCard, { borderColor: reponseSelectionnee === q.answer ? COLORS.vert : COLORS.rouge }]}>
              <Text style={styles.feedbackTxt}>
                {reponseSelectionnee === q.answer ? '✅ Bonne réponse !' : reponseSelectionnee === null ? '⏱️ Temps écoulé !' : `❌ Mauvaise réponse. La bonne réponse était : "${q.options[q.answer]}"`}
              </Text>
            </View>
            <TouchableOpacity style={styles.btnSuivant} onPress={questionSuivante}>
              <LinearGradient colors={indexQ + 1 >= questions.length ? [COLORS.jauneEtoile, '#C8900A'] : [COLORS.rouge, '#8B0000']} style={styles.btnSuivantGrad}>
                <Text style={styles.btnSuivantTxt}>
                  {indexQ + 1 >= questions.length ? '🏁 Voir les résultats' : 'Question suivante →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  inner: { padding: SPACING.lg, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modeLabel: { color: COLORS.jauneEtoile, fontWeight: '700', fontSize: 13 },
  progression: { color: '#fff', fontWeight: '900', fontSize: 15 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.full, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.rouge, borderRadius: RADIUS.full },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  timerBar: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.full, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: RADIUS.full },
  timerTxt: { fontSize: 14, fontWeight: '900', width: 36, textAlign: 'right' },
  questionCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minHeight: 120 },
  categorieBadge: { backgroundColor: 'rgba(200,0,10,0.2)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10 },
  categorieTxt: { color: COLORS.rouge, fontSize: 11, fontWeight: '700' },
  questionTxt: { color: '#fff', fontSize: 17, fontWeight: '700', lineHeight: 26 },
  reponses: { gap: 10, marginBottom: SPACING.lg },
  reponseCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: 14, borderWidth: 1.5 },
  reponseLetter: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reponseLetterTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  reponseTxt: { flex: 1, color: '#fff', fontSize: 14, lineHeight: 20 },
  bas: { gap: 12 },
  feedbackCard: { borderRadius: RADIUS.lg, padding: 14, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.05)' },
  feedbackTxt: { color: '#fff', fontSize: 14, lineHeight: 21 },
  btnSuivant: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnSuivantGrad: { padding: 17, alignItems: 'center' },
  btnSuivantTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },
});

export default QuizScreen;
