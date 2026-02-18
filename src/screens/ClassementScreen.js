import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getClassement } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const ClassementScreen = () => {
  const { utilisateur } = useAuth();
  const [classement, setClassement] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const charger = async () => {
    const data = await getClassement();
    setClassement(data);
  };

  useFocusEffect(useCallback(() => { charger(); }, []));

  const onRefresh = async () => { setRefresh(true); await charger(); setRefresh(false); };

  const podiumEmoji = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
  const podiumCouleur = (i) => [COLORS.jauneEtoile, '#C0C0C0', '#CD7F32'][i] || 'rgba(255,255,255,0.7)';

  const renderItem = ({ item, index }) => {
    const estMoi = item.userId === utilisateur?.id;
    return (
      <View style={[styles.item, estMoi && styles.itemMoi]}>
        <Text style={[styles.rang, { color: podiumCouleur(index) }]}>{podiumEmoji(index)}</Text>
        <Text style={styles.avatar}>{item.avatar || '🦁'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.nom, estMoi && { color: COLORS.jauneEtoile }]}>
            {item.nom} {estMoi && '(moi)'}
          </Text>
          <Text style={styles.parties}>{item.nombreParties || 0} partie(s)</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.score, { color: podiumCouleur(index) }]}>{item.meilleurScore}/20</Text>
          <Text style={styles.points}>⭐ {item.totalPoints || 0} pts</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titre}>🏆 Classement</Text>
          <Text style={styles.sous}>{classement.length} joueur(s)</Text>
        </View>

        {classement.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>🎮</Text>
            <Text style={styles.videTxt}>Aucune partie jouée encore.</Text>
            <Text style={styles.videSous}>Joue une partie pour apparaître ici !</Text>
          </View>
        ) : (
          <FlatList
            data={classement}
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
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  itemMoi: { borderColor: COLORS.jauneEtoile, backgroundColor: 'rgba(255,215,0,0.08)' },
  rang: { fontSize: 22, width: 34, textAlign: 'center', fontWeight: '900' },
  avatar: { fontSize: 26 },
  nom: { color: '#fff', fontWeight: '700', fontSize: 15 },
  parties: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  score: { fontSize: 18, fontWeight: '900' },
  points: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  vide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videEmoji: { fontSize: 60, marginBottom: 16 },
  videTxt: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  videSous: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});

export default ClassementScreen;
