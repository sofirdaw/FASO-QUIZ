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
// Active les appels Firebase (nécessaire pour récupérer les utilisateurs dans le panel admin)
const useFirebase = true; // mettre à false pour debug local sans backend

// === ADMIN SECURITY ===
const ADMIN_USERNAME = 'August_admin_001';
// REMARQUE: changez cette valeur pour un mot de passe admin sécurisé
const ADMIN_SECRET = 'Super$Admin123';
const ADMIN_SECRET_HASH = (str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
})(ADMIN_SECRET);

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
    // Interdire l'inscription du compte administrateur via le formulaire public
    if (nom && (nom.trim().toLowerCase() === 'august' || nom.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase())) {
      return { succes: false, message: "Ce nom est réservé. Contacte l'administrateur." };
    }
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

    // Firebase (si activé) — ne doit pas empêcher l'inscription locale
    if (useFirebase) {
      try {
        await createUserInFirebase(nouvel);
        await logUserAction(nouvel.id, 'INSCRIPTION', { nom });
      } catch (firebaseErr) {
        console.warn('Firebase: inscription distante échouée, sauvegarde locale OK', firebaseErr);
      }
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
    const hashed = hashSimple(mdp);
    let user = utilisateurs.find(u => u.nom.toLowerCase() === nom.toLowerCase() && u.motDePasse === hashed);

    // Cas spécial: possibilité d'identifier l'admin via le nom ADMIN_USERNAME et le secret
    if (!user && nom && nom.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() && hashed === ADMIN_SECRET_HASH) {
      // retrouver l'utilisateur correspondant (par nom ou par ancien nom 'August')
      user = utilisateurs.find(u => u.nom.toLowerCase() === ADMIN_USERNAME.toLowerCase() || u.nom.toLowerCase() === 'august');
      if (user) {
        // mettre à jour le mot de passe stocké et le flag isAdmin
        user.motDePasse = ADMIN_SECRET_HASH;
        user.isAdmin = true;
        await AsyncStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs));
      } else {
        // aucun utilisateur existant; créer un compte admin minimal local
        const nouvel = {
          id: Date.now().toString(),
          nom: ADMIN_USERNAME,
          motDePasse: ADMIN_SECRET_HASH,
          avatar: getAvatarAleatoire(),
          dateInscription: new Date().toISOString(),
          nombrePartiesJouees: 0,
          meilleurScore: 0,
          totalPoints: 0,
          isAdmin: true,
        };
        utilisateurs.push(nouvel);
        await AsyncStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs));
        user = nouvel;
      }
    }

    if (!user) {
      return { succes: false, message: "Nom d'utilisateur ou mot de passe incorrect." };
    }
    
    // AsyncStorage (backup)
    await AsyncStorage.setItem(KEYS.UTILISATEUR_COURANT, JSON.stringify(user));

    // S'assurer que le flag isAdmin est présent dans le stockage courant
    if (user.isAdmin) {
      const updated = { ...user, isAdmin: true };
      await AsyncStorage.setItem(KEYS.UTILISATEUR_COURANT, JSON.stringify(updated));
      user = updated;
    }
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

// Fonction utilitaire pour migrer un ancien compte 'August' vers le compte admin sécurisé
export const securiserAdminAccount = async () => {
  try {
    const utilisateurs = await getUtilisateurs();
    let modif = false;
    for (let u of utilisateurs) {
      if (u.nom && u.nom.trim().toLowerCase() === 'august') {
        // Utiliser les constantes sécurisées définies en haut du fichier
        u.nom = ADMIN_USERNAME;
        u.motDePasse = ADMIN_SECRET_HASH;
        u.isAdmin = true;
        modif = true;
      }
    }
    if (modif) {
      await AsyncStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs));
    }
    return { succes: true, migrated: modif };
  } catch (e) {
    return { succes: false, message: e.message };
  }
};

export const deconnecterUtilisateur = async () => {
  try {
    // Récupérer l'utilisateur courant pour Firebase
    const currentUser = await getUtilisateurCourant();
    
    // AsyncStorage (backup)
    await AsyncStorage.removeItem(KEYS.UTILISATEUR_COURANT);

    // Firebase (si activé) — ne doit pas faire échouer la déconnexion locale
    if (useFirebase && currentUser) {
      try {
        await updateUserLogout(currentUser.id);
        await logUserAction(currentUser.id, 'DECONNEXION', {});
      } catch (firebaseErr) {
        // Ignorer les erreurs Firebase pour préserver l'expérience déconnectée
      }
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
    // début migration vers Firebase
    
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
    
    // migration terminée
    return { succes: true, succesCount, errorCount };
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    return { succes: false, error };
  }
};
