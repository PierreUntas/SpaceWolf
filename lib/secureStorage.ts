import CryptoJS from 'crypto-js';

/**
 * Utilitaire pour le stockage sécurisé des données sensibles
 */
export class SecureStorage {
  private static readonly STORAGE_PREFIX = 'spacewolf_secure_';
  private static readonly ENCRYPTION_KEY = 'SpaceWolf-User-Data-2024'; // Clé temporaire, à remplacer par une clé utilisateur

  /**
   * Chiffrer des données avant stockage
   */
  private static encrypt(data: unknown): string {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, this.ENCRYPTION_KEY).toString();
    return encrypted;
  }

  /**
   * Déchiffrer des données après récupération
   */
  private static decrypt(encryptedData: string): unknown {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return null;
    }
  }

  /**
   * Sauvegarder des données de manière sécurisée
   */
  static setItem(key: string, data: unknown): void {
    try {
      const encryptedData = this.encrypt(data);
      localStorage.setItem(this.STORAGE_PREFIX + key, encryptedData);
    } catch (error) {
      console.error('Erreur de sauvegarde sécurisée:', error);
    }
  }

  /**
   * Récupérer des données de manière sécurisée
   */
  static getItem(key: string): unknown {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!encryptedData) return null;
      
      return this.decrypt(encryptedData);
    } catch (error) {
      console.error('Erreur de récupération sécurisée:', error);
      return null;
    }
  }

  /**
   * Supprimer des données sécurisées
   */
  static removeItem(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  /**
   * Vérifier si des données sécurisées existent
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(this.STORAGE_PREFIX + key) !== null;
  }

  /**
   * Nettoyer toutes les données sécurisées
   */
  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Migrer les données existantes vers le stockage sécurisé
   */
  static migrateExistingData(): void {
    const migrationKeys = [
      'spacewolf-profile-picture',
      'spacewolf-username-data',
      'spacewolf-transfer-transaction',
      'spacewolf-nft-metadata',
      'spacewolf-nft-transaction',
      'spacewolf-transfer-tx-hash',
      'spacewolf-username-tx-hash',
      'spacewolf-eth-purchase-data',
      'spacewolf-security-data',
      'spacewolf-defi-data',
      'spacewolf-l2-data',
      'spacewolf-nft-marketplace-data',
      'spacewolf-dao-governance-data',
      'spacewolf-web3-social-data',
      'spacewolf-web3-development-data',
      'spacewolf-trading-analytics-data',
      'spacewolf-gaming-metaverse-data'
    ];

    migrationKeys.forEach(key => {
      const existingData = localStorage.getItem(key);
      if (existingData) {
        try {
          const parsedData = JSON.parse(existingData);
          this.setItem(key.replace('spacewolf-', ''), parsedData);
          // Garder l'ancienne clé pour compatibilité temporaire
        } catch (error) {
          // Si ce n'est pas du JSON, sauvegarder tel quel
          this.setItem(key.replace('spacewolf-', ''), existingData);
        }
      }
    });
  }
}

// Instance singleton pour faciliter l'utilisation
export const secureStorage = SecureStorage;
