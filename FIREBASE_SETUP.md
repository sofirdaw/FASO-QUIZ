# 🔥 Faso Quiz - Configuration Firebase

## 📋 Étapes de configuration

### 1. Créer un projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nom du projet : `faso-quiz`
4. Activez Google Analytics (optionnel)

### 2. Configurer Firestore Database
1. Dans Firebase Console → Build → Firestore Database
2. Créez une base de données en mode **Production**
3. Choisissez une localisation (ex: `europe-west`)
4. Configurez les règles de sécurité :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs peuvent lire/écrire leur propre profil
    match /utilisateurs/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Seuls les utilisateurs authentifiés peuvent lire les stats
    match /statistiques/{docId} {
      allow read: if request.auth != null;
      allow write: if false; // Écriture via les services uniquement
    }
    
    // Premium - lecture seule pour l'utilisateur concerné
    match /premium/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Obtenir les clés de configuration
1. Firebase Console → Paramètres du projet → Général
2. Section "Vos applications" → Web
3. Copiez la configuration `firebaseConfig`

### 4. Mettre à jour la configuration
Dans `src/config/firebase.js`, remplacez les clés par vos vraies clés :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "faso-quiz.firebaseapp.com",
  projectId: "faso-quiz",
  storageBucket: "faso-quiz.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### 5. Activer/Désactiver Firebase
Dans `src/utils/storageHybrid.js` :

```javascript
const useFirebase = true; // Mettez à false pour désactiver temporairement
```

## 🔄 Mode Hybride

### Sécurité intégrée
- **AsyncStorage** : Backup local (toujours fonctionnel)
- **Firebase** : Synchronisation cloud (si activé)
- **Migration** : Fonction `migrerVersFirebase()` disponible

### Test progressif
1. **Phase 1** : `useFirebase = false` (AsyncStorage uniquement)
2. **Phase 2** : `useFirebase = true` (Double stockage)
3. **Phase 3** : Migration complète

## 📊 Fonctionnalités disponibles

### Suivi des utilisateurs
- ✅ Inscriptions
- ✅ Connexions/Déconnexions
- ✅ Statistiques d'utilisation
- ✅ Premium tracking

### Dashboard admin
- Total utilisateurs
- Utilisateurs actifs
- Utilisateurs récents
- Logs d'actions

## 🚨 Précautions

### Avant d'activer Firebase
1. **Testez en développement** d'abord
2. **Sauvegardez vos données** existantes
3. **Vérifiez les règles** de sécurité
4. **Testez avec un compte** de test

### Migration
```javascript
// Pour migrer les utilisateurs existants
import { migrerVersFirebase } from './utils/storageHybrid';

// Dans votre code admin ou de test
await migrerVersFirebase();
```

## 🔧 Dépannage

### Erreurs communes
- **Permission denied** : Vérifiez les règles Firestore
- **Network error** : Vérifiez la connexion internet
- **Invalid API key** : Vérifiez la configuration Firebase

### Logs de debug
Les logs Firebase apparaissent dans la console pour :
- Création d'utilisateurs
- Connexions/Déconnexions
- Actions Premium
- Erreurs de synchronisation

## 📈 Monitoring

Firebase Console → Firestore → Data → Pour voir :
- Collections créées
- Documents utilisateurs
- Statistiques en temps réel

---

**⚠️ Important** : Ne mettez jamais vos clés Firebase dans le code côté client en production ! Utilisez les variables d'environnement pour la sécurité.
