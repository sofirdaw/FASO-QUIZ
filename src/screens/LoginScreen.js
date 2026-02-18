import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const LoginScreen = ({ navigation }) => {
  const { seConnecter } = useAuth();
  const [nom, setNom] = useState('');
  const [mdp, setMdp] = useState('');
  const [afficher, setAfficher] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreurMessage, setErreurMessage] = useState('');

  const handleLogin = async () => {
    setErreurMessage(''); // Réinitialiser le message d'erreur
    
    if (!nom.trim() || !mdp.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setChargement(true);
    
    try {
      const result = await seConnecter(nom.trim(), mdp);
      
      if (result.succes) {
        Alert.alert(
          '✅ Connexion réussie', 
          `Bienvenue ${result.utilisateur.nom} ! 🎉`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Afficher l'erreur dans l'interface au lieu de l'alerte
        setErreurMessage(result.message || 'Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      setErreurMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.emoji}>🎓</Text>
          <Text style={styles.titre}>Se connecter</Text>
          <Text style={styles.sous}>Bienvenue sur Faso Quiz 🇧🇫</Text>

          {/* Message d'erreur */}
          {erreurMessage ? (
            <View style={styles.erreurContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff4444" />
              <Text style={styles.erreurText}>{erreurMessage}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Ton nom..."
              placeholderTextColor="#555"
              value={nom}
              onChangeText={(text) => {
                setNom(text);
                setErreurMessage(''); // Effacer l'erreur quand l'utilisateur tape
              }}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Mot de passe..."
                placeholderTextColor="#555"
                value={mdp}
                onChangeText={(text) => {
                  setMdp(text);
                  setErreurMessage(''); // Effacer l'erreur quand l'utilisateur tape
                }}
                secureTextEntry={!afficher}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setAfficher(!afficher)} style={styles.eyeBtn}>
                <Ionicons name={afficher ? 'eye' : 'eye-off'} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, { opacity: chargement ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={chargement}
          >
            <LinearGradient colors={[COLORS.rouge, '#8B0000']} style={styles.btnGrad}>
              <Text style={styles.btnTxt}>{chargement ? 'Connexion...' : 'Se connecter'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.lien}>Pas de compte ? <Text style={{ color: COLORS.jauneEtoile, fontWeight: 'bold' }}>S'inscrire</Text></Text>
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
  erreurContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 68, 68, 0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 68, 68, 0.3)', 
    borderRadius: RADIUS.md, 
    padding: 12, 
    marginBottom: 20 
  },
  erreurText: { color: '#ff4444', fontSize: 14, marginLeft: 8, flex: 1 },
  field: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.md, padding: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14 },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  btnGrad: { padding: 17, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
  lien: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' },
});

export default LoginScreen;
