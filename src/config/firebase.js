// 🔥 Faso Quiz - Configuration Firebase Simplifiée pour React Native
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpFRK4c4lRYRdROznw5PBGTBz6NOjHdFY",
  authDomain: "faso-quiz-589f8.firebaseapp.com",
  projectId: "faso-quiz-589f8",
  storageBucket: "faso-quiz-589f8.firebasestorage.app",
  messagingSenderId: "851940188266",
  appId: "1:851940188266:web:abcdef123456789"
};

// Initialisation Firebase avec gestion d'erreur et évitement des doublons
let app;
let db;

try {
  // Vérifier si une app Firebase existe déjà
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = getApp();
    console.log('🔥 Firebase app existante réutilisée');
  } else {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Nouvelle Firebase app initialisée');
  }
  
  db = getFirestore(app);
  console.log('✅ Firebase Production connecté avec succès');
  
} catch (error) {
  console.error('❌ Erreur initialisation Firebase:', error);
  // Fallback sur AsyncStorage
  db = null;
}

export { db, app };
export default app;
