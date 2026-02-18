import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getHistorique } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const HistoriqueScreen = () => {
  const { utilisateur } = useAuth();
  const [historique, setHistorique] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const charger = async () => {
    if (!utilisateur) return;
    const data = await getHistorique(utilisateur.id);
    setHistorique(data);
  };

  useFocusEffect(useCallback(() => { charger(); }, [utilisateur]));

  const onRefresh = async () => { setRefresh(true); await charger(); setRefresh(false); };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getCouleurNote = (note) => note >= 16 ? COLORS.vert : note >= 10 ? COLORS.jauneEtoile : COLORS.rouge;
  const getMention = (note) => note >= 16 ? 'Excellent' : note >= 12 ? 'Bien' : note >= 10 ? 'Passable' : 'À revoir';

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <View style={[styles.noteBadge, { backgroundColor: `${getCouleurNote(item.note)}22`, borderColor: getCouleurNote(item.note) }]}>
        <Text style={[styles.noteNb, { color: getCouleurNote(item.note) }]}>{item.note}</Text>
        <Text style={styles.noteSur}>/20</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.modeTxt}>{item.mode}</Text>
        <Text style={styles.statsTxt}>{item.bonnes}/{item.nbQuestions} · {getMention(item.note)}</Text>
        <Text style={styles.dateTxt}>{formatDate(item.date)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.pointsTxt}>+{item.points} pts</Text>
        <Text style={styles.numTxt}>#{index + 1}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.titre}>📋 Historique</Text>
          <Text style={styles.sous}>{historique.length} partie(s) jouée(s)</Text>
        </View>

        {historique.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>🎮</Text>
            <Text style={styles.videTxt}>Aucune partie jouée encore.</Text>
            <Text style={styles.videSous}>Lance ton premier quiz !</Text>
          </View>
        ) : (
          <FlatList
            data={historique}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={COLORS.rouge} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  inner: { flex: 1, padding: SPACING.lg, paddingTop: 50 },
  header: { marginBottom: 20 },
  titre: { fontSize: 26, fontWeight: '900', color: '#fff' },
  sous: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 12 },
  noteBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  noteNb: { fontSize: 18, fontWeight: '900' },
  noteSur: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
  modeTxt: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 3 },
  statsTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 3 },
  dateTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  pointsTxt: { color: COLORS.jauneEtoile, fontWeight: '900', fontSize: 14 },
  numTxt: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },
  vide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videEmoji: { fontSize: 60, marginBottom: 16 },
  videTxt: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  videSous: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});

export default HistoriqueScreen;
