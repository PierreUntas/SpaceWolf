# 🔐 Système de Portefeuille Sécurisé - SpaceWolf Journey

## Vue d'ensemble

Le système de portefeuille sécurisé de SpaceWolf Journey s'inspire de l'architecture de MetaMask pour offrir une sécurité maximale avec une expérience utilisateur intuitive. Il utilise exclusivement le mode sécurisé avec chiffrement AES-256 et stockage IndexedDB.

## 🛡️ Fonctionnalités de Sécurité

### 1. **Chiffrement AES-256**
```typescript
// Chiffrement avec PBKDF2 et salt aléatoire
const encryptPrivateKey = (privateKey: string, password: string) => {
  const salt = CryptoJS.lib.WordArray.random(256/8);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  // ... chiffrement AES-256-CBC
};
```

### 2. **Stockage Sécurisé IndexedDB**
- Remplace le localStorage vulnérable
- Stockage chiffré des clés privées
- Isolation des données par domaine

### 3. **Phrases Mnémoniques BIP39**
```typescript
// Génération de phrase mnémonique sécurisée
const generateMnemonic = () => {
  return ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16));
};
```

### 4. **Sessions Temporaires**
- Auto-logout après 30 minutes d'inactivité
- Pas de stockage permanent des clés en mémoire
- Validation de session à chaque opération

### 5. **Validation de Mot de Passe**
- Minimum 8 caractères
- Majuscules, minuscules, chiffres, caractères spéciaux
- Score de sécurité en temps réel

## 🏗️ Architecture Technique

### **SecureWalletManager Class**
```typescript
class SecureWalletManager {
  // Gestion de la base de données IndexedDB
  async initializeDB(): Promise<void>
  
  // Génération et gestion des wallets
  generateMnemonic(): string
  createWalletFromMnemonic(mnemonic: string): WalletCredentials
  createSecureWallet(password: string): Promise<WalletCredentials>
  
  // Chiffrement/Déchiffrement
  private encryptPrivateKey(privateKey: string, password: string): string
  private decryptPrivateKey(encryptedData: string, password: string): string
  
  // Stockage sécurisé
  async saveSecureWallet(walletData: WalletCredentials, password: string): Promise<void>
  async loadSecureWallet(address: string, password: string): Promise<WalletCredentials>
  
  // Gestion des sessions
  isSessionActive(): boolean
  getCurrentWallet(): ethers.Wallet | null
  logout(): void
}
```

### **Interface Utilisateur**
```typescript
interface SecureWalletUIProps {
  onWalletConnected: (wallet: ethers.Wallet) => void;
  onWalletDisconnected: () => void;
}
```

## 🚀 Utilisation

### **1. Créer un Nouveau Portefeuille Sécurisé**
```typescript
const walletData = await secureWalletManager.createSecureWallet(password);
// Génère automatiquement une phrase mnémonique
// Chiffre et sauvegarde la clé privée
```

### **2. Importer un Portefeuille Existant**
```typescript
const wallet = new ethers.Wallet(privateKey);
await secureWalletManager.saveSecureWallet({
  privateKey: wallet.privateKey,
  address: wallet.address
}, password);
```

### **3. Restaurer avec Phrase Mnémonique**
```typescript
const walletData = await secureWalletManager.restoreFromMnemonic(mnemonic, password);
// Déchiffre la phrase mnémonique
// Recrée le wallet et sauvegarde
```

### **4. Se Connecter**
```typescript
const walletData = await secureWalletManager.loadSecureWallet(address, password);
const wallet = new ethers.Wallet(walletData.privateKey);
// Déchiffre la clé privée
// Crée une session temporaire
```

## 🔒 Comparaison avec MetaMask

| Fonctionnalité | MetaMask | SpaceWolf Sécurisé |
|---|---|---|
| **Chiffrement** | AES-256 | AES-256 |
| **Stockage** | IndexedDB | IndexedDB |
| **Phrases Mnémoniques** | BIP39 | BIP39 |
| **Sessions** | Extension persistante | 30 min timeout |
| **Multi-réseaux** | ✅ | ✅ |
| **Hardware Wallets** | ✅ | 🔄 (À venir) |
| **DApp Integration** | ✅ | ✅ |

## 🛠️ Installation et Configuration

### **1. Dépendances**
```bash
npm install crypto-js @types/crypto-js
```

### **2. Import**
```typescript
import { secureWalletManager } from '../lib/secureWallet';
import SecureWalletUI from '../components/SecureWalletUI';
```

### **3. Utilisation dans React**
```tsx
<SecureWalletUI
  onWalletConnected={handleSecureWalletConnected}
  onWalletDisconnected={handleSecureWalletDisconnected}
/>
```

## 🔧 Configuration Avancée

### **Paramètres de Sécurité**
```typescript
const SECURITY_CONFIG = {
  encryptionKey: 'SpaceWolf-Secure-2024',
  dbName: 'SpaceWolfSecureWallet',
  dbVersion: 1,
  storeName: 'wallets',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
};
```

### **Personnalisation du Chiffrement**
```typescript
// Modifier les paramètres PBKDF2
const key = CryptoJS.PBKDF2(password, salt, {
  keySize: 256/32,        // 256 bits
  iterations: 10000       // 10,000 itérations
});
```

## 🚨 Bonnes Pratiques de Sécurité

### **1. Mots de Passe**
- Minimum 12 caractères recommandé
- Utiliser un gestionnaire de mots de passe
- Éviter les mots de passe réutilisés

### **2. Phrases Mnémoniques**
- Sauvegarder hors ligne (papier, métal)
- Ne jamais partager ou photographier
- Vérifier l'orthographe des mots

### **3. Sessions**
- Se déconnecter après utilisation
- Ne pas laisser la session ouverte
- Utiliser sur des appareils de confiance

### **4. Sauvegarde**
- Tester la restauration régulièrement
- Garder plusieurs copies sécurisées
- Mettre à jour les sauvegardes

## 🔮 Évolutions Futures

### **Phase 1 - Actuelle**
- ✅ Chiffrement AES-256
- ✅ IndexedDB sécurisé
- ✅ Phrases mnémoniques BIP39
- ✅ Sessions temporaires

### **Phase 2 - À Venir**
- 🔄 Support hardware wallets (Ledger/Trezor)
- 🔄 Multi-signature (MultiSig)
- 🔄 WebAuthn/Passkeys
- 🔄 WalletConnect v2

### **Phase 3 - Avancée**
- 🔄 Social recovery
- 🔄 Zero-knowledge proofs
- 🔄 Cross-chain support
- 🔄 Mobile app

## 📊 Métriques de Sécurité

### **Niveau de Sécurité**
- **SpaceWolf Sécurisé** : ⭐⭐⭐⭐ (4/5)
- **MetaMask** : ⭐⭐⭐⭐⭐ (5/5)

### **Facilité d'Utilisation**
- **SpaceWolf Sécurisé** : ⭐⭐⭐ (3/5)
- **MetaMask** : ⭐⭐⭐⭐ (4/5)

## 🎯 Recommandations

### **Pour les Débutants**
- Utiliser le système sécurisé par défaut
- Apprendre les concepts de sécurité Web3
- Sauvegarder les phrases mnémoniques

### **Pour les Utilisateurs Avancés**
- Utiliser le système sécurisé par défaut
- Sauvegarder les phrases mnémoniques
- Considérer les hardware wallets

### **Pour les Développeurs**
- Intégrer le système sécurisé
- Documenter les bonnes pratiques
- Tester la sécurité régulièrement

---

**Note** : Ce système offre une sécurité maximale inspirée des meilleures pratiques de MetaMask, avec chiffrement AES-256 et stockage sécurisé IndexedDB pour une expérience Web3 sécurisée.
