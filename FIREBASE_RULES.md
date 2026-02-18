# 🔥 Règles Firebase pour Faso Quiz

## Copiez-collez ces règles dans Firebase Console → Firestore Database → Règles

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs - lecture/écriture pour tout le monde (mode test)
    match /utilisateurs/{userId} {
      allow read, write: if true;
    }
    
    // Premium - lecture/écriture pour tout le monde (mode test)
    match /premium/{userId} {
      allow read, write: if true;
    }
    
    // Statistiques - lecture pour tout le monde, écriture pour tout le monde (mode test)
    match /statistiques/{docId} {
      allow read, write: if true;
    }
    
    // Historique - lecture/écriture pour tout le monde (mode test)
    match /historique/{userId} {
      allow read, write: if true;
    }
    
    // Classement - lecture/écriture pour tout le monde (mode test)
    match /classement/{docId} {
      allow read, write: if true;
    }
    
    // Règle par défaut - tout autoriser (mode test)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## ⚠️ Important

Ces règles autorisent **tout le monde** à lire et écrire. 
C'est parfait pour le développement et les tests.

Pour la production, vous devrez sécuriser ces règles :

```javascript
// Exemple pour la production
match /utilisateurs/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
