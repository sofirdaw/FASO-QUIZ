import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const RegisterScreen = ({ navigation }) => {
  const { sInscrire } = useAuth();
  const [nom, setNom] = useState('');
  const [mdp, setMdp] = useState('');
  const [mdp2, setMdp2] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleRegister = async () => {
    if (!nom.trim() || !mdp.trim() || !mdp2.trim()) {
      Alert.alert('Champs manquants', 'Remplis tous les champs.'); return;
    }
    if (nom.trim().length < 3) {
      Alert.alert('Nom trop court', 'Au moins 3 caractères.'); return;
    }
    if (mdp.length < 4) {
      Alert.alert('Mot de passe trop court', 'Au moins 4 caractères.'); return;
    }
    if (mdp !== mdp2) {
      Alert.alert('Mots de passe différents', 'Les deux mots de passe doivent être identiques.'); return;
    }
    setChargement(true);
    const res = await sInscrire(nom.trim(), mdp);
    setChargement(false);
    if (!res.succes) Alert.alert('Inscription échouée', res.message);
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.emoji}>🦁</Text>
          <Text style={styles.titre}>Créer un compte</Text>
          <Text style={styles.sous}>Rejoins des milliers de joueurs 🇧🇫</Text>

          {[
            { label: "Nom d'utilisateur", val: nom, set: setNom, placeholder: 'Ex: August', secure: false },
            { label: 'Mot de passe', val: mdp, set: setMdp, placeholder: 'Au moins 4 caractères', secure: true },
            { label: 'Confirmer le mot de passe', val: mdp2, set: setMdp2, placeholder: 'Répète ton mot de passe', secure: true },
          ].map((f, i) => (
            <View key={i} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor="#555"
                value={f.val}
                onChangeText={f.set}
                secureTextEntry={f.secure}
                autoCapitalize="none"
                returnKeyType={i < 2 ? 'next' : 'done'}
                onSubmitEditing={i === 2 ? handleRegister : undefined}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, { opacity: chargement ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={chargement}
          >
            <LinearGradient colors={[COLORS.vert, '#006B30']} style={styles.btnGrad}>
              <Text style={styles.btnTxt}>{chargement ? 'Inscription...' : "S'inscrire"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.lien}>Déjà un compte ? <Text style={{ color: COLORS.jauneEtoile, fontWeight: 'bold' }}>Se connecter</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  inner: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 40, minHeight: '100%', justifyContent: 'center' },
  back: { position: 'absolute', top: 20, left: 16, padding: 8 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  titre: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 6 },
  sous: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 },
  field: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.md, padding: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  btnGrad: { padding: 17, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
  lien: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' },
});

export default RegisterScreen;
