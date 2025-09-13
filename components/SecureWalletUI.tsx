"use client";

import React, { useState, useEffect } from 'react';
import { secureWalletManager } from '../lib/secureWallet';
import { ethers } from 'ethers';

interface SecureWalletUIProps {
  onWalletConnected: (wallet: ethers.Wallet) => void;
  onWalletDisconnected: () => void;
}

export default function SecureWalletUI({ onWalletConnected, onWalletDisconnected }: SecureWalletUIProps) {
  // États pour l'interface
  const [mode, setMode] = useState<'create' | 'import' | 'restore' | 'login'>('create');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour la validation
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; score: number; feedback: string[] }>({ isValid: false, score: 0, feedback: [] });
  const [savedWallets, setSavedWallets] = useState<string[]>([]);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');

  // Initialiser la base de données et charger les wallets
  useEffect(() => {
    initializeSecureWallet();
  }, []);

  // Valider le mot de passe en temps réel
  useEffect(() => {
    if (password) {
      const validation = secureWalletManager.validatePassword(password);
      setPasswordValidation(validation);
    }
  }, [password]);

  const initializeSecureWallet = async () => {
    try {
      await secureWalletManager.initializeDB();
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
    } catch (err) {
      setError('Erreur d\'initialisation: ' + (err as Error).message);
    }
  };

  const handleCreateWallet = async () => {
    if (!password || password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletData = await secureWalletManager.createSecureWallet(password);
      
      setGeneratedMnemonic(walletData.mnemonic || '');
      setShowMnemonic(true);
      setSuccess('Wallet créé avec succès !');
      
      // Charger la liste des wallets
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
      
    } catch (err) {
      setError('Erreur de création: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!privateKey.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Valider la clé privée
      const wallet = new ethers.Wallet(privateKey.trim());
      
      // Sauvegarder le wallet
      await secureWalletManager.saveSecureWallet({
        privateKey: wallet.privateKey,
        address: wallet.address
      }, password);
      
      setSuccess('Wallet importé avec succès !');
      
      // Charger la liste des wallets
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
      
    } catch (err) {
      setError('Erreur d\'importation: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreWallet = async () => {
    if (!mnemonic.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletData = await secureWalletManager.restoreFromMnemonic(mnemonic.trim(), password);
      setSuccess('Wallet restauré avec succès !');
      
      // Charger la liste des wallets
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
      
    } catch (err) {
      setError('Erreur de restauration: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!selectedAddress || !password) {
      setError('Veuillez sélectionner un wallet et entrer le mot de passe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletData = await secureWalletManager.loadSecureWallet(selectedAddress, password);
      const wallet = new ethers.Wallet(walletData.privateKey);
      
      onWalletConnected(wallet);
      setSuccess('Connexion réussie !');
      
    } catch (err) {
      setError('Erreur de connexion: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    secureWalletManager.logout();
    onWalletDisconnected();
    setSuccess('Déconnexion réussie');
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'text-red-500';
    if (score <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Faible';
    if (score <= 3) return 'Moyen';
    return 'Fort';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🔐 Portefeuille Sécurisé</h2>
      
      {/* Navigation des modes */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setMode('create')}
          className={`px-4 py-2 rounded ${mode === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Créer
        </button>
        <button
          onClick={() => setMode('import')}
          className={`px-4 py-2 rounded ${mode === 'import' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Importer
        </button>
        <button
          onClick={() => setMode('restore')}
          className={`px-4 py-2 rounded ${mode === 'restore' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Restaurer
        </button>
        <button
          onClick={() => setMode('login')}
          className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Connexion
        </button>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Mode Création */}
      {mode === 'create' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Créer un nouveau portefeuille</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Mot de passe sécurisé"
            />
            {password && (
              <div className="mt-2">
                <div className={`text-sm font-medium ${getPasswordStrengthColor(passwordValidation.score)}`}>
                  Force: {getPasswordStrengthText(passwordValidation.score)}
                </div>
                {passwordValidation.feedback.map((feedback, index) => (
                  <div key={index} className="text-xs text-gray-600">• {feedback}</div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Confirmer le mot de passe"
            />
          </div>
          
          <button
            onClick={handleCreateWallet}
            disabled={loading || !passwordValidation.isValid}
            className="w-full bg-blue-500 text-white py-3 rounded-lg disabled:bg-gray-300"
          >
            {loading ? 'Création...' : 'Créer le portefeuille'}
          </button>
        </div>
      )}

      {/* Mode Importation */}
      {mode === 'import' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Importer un portefeuille existant</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Clé privée</label>
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full p-3 border rounded-lg h-20"
              placeholder="0x..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Mot de passe pour chiffrer"
            />
          </div>
          
          <button
            onClick={handleImportWallet}
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-lg disabled:bg-gray-300"
          >
            {loading ? 'Importation...' : 'Importer le portefeuille'}
          </button>
        </div>
      )}

      {/* Mode Restauration */}
      {mode === 'restore' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Restaurer avec phrase mnémonique</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Phrase mnémonique</label>
            <textarea
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              className="w-full p-3 border rounded-lg h-20"
              placeholder="word1 word2 word3..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Mot de passe pour chiffrer"
            />
          </div>
          
          <button
            onClick={handleRestoreWallet}
            disabled={loading}
            className="w-full bg-purple-500 text-white py-3 rounded-lg disabled:bg-gray-300"
          >
            {loading ? 'Restauration...' : 'Restaurer le portefeuille'}
          </button>
        </div>
      )}

      {/* Mode Connexion */}
      {mode === 'login' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Se connecter</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Portefeuille sauvegardé</label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Sélectionner un portefeuille</option>
              {savedWallets.map((address) => (
                <option key={address} value={address}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Mot de passe du portefeuille"
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg disabled:bg-gray-300"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      )}

      {/* Affichage de la phrase mnémonique générée */}
      {showMnemonic && generatedMnemonic && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Phrase de récupération</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Sauvegardez cette phrase dans un endroit sûr. Elle vous permettra de récupérer votre portefeuille.
          </p>
          <div className="bg-white p-3 rounded border font-mono text-sm">
            {generatedMnemonic}
          </div>
          <button
            onClick={() => setShowMnemonic(false)}
            className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded"
          >
            J'ai sauvegardé la phrase
          </button>
        </div>
      )}

      {/* Bouton de déconnexion */}
      {secureWalletManager.isSessionActive() && (
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded-lg"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
