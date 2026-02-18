import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  UTILISATEUR_COURANT: '@faso_user_courant',
  UTILISATEURS: '@faso_utilisateurs',
  HISTORIQUE: '@faso_historique_',
  CLASSEMENT: '@faso_classement',
  PREMIUM: '@faso_premium_',
};

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

// ==================== AUTH ====================
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
    utilisateurs.push(nouvel);
    await AsyncStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs));
    return { succes: true, utilisateur: nouvel };
  } catch {
    return { succes: false, message: "Erreur d'inscription." };
  }
};

export const connecterUtilisateur = async (nom, motDePasse) => {
  try {
    const utilisateurs = await getUtilisateurs();
    const user = utilisateurs.find(u =>
      u.nom.toLowerCase() === nom.toLowerCase() &&
      u.motDePasse === hashSimple(motDePasse)
    );
    if (!user) return { succes: false, message: "Nom ou mot de passe incorrect." };
    await AsyncStorage.setItem(KEYS.UTILISATEUR_COURANT, JSON.stringify(user));
    return { succes: true, utilisateur: user };
  } catch {
    return { succes: false, message: "Erreur de connexion." };
  }
};

export const deconnecterUtilisateur = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.UTILISATEUR_COURANT);
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

export const mettreAJourUtilisateur = async (userId, miseAJour) => {
  try {
    const utilisateurs = await getUtilisateurs();
    const idx = utilisateurs.findIndex(u => u.id === userId);
    if (idx === -1) return;
    utilisateurs[idx] = { ...utilisateurs[idx], ...miseAJour };
    await AsyncStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs));
    await AsyncStorage.setItem(KEYS.UTILISATEUR_COURANT, JSON.stringify(utilisateurs[idx]));
  } catch {}
};

// ==================== HISTORIQUE ====================
export const sauvegarderPartie = async (userId, partie) => {
  try {
    const key = KEYS.HISTORIQUE + userId;
    const data = await AsyncStorage.getItem(key);
    const historique = data ? JSON.parse(data) : [];
    historique.unshift({ ...partie, date: new Date().toISOString() });
    if (historique.length > 50) historique.splice(50);
    await AsyncStorage.setItem(key, JSON.stringify(historique));

    // Mettre à jour stats utilisateur
    const utilisateurs = await getUtilisateurs();
    const idx = utilisateurs.findIndex(u => u.id === userId);
    if (idx !== -1) {
      utilisateurs[idx].nombrePartiesJouees = (utilisateurs[idx].nombrePartiesJouees || 0) + 1;
      utilisateurs[idx].totalPoints = (utilisateurs[idx].totalPoints || 0) + (partie.points || 0);
      if ((partie.note || 0) > (utilisateurs[idx].meilleurScore || 0)) {
        utilisateurs[idx].meilleurScore = partie.note;
      }
      await AsyncStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs));
      await AsyncStorage.setItem(KEYS.UTILISATEUR_COURANT, JSON.stringify(utilisateurs[idx]));
    }

    // Mettre à jour classement
    await mettreAJourClassement(userId, partie);
  } catch {}
};

export const getHistorique = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(KEYS.HISTORIQUE + userId);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ==================== CLASSEMENT ====================
const mettreAJourClassement = async (userId, partie) => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CLASSEMENT);
    const classement = data ? JSON.parse(data) : [];
    const utilisateurs = await getUtilisateurs();
    const user = utilisateurs.find(u => u.id === userId);
    if (!user) return;

    const idx = classement.findIndex(c => c.userId === userId);
    const entree = {
      userId,
      nom: user.nom,
      avatar: user.avatar,
      meilleurScore: Math.max(partie.note || 0, idx >= 0 ? classement[idx].meilleurScore : 0),
      totalPoints: (idx >= 0 ? classement[idx].totalPoints : 0) + (partie.points || 0),
      nombreParties: (idx >= 0 ? classement[idx].nombreParties : 0) + 1,
    };

    if (idx >= 0) classement[idx] = entree;
    else classement.push(entree);

    classement.sort((a, b) => b.meilleurScore - a.meilleurScore);
    await AsyncStorage.setItem(KEYS.CLASSEMENT, JSON.stringify(classement.slice(0, 100)));
  } catch {}
};

export const getClassement = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CLASSEMENT);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ==================== PREMIUM ====================
export const activerPremium = async (userId, infos) => {
  // No-op: app is free, premium activation not required
  return { succes: true };
};

export const estPremium = async (userId) => {
  // Toujours vrai: tout le contenu est accessible gratuitement
  return true;
};

export const getInfosPremium = async (userId) => {
  // Retourne une info générique indiquant un accès permanent
  return { actif: true, dateExpiration: '2099-12-31T23:59:59.000Z' };
};
