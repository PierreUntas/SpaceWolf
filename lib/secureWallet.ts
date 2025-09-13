import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// Types pour la sécurité
interface SecureWalletData {
  encryptedPrivateKey: string;
  address: string;
  mnemonic?: string; // Optionnel, pour la récupération
  createdAt: number;
  lastUsed: number;
}

interface WalletCredentials {
  privateKey: string;
  address: string;
  mnemonic?: string;
}

// Configuration de sécurité
const SECURITY_CONFIG = {
  encryptionKey: 'SpaceWolf-Secure-2024', // En production, générer dynamiquement
  dbName: 'SpaceWolfSecureWallet',
  dbVersion: 1,
  storeName: 'wallets',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
};

/**
 * Gestionnaire de portefeuille sécurisé inspiré de MetaMask
 */
export class SecureWalletManager {
  private db: IDBDatabase | null = null;
  private currentWallet: ethers.Wallet | null = null;
  private sessionExpiry: number = 0;

  /**
   * Initialiser la base de données IndexedDB
   */
  async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SECURITY_CONFIG.dbName, SECURITY_CONFIG.dbVersion);
      
      request.onerror = () => reject(new Error('Erreur d\'ouverture de la base de données'));
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SECURITY_CONFIG.storeName)) {
          db.createObjectStore(SECURITY_CONFIG.storeName, { keyPath: 'address' });
        }
      };
    });
  }

  /**
   * Générer une phrase mnémonique sécurisée (BIP39)
   */
  generateMnemonic(): string {
    return ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16));
  }

  /**
   * Créer un wallet à partir d'une phrase mnémonique
   */
  createWalletFromMnemonic(mnemonic: string, password?: string): WalletCredentials {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return {
      privateKey: wallet.privateKey,
      address: wallet.address,
      mnemonic: password ? this.encryptMnemonic(mnemonic, password) : mnemonic
    };
  }

  /**
   * Créer un nouveau wallet sécurisé
   */
  async createSecureWallet(password: string): Promise<WalletCredentials> {
    const mnemonic = this.generateMnemonic();
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    
    const walletData: WalletCredentials = {
      privateKey: wallet.privateKey,
      address: wallet.address,
      mnemonic: mnemonic // Stocker en clair pour la première fois
    };

    await this.saveSecureWallet(walletData, password);
    return walletData;
  }

  /**
   * Chiffrer une clé privée avec AES-256
   */
  private encryptPrivateKey(privateKey: string, password: string): string {
    const salt = CryptoJS.lib.WordArray.random(256/8);
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    const iv = CryptoJS.lib.WordArray.random(128/8);
    const encrypted = CryptoJS.AES.encrypt(privateKey, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return salt.toString() + iv.toString() + encrypted.toString();
  }

  /**
   * Déchiffrer une clé privée
   */
  private decryptPrivateKey(encryptedData: string, password: string): string {
    const salt = CryptoJS.enc.Hex.parse(encryptedData.substr(0, 64));
    const iv = CryptoJS.enc.Hex.parse(encryptedData.substr(64, 32));
    const encrypted = encryptedData.substring(96);
    
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Chiffrer une phrase mnémonique
   */
  private encryptMnemonic(mnemonic: string, password: string): string {
    return this.encryptPrivateKey(mnemonic, password);
  }

  /**
   * Déchiffrer une phrase mnémonique
   */
  private decryptMnemonic(encryptedMnemonic: string, password: string): string {
    return this.decryptPrivateKey(encryptedMnemonic, password);
  }

  /**
   * Sauvegarder un wallet de manière sécurisée
   */
  async saveSecureWallet(walletData: WalletCredentials, password: string): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    const encryptedData: SecureWalletData = {
      encryptedPrivateKey: this.encryptPrivateKey(walletData.privateKey, password),
      address: walletData.address,
      mnemonic: walletData.mnemonic ? this.encryptMnemonic(walletData.mnemonic, password) : undefined,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SECURITY_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(SECURITY_CONFIG.storeName);
      const request = store.put(encryptedData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Erreur de sauvegarde'));
    });
  }

  /**
   * Charger un wallet sécurisé
   */
  async loadSecureWallet(address: string, password: string): Promise<WalletCredentials> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SECURITY_CONFIG.storeName], 'readonly');
      const store = transaction.objectStore(SECURITY_CONFIG.storeName);
      const request = store.get(address);

      request.onsuccess = () => {
        const encryptedData: SecureWalletData = request.result;
        
        if (!encryptedData) {
          reject(new Error('Wallet non trouvé'));
          return;
        }

        try {
          const privateKey = this.decryptPrivateKey(encryptedData.encryptedPrivateKey, password);
          const wallet = new ethers.Wallet(privateKey);
          
          // Mettre à jour la session
          this.currentWallet = wallet;
          this.sessionExpiry = Date.now() + SECURITY_CONFIG.sessionTimeout;
          
          resolve({
            privateKey,
            address: wallet.address,
            mnemonic: encryptedData.mnemonic ? this.decryptMnemonic(encryptedData.mnemonic, password) : undefined
          });
        } catch (error) {
          reject(new Error('Mot de passe incorrect'));
        }
      };

      request.onerror = () => reject(new Error('Erreur de chargement'));
    });
  }

  /**
   * Vérifier si une session est active
   */
  isSessionActive(): boolean {
    return this.currentWallet !== null && Date.now() < this.sessionExpiry;
  }

  /**
   * Obtenir le wallet actuel (si session active)
   */
  getCurrentWallet(): ethers.Wallet | null {
    if (this.isSessionActive()) {
      return this.currentWallet;
    }
    return null;
  }

  /**
   * Fermer la session
   */
  logout(): void {
    this.currentWallet = null;
    this.sessionExpiry = 0;
  }

  /**
   * Lister tous les wallets sauvegardés
   */
  async listSavedWallets(): Promise<string[]> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SECURITY_CONFIG.storeName], 'readonly');
      const store = transaction.objectStore(SECURITY_CONFIG.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const wallets = request.result.map((wallet: SecureWalletData) => wallet.address);
        resolve(wallets);
      };

      request.onerror = () => reject(new Error('Erreur de récupération'));
    });
  }

  /**
   * Supprimer un wallet sauvegardé
   */
  async deleteWallet(address: string): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SECURITY_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(SECURITY_CONFIG.storeName);
      const request = store.delete(address);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Erreur de suppression'));
    });
  }

  /**
   * Restaurer un wallet à partir d'une phrase mnémonique
   */
  async restoreFromMnemonic(mnemonic: string, password: string): Promise<WalletCredentials> {
    const walletData = this.createWalletFromMnemonic(mnemonic, password);
    await this.saveSecureWallet(walletData, password);
    return walletData;
  }

  /**
   * Valider la force d'un mot de passe
   */
  validatePassword(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Le mot de passe doit contenir au moins 8 caractères');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Ajoutez des majuscules');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Ajoutez des minuscules');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Ajoutez des chiffres');
    } else {
      score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Ajoutez des caractères spéciaux');
    } else {
      score += 1;
    }

    return {
      isValid: score >= 3,
      score,
      feedback
    };
  }
}

// Instance singleton
export const secureWalletManager = new SecureWalletManager();
