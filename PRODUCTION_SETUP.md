# 📱 Configuration Production - Faso Quiz

## 🔐 Système OTP Production

### 1. Configuration SMS API

#### Option A: Twilio (Recommandé)
```javascript
// Dans src/screens/PremiumScreen.js
const TWILIO_CONFIG = {
  accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
  authToken: 'YOUR_TWILIO_AUTH_TOKEN',
  fromNumber: '+226YOUR_TWILIO_NUMBER'
};

// Remplacer le code commenté dans envoyerSMSOTP()
const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`, {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    To: `+226${telephone}`,
    From: TWILIO_CONFIG.fromNumber,
    Body: `Votre code de vérification Faso Quiz est: ${code}. Valable 10 minutes.`,
  }),
});
```

#### Option B: Orange SMS API Burkina
```javascript
const ORANGE_CONFIG = {
  token: 'YOUR_ORANGE_API_TOKEN',
  senderAddress: 'tel:+226YOUR_ORANGE_NUMBER'
};

// Remplacer le code commenté dans envoyerSMSOTP()
const response = await fetch('https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B226YOUR_NUMBER/requests', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ORANGE_CONFIG.token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    outboundSMSMessageRequest: {
      address: `tel:+226${telephone}`,
      senderAddress: ORANGE_CONFIG.senderAddress,
      outboundSMSTextMessage: {
        message: `Votre code Faso Quiz: ${code}. Valide 10min.`
      }
    }
  }),
});
```

### 2. Variables d'environnement

Créer un fichier `.env` à la racine du projet:
```
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+226xxxxxxxx

# Orange Configuration
ORANGE_API_TOKEN=your_orange_token
ORANGE_SENDER_ADDRESS=tel:+226xxxxxxxx

# Numéro de dépôt
DEPOSIT_NUMBER=66193424
```

### 3. Sécurité

#### Clés API
- Ne jamais exposer les clés API dans le code client
- Utiliser un backend Node.js pour les appels API
- Stocker les clés dans les variables d'environnement

#### Validation
- Limiter les tentatives OTP à 3 par session
- Expirer les codes après 10 minutes
- Logger toutes les tentatives pour audit

### 4. Intégration Orange Money/Mobicash

Pour une vraie intégration de paiement:

#### Orange Money API
```javascript
const orangeMoneyPayment = async (amount, phoneNumber) => {
  // API Orange Money Burkina Faso
  const response = await fetch('https://api.orange.com/orange-money-webpay/dev/v1/webpayment', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_ORANGE_MONEY_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchant_key: 'YOUR_MERCHANT_KEY',
      amount: amount,
      currency: 'XOF',
      order_id: generateOrderId(),
      description: 'Faso Quiz Premium',
      return_url: 'https://yourapp.com/payment/return',
      cancel_url: 'https://yourapp.com/payment/cancel',
      notif_url: 'https://yourapp.com/payment/notif',
      lang: 'fr',
      customer_phone: `+226${phoneNumber}`
    }),
  });
  
  return response.json();
};
```

#### Moov Money API
```javascript
const moovMoneyPayment = async (amount, phoneNumber) => {
  // API Moov Money Burkina Faso
  const response = await fetch('https://api.moov.bj/moov-money/payment', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_MOOV_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchantId: 'YOUR_MERCHANT_ID',
      amount: amount,
      currency: 'XOF',
      transactionId: generateTransactionId(),
      customerNumber: phoneNumber,
      description: 'Faso Quiz Premium'
    }),
  });
  
  return response.json();
};
```

### 5. Déploiement Production

#### Étapes:
1. **Configurer les variables d'environnement**
2. **Activer le mode production** (`__DEV__` = false)
3. **Tester avec vrais numéros**
4. **Monitorer les logs SMS**
5. **Configurer le monitoring des paiements**

#### Sécurité additionnelle:
- Rate limiting sur les envois SMS
- Validation des numéros burkinabè
- Backup des transactions
- Notifications admin pour les échecs

### 6. Support Client

#### Informations à afficher:
- Numéro de support: +226 XX XX XX XX
- Email support: support@Fasoquiz.com
- Heures de support: 8h-20h (Lundi-Vendredi)

#### Gestion des litiges:
- Log complet des transactions
- Preuve d'envoi SMS
- Historique des tentatives
- Remboursement automatique en cas d'échec

## 🚀 Checklist Production

- [ ] Configurer API SMS (Twilio/Orange)
- [ ] Ajouter variables d'environnement
- [ ] Tester avec vrais numéros
- [ ] Configurer monitoring
- [ ] Préparer documentation support
- [ ] Tester processus complet
- [ ] Déployer en production
- [ ] Monitorer premiers paiements

## 📞 Contact Dépôt

**Numéro de dépôt officiel**: `66 19 34 24`
- Disponible 24/7
- Support Orange Money et Moov Money
- Confirmation automatique par SMS
