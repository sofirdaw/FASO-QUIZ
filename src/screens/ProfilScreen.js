import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { estPremium, getInfosPremium } from '../utils/storageHybrid'; // Changement vers storageHybrid
import { mettreAJourUtilisateur } from '../utils/storage';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const ProfilScreen = ({ navigation }) => {
  const { utilisateur, seDeconnecter, rafraichirUtilisateur } = useAuth();
  const [premium, setPremium] = useState(false);
  const [infosPremium, setInfosPremium] = useState(null);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  useEffect(() => {
    if (!utilisateur) return;
    estPremium(utilisateur.id).then(setPremium);
    getInfosPremium(utilisateur.id).then(setInfosPremium);
  }, [utilisateur]);

  const handleDeconnexion = () => {
    setModalVisible(true);
  };

  const AVATARS = ['🦁', '🐘', '🦒', '🦓', '🦅', '🐆', '🦏', '🦍', '🐊', '🦈', '🦊', '🐿️', '🐻', '🐼', '🦄', '🐝'];

  

  const ouvrirSelectionAvatar = () => {
    setAvatarModalVisible(true);
  };

  const choisirAvatar = async (emoji) => {
    try {
      await mettreAJourUtilisateur(utilisateur.id, { avatar: emoji });
      await rafraichirUtilisateur();
    } catch (e) {
      // ignore
    } finally {
      setAvatarModalVisible(false);
    }
  };

  const confirmerDeconnexion = async () => {
    setModalVisible(false);
    setDeconnexionEnCours(true);
    
    try {
      await seDeconnecter();
      // Utiliser navigation.navigate avec un reset pour forcer la mise à jour
      navigation.navigate('Splash');
    } catch (error) {
      navigation.navigate('Splash');
    } finally {
      setDeconnexionEnCours(false);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const taux = utilisateur?.nombrePartiesJouees > 0
    ? Math.round((utilisateur.meilleurScore / 20) * 100)
    : 0;

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* Avatar + Nom */}
        <TouchableOpacity style={styles.avatarSection} onPress={ouvrirSelectionAvatar} activeOpacity={0.8}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{utilisateur?.avatar || '🦁'}</Text>
          </View>
          {premium && (
            <View style={styles.premiumCouronne}>
              <Text style={{ fontSize: 18 }}>👑</Text>
            </View>
          )}
          <Text style={styles.nomTxt}>{utilisateur?.nom || 'Joueur'}</Text>
          <Text style={styles.dateTxt}>Membre depuis {formatDate(utilisateur?.dateInscription)}</Text>
          <Text style={styles.changeAvatarHint}>Changer l'icône de profil</Text>
        </TouchableOpacity>

        {/* Badge premium */}
        {premium && (
          <View style={styles.premiumBadge}>
            <Text style={{ fontSize: 20 }}></Text>
            <View>
              <Text style={styles.premiumTitre}>Compte actif</Text>
              <Text style={styles.premiumExpire}>
               {infosPremium?.dateExpiration ? formatDate(infosPremium.dateExpiration) : '—'}
              </Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Parties jouées', val: utilisateur?.nombrePartiesJouees || 0, emoji: '🎮' },
            { label: 'Meilleur score', val: `${utilisateur?.meilleurScore || 0}/20`, emoji: '🏆' },
            { label: 'Total points', val: utilisateur?.totalPoints || 0, emoji: '⭐' },
            { label: 'Taux réussite', val: `${taux}%`, emoji: '📊' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitre}>⚙️ Options</Text>

        {/* Option 'Passer Premium' supprimée — tout est gratuit */}

        <TouchableOpacity style={styles.optionCardSimple} onPress={() => navigation.navigate('Classement')}>
          <Text style={styles.optionEmoji}>🏆</Text>
          <Text style={styles.optionTitreSimple}>Voir le classement</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCardSimple} onPress={() => navigation.navigate('Historique')}>
          <Text style={styles.optionEmoji}>📋</Text>
          <Text style={styles.optionTitreSimple}>Mon historique de parties</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Admin Dashboard - uniquement pour les admins */}
        {utilisateur?.nom === 'August' && (
          <TouchableOpacity style={styles.optionCardSimple} onPress={() => navigation.navigate('Admin')}>
            <Text style={styles.optionEmoji}>🔐</Text>
            <Text style={styles.optionTitreSimple}>Admin Dashboard</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.jauneEtoile} />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.optionCardSimple, { borderColor: 'rgba(200,0,10,0.3)' }]} 
          onPress={handleDeconnexion}
          disabled={deconnexionEnCours}
        >
          <Text style={styles.optionEmoji}>
            {deconnexionEnCours ? '⏳' : '🚪'}
          </Text>
          <Text style={[styles.optionTitreSimple, { color: COLORS.rouge }]}>
            {deconnexionEnCours ? 'Déconnexion...' : 'Se déconnecter'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.rouge} />
        </TouchableOpacity>

        <Text style={styles.version}>FASO QUIZ v1.0 · 🇧🇫 Burkina Faso</Text>
      </ScrollView>

      {/* Modal personnalisé pour la déconnexion */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚪 Déconnexion</Text>
            <Text style={styles.modalMessage}>Veux-tu vraiment te déconnecter ?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={confirmerDeconnexion}
                disabled={deconnexionEnCours}
              >
                <Text style={styles.modalButtonText}>
                  {deconnexionEnCours ? '⏳ Déconnexion...' : 'Se déconnecter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal pour choisir l'avatar */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 360 }]}>
            <Text style={styles.modalTitle}>Choisis une icône</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>Tape sur une icône pour l'appliquer</Text>
            <View style={styles.avatarsGrid}>
              {AVATARS.map((a) => (
                <TouchableOpacity key={a} style={styles.avatarOption} onPress={() => choisirAvatar(a)}>
                  <Text style={{ fontSize: 28 }}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.modalButton, { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.06)' }]} onPress={() => setAvatarModalVisible(false)}>
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  inner: { padding: SPACING.lg, paddingTop: 50, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.rouge, marginBottom: 10 },
  avatarEmoji: { fontSize: 44 },
  premiumCouronne: { position: 'absolute', top: 0, right: '30%' },
  nomTxt: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  dateTxt: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(200,144,10,0.15)', borderRadius: RADIUS.lg, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.jauneEtoile, gap: 12 },
  premiumTitre: { color: COLORS.jauneEtoile, fontWeight: '700', fontSize: 14 },
  premiumExpire: { color: 'rgba(255,215,0,0.6)', fontSize: 11, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', width: '47%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statVal: { fontSize: 18, fontWeight: '900', color: COLORS.jauneEtoile, marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center' },
  sectionTitre: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 12 },
  optionCard: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: 10 },
  optionGrad: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  optionEmoji: { fontSize: 22 },
  optionTitre: { color: '#fff', fontWeight: '700', fontSize: 14 },
  optionDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  optionCardSimple: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 12 },
  optionTitreSimple: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 14 },
  version: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 24 },
  changeAvatarHint: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 },
  avatarsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  avatarOption: { width: 56, height: 56, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', margin: 6 },
  
  // Styles pour le Modal personnalisé
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#1a1a1a', 
    borderRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    width: '85%', 
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rouge
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: SPACING.md 
  },
  modalMessage: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.8)', 
    textAlign: 'center', 
    marginBottom: SPACING.lg 
  },
  modalButtons: { 
    flexDirection: 'row', 
    gap: SPACING.md, 
    width: '100%' 
  },
  modalButton: { 
    flex: 1, 
    padding: SPACING.md, 
    borderRadius: RADIUS.md, 
    alignItems: 'center' 
  },
  modalButtonCancel: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  modalButtonConfirm: { 
    backgroundColor: COLORS.rouge 
  },
  modalButtonText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
});

export default ProfilScreen;
