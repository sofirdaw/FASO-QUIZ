// 🔄 Faso Quiz - Stockage Hybride (AsyncStorage + Firebase)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserInFirebase, 
  getUserFromFirebase, 
  updateUserLogin, 
  updateUserLogout,
  logUserAction
} from '../services/firebaseService';

const KEYS = {
  UTILISATEUR_COURANT: '@faso_user_courant',
  UTILISATEURS: '@faso_utilisateurs',
  HISTORIQUE: '@faso_historique_',
  CLASSEMENT: '@faso_classement',
};

// 🔄 MODE HYBRIDE - Fonction utilitaire
const useFirebase = true; // Temporairement désactivé pour debug

// ==================== UTILS ====================
const hashSimple = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
};

const AVATARS = ['🦁', '🐘', '🦒', '🦓', '🦅', '🐆', '🦏', '🦍', '🐊', '🦈'];
const getAvatarAleatoire = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

const getUtilisateurs = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.UTILISATEURS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ==================== AUTH HYBRIDE ====================
export const inscrireUtilisateur = async (nom, motDePasse) => {
  try {
    const utilisateurs = await getUtilisateurs();
    const existe = utilisateurs.find(u => u.nom.toLowerCase() === nom.toLowerCase());
    if (existe) return { succes: false, message: "Ce nom d'utilisateur existe déjà." };

    const nouvel = {
      id: Date.now().toString(),
      nom: nom.trim(),
      motDePasse: hashSimple(motDePasse),
      avatar: getAvatarAleatoire(),
      dateInscription: new Date().toISOString(),
      nombrePartiesJouees: 0,
      meilleurScore: 0,
      totalPoints: 0,
    };

    // AsyncStorage (backup)
    utilisateurs.push(nouvel);
    await AsyncStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs));

    // Firebase (si activé)
    if (useFirebase) {
      await createUserInFirebase(nouvel);
      await logUserAction(nouvel.id, 'INSCRIPTION', { nom });
    }

    return { succes: true, utilisateur: nouvel };
  } catch (error) {
    console.error('Erreur inscription:', error);
    return { succes: false, message: "Erreur lors de l'inscription." };
  }
};

export const connecterUtilisateur = async (nom, mdp) => {
  try {
    const utilisateurs = await getUtilisateurs();
    const user = utilisateurs.find(u => u.nom.toLowerCase() === nom.toLowerCase() && u.motDePasse === hashSimple(mdp));
    
    if (!user) {
      return { succes: false, message: "Nom d'utilisateur ou mot de passe incorrect." };
    }
    
    // AsyncStorage (backup)
    await AsyncStorage.setItem(KEYS.UTILISATEUR_COURANT, JSON.stringify(user));

    // Firebase (si activé)
    if (useFirebase) {
      try {
        await updateUserLogin(user.id, user);
        await logUserAction(user.id, 'CONNEXION', { nom });
      } catch (firebaseError) {
        // Continuer même si Firebase échoue, l'utilisateur est déjà connecté via AsyncStorage
      }
    }

    return { succes: true, utilisateur: user };
  } catch {
    return { succes: false, message: "Erreur de connexion." };
  }
};

export const deconnecterUtilisateur = async () => {
  try {
    // Récupérer l'utilisateur courant pour Firebase
    const currentUser = await getUtilisateurCourant();
    
    // AsyncStorage (backup)
    await AsyncStorage.removeItem(KEYS.UTILISATEUR_COURANT);

    // Firebase (si activé)
    if (useFirebase && currentUser) {
      await updateUserLogout(currentUser.id);
      await logUserAction(currentUser.id, 'DECONNEXION', {});
    }

  } catch (error) {
    throw error;
  }
};

export const getUtilisateurCourant = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.UTILISATEUR_COURANT);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// ==================== PREMIUM HYBRIDE ====================
// --- Premium disabled: app is now fully free ---
export const activerPremium = async (userId, premiumData) => {
  // No-op: application fully free, consider user premium implicitly
  return { succes: true };
};

export const getInfosPremium = async (userId) => {
  // Return a dummy far-future expiry to indicate permanent access
  return { dateFin: '2099-12-31T23:59:59.000Z' };
};

export const estPremium = async (userId) => {
  // Toujours vrai: toute la logique premium a été abolie
  return true;
};

// ==================== HISTORIQUE & CLASSEMENT ====================
export const sauvegarderPartie = async (userId, partieData) => {
  try {
    const historiqueKey = KEYS.HISTORIQUE + userId;
    const historique = await getHistorique(userId);
    historique.unshift(partieData);
    
    // Garder seulement les 100 dernières parties
    if (historique.length > 100) {
      historique.splice(100);
    }
    
    await AsyncStorage.setItem(historiqueKey, JSON.stringify(historique));

    // Firebase (si activé)
    if (useFirebase) {
      await logUserAction(userId, 'PARTIE_TERMINÉE', partieData);
    }

    return { succes: true };
  } catch (error) {
    console.error('Erreur sauvegarde partie:', error);
    return { succes: false };
  }
};

export const getHistorique = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(KEYS.HISTORIQUE + userId);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const mettreAJourClassement = async (userId, score) => {
  try {
    const classementKey = KEYS.CLASSEMENT;
    const classement = await getClassement();
    
    const utilisateurIndex = classement.findIndex(u => u.userId === userId);
    if (utilisateurIndex >= 0) {
      if (score > classement[utilisateurIndex].score) {
        classement[utilisateurIndex].score = score;
        classement[utilisateurIndex].date = new Date().toISOString();
      }
    } else {
      classement.push({
        userId,
        score,
        date: new Date().toISOString()
      });
    }
    
    // Garder seulement le top 100
    classement.sort((a, b) => b.score - a.score);
    if (classement.length > 100) {
      classement.splice(100);
    }
    
    await AsyncStorage.setItem(classementKey, JSON.stringify(classement));

    // Firebase (si activé)
    if (useFirebase) {
      await logUserAction(userId, 'CLASSEMENT_MIS_A_JOUR', { score });
    }

    return { succes: true };
  } catch (error) {
    console.error('Erreur mise à jour classement:', error);
    return { succes: false };
  }
};

export const getClassement = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CLASSEMENT);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ==================== UTILITAIRE ====================

export const migrerVersFirebase = async () => {
  try {
    console.log('🔄 Début de la migration vers Firebase...');
    
    const utilisateurs = await getUtilisateurs();
    let succesCount = 0;
    let errorCount = 0;
    
    for (const utilisateur of utilisateurs) {
      const result = await createUserInFirebase(utilisateur);
      if (result.success) {
        succesCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`✅ Migration terminée: ${succesCount} succès, ${errorCount} erreurs`);
    return { succes: true, succesCount, errorCount };
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    return { succes: false, error };
  }
};
