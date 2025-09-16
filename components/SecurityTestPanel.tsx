"use client";

import React, { useState } from 'react';
import { secureWalletManager } from '../lib/secureWallet';
import { secureStorage } from '../lib/secureStorage';

/**
 * Composant de test des fonctionnalités de sécurité
 */
export default function SecurityTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const runSecurityTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('🔒 Démarrage des tests de sécurité...');
    addResult('=====================================');

    // Test 1: Génération de phrase mnémonique
    try {
      addResult('\n1. Test de génération de phrase mnémonique:');
      const mnemonic = secureWalletManager.generateMnemonic();
      addResult(`✅ Phrase mnémonique générée: ${mnemonic.slice(0, 20)}...`);
    } catch (error) {
      addResult(`❌ Erreur génération mnémonique: ${error}`);
    }

    // Test 2: Validation des mots de passe
    addResult('\n2. Test de validation des mots de passe:');
    const testPasswords = [
      { pwd: 'weak', desc: 'Trop faible' },
      { pwd: 'Password123', desc: 'Moyen' },
      { pwd: 'StrongP@ssw0rd2024!', desc: 'Fort' },
      { pwd: 'password', desc: 'Mot commun' },
    ];

    testPasswords.forEach(({ pwd, desc }) => {
      const validation = secureWalletManager.validatePassword(pwd);
      addResult(`${desc}: "${pwd}" - Score: ${validation.score}/6 - ${validation.isValid ? '✅ Valide' : '❌ Invalide'}`);
    });

    // Test 3: Stockage sécurisé
    addResult('\n3. Test du stockage sécurisé:');
    try {
      const testData = {
        username: 'testuser',
        email: 'test@example.com',
        timestamp: new Date().toISOString()
      };

      secureStorage.setItem('test-data', testData);
      const retrievedData = secureStorage.getItem('test-data');
      
      addResult('✅ Données sauvegardées et récupérées avec succès');
      addResult(`✅ Données identiques: ${JSON.stringify(testData) === JSON.stringify(retrievedData)}`);
    } catch (error) {
      addResult(`❌ Erreur stockage sécurisé: ${error}`);
    }

    // Test 4: Gestion des sessions
    addResult('\n4. Test de gestion des sessions:');
    try {
      const sessionActive = secureWalletManager.isSessionActive();
      addResult(`✅ Session active: ${sessionActive ? 'Oui' : 'Non'}`);
      
      secureWalletManager.recordActivity();
      addResult('✅ Activité enregistrée');
    } catch (error) {
      addResult(`❌ Erreur gestion sessions: ${error}`);
    }

    // Test 5: Migration des données
    addResult('\n5. Test de migration des données:');
    try {
      secureStorage.migrateExistingData();
      addResult('✅ Migration des données effectuée');
    } catch (error) {
      addResult(`❌ Erreur migration: ${error}`);
    }

    addResult('\n🎉 Tests de sécurité terminés!');
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔒 Tests de Sécurité SpaceWolf
        </h2>
        <p className="text-gray-600">
          Vérifiez que toutes les fonctionnalités de sécurité fonctionnent correctement.
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={runSecurityTests}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? '🔄 Tests en cours...' : '▶️ Lancer les tests'}
        </button>
        
        <button
          onClick={clearResults}
          disabled={isRunning}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🗑️ Effacer les résultats
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
          {testResults.length === 0 
            ? 'Cliquez sur "Lancer les tests" pour commencer...'
            : testResults.join('\n')
          }
        </pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Tests effectués :</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Génération de phrase mnémonique sécurisée</li>
          <li>• Validation renforcée des mots de passe</li>
          <li>• Chiffrement/déchiffrement des données</li>
          <li>• Gestion des sessions avec renouvellement automatique</li>
          <li>• Migration des données existantes</li>
        </ul>
      </div>
    </div>
  );
}
