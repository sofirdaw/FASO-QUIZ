# 🇧🇫 Faso Quiz v2.0 — Instructions d'installation

## ⚡ Démarrage rapide

```bash
# 1. Dézipper et entrer dans le dossier
cd Faso-quiz

# 2. Installer les dépendances
npm install

# 3. Lancer sur Android
npx expo start --android
# OU scanner le QR code avec l'app Expo Go
npx expo start
```


## 🎮 Fonctionnalités

### Gratuit
- Mode Rapide (200 questions, 15s)
- Mode Normal (300 questions, 30s)
- 100 questions Burkina de base
- Classement local Top 10

- Mode Expert (500 questions, 20s)
- Mode Marathon (800 questions, 45s)
- 1200+ questions Burkina
- Mode Concours 1000+ questions (Maths, Sciences, Histoire-Géo, Français, Logique)
- Classement Top 100
- 3 plans : Mensuel / Annuel / Pass Concours

# Actuellement gratuit; toujours en cours de developpement


## 🚀 Build APK (Android)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Configurer EAS
eas build:configure

# Build APK preview (test)
eas build --platform android --profile preview

# Build APK production
eas build --platform android --profile production
```

## ⚠️ Notes importantes

1. **Assets** : Remplacer les images placeholder dans `/assets/` par tes vraies images
2. **Paiement production** : Intégrer CinetPay ou FedaPay pour les vrais paiements
3. **Questions** : 500 Burkina + 200 concours = 700 questions total
4. **Cache Expo** : Si problème, faire `npx expo start --clear`
# FASO-QUIZ
