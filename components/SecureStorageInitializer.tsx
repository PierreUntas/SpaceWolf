"use client";

import { useEffect } from 'react';
import { secureStorage } from '../lib/secureStorage';

/**
 * Composant pour initialiser le stockage sécurisé et migrer les données existantes
 */
export default function SecureStorageInitializer() {
  useEffect(() => {
    // Migrer les données existantes vers le stockage sécurisé
    secureStorage.migrateExistingData();
    
    // Log pour le développement (à supprimer en production)
    console.log('[SECURITY] Stockage sécurisé initialisé et données migrées');
  }, []);

  return null; // Ce composant ne rend rien
}
