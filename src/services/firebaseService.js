// 🔥 Faso Quiz - Services Firebase avec gestion d'erreurs
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const USERS_COLLECTION = 'utilisateurs';
const PREMIUM_COLLECTION = 'premium';
const HISTORIQUE_COLLECTION = 'historique';
const STATS_COLLECTION = 'statistiques';

// 📊 Services Utilisateurs
export const createUserInFirebase = async (userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userData.id);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: true
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur création utilisateur Firebase:', error);
    return { success: false, error };
  }
};

export const updateUserLogin = async (userId, userData = {}) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Vérifier si l'utilisateur existe dans Firebase
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Si l'utilisateur n'existe pas, le créer
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isActive: true
      });
    } else {
      // Si l'utilisateur existe, le mettre à jour
      await updateDoc(userRef, {
        ...userData,
        lastLoginAt: serverTimestamp(),
        isActive: true
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur mise à jour connexion:', error);
    throw error;
  }
};

export const updateUserLogout = async (userId, userData = {}) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Vérifier si l'utilisateur existe dans Firebase
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...userData,
        lastLogoutAt: serverTimestamp(),
        isActive: false
      });
    } else {
      // Utilisateur non trouvé dans Firebase, déconnexion ignorée
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur mise à jour déconnexion:', error);
    // Ne pas throw l'erreur pour ne pas bloquer la déconnexion
    return { success: false, error };
  }
};

export const getUserFromFirebase = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'Utilisateur non trouvé' };
    }
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return { success: false, error };
  }
};

// 📊 Services Premium
export const createPremiumRecord = async (userId, premiumData) => {
  try {
    const premiumRef = doc(db, PREMIUM_COLLECTION, userId);
    await setDoc(premiumRef, {
      ...premiumData,
      createdAt: serverTimestamp(),
      isActive: true
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur création premium Firebase:', error);
    return { success: false, error };
  }
};

export const getPremiumFromFirebase = async (userId) => {
  try {
    const premiumRef = doc(db, PREMIUM_COLLECTION, userId);
    const premiumDoc = await getDoc(premiumRef);
    
    if (premiumDoc.exists()) {
      return { success: true, data: premiumDoc.data() };
    } else {
      return { success: false, error: 'Premium non trouvé' };
    }
  } catch (error) {
    console.error('Erreur récupération premium:', error);
    return { success: false, error };
  }
};

// 📊 Services Statistiques
export const logUserAction = async (userId, action, details = {}) => {
  try {
    const statsRef = doc(collection(db, STATS_COLLECTION));
    await setDoc(statsRef, {
      userId,
      action,
      details,
      timestamp: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur log action:', error);
    return { success: false, error };
  }
};

// 📊 Services Dashboard Admin
export const getTotalUsers = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Erreur comptage utilisateurs:', error);
    return { success: false, error };
  }
};

export const getActiveUsers = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Erreur utilisateurs actifs:', error);
    return { success: false, error };
  }
};

export const getRecentUsers = async (limitCount = 10) => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Erreur utilisateurs récents:', error);
    return { success: false, error };
  }
};
