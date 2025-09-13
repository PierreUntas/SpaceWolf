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
    if (score <= 2) return 'text-[#fcd6c5]';
    if (score <= 3) return 'text-[#eeddde]';
    return 'text-[#d8d0f3]';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Faible';
    if (score <= 3) return 'Moyen';
    return 'Fort';
  };

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4 lg:p-8 bg-[#d8d0f3]/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#eeddde]/20 overflow-x-hidden">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#59507b] to-[#d8d0f3] rounded-2xl mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#59507b] to-[#d8d0f3] bg-clip-text text-transparent">
          Portefeuille Sécurisé
        </h2>
        <p className="text-[#59507b] mt-2">Gérez vos wallets de manière sécurisée</p>
      </div>
      
      {/* Navigation des modes */}
      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 mb-6 sm:mb-8 bg-[#eeddde] rounded-xl p-1">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 px-3 sm:px-4 py-3 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            mode === 'create' 
              ? 'bg-[#fcd6c5] text-[#59507b] shadow-sm' 
              : 'text-[#59507b] hover:text-[#59507b] hover:bg-[#fcd6c5]/50'
          }`}
        >
          Créer
        </button>
        <button
          onClick={() => setMode('import')}
          className={`flex-1 px-3 sm:px-4 py-3 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            mode === 'import' 
              ? 'bg-[#fcd6c5] text-[#59507b] shadow-sm' 
              : 'text-[#59507b] hover:text-[#59507b] hover:bg-[#fcd6c5]/50'
          }`}
        >
          Importer
        </button>
        <button
          onClick={() => setMode('restore')}
          className={`flex-1 px-3 sm:px-4 py-3 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            mode === 'restore' 
              ? 'bg-[#fcd6c5] text-[#59507b] shadow-sm' 
              : 'text-[#59507b] hover:text-[#59507b] hover:bg-[#fcd6c5]/50'
          }`}
        >
          Restaurer
        </button>
        <button
          onClick={() => setMode('login')}
          className={`flex-1 px-3 sm:px-4 py-3 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            mode === 'login' 
              ? 'bg-[#fcd6c5] text-[#59507b] shadow-sm' 
              : 'text-[#59507b] hover:text-[#59507b] hover:bg-[#fcd6c5]/50'
          }`}
        >
          Connexion
        </button>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-[#fcd6c5] border-l-4 border-[#59507b] p-4 rounded-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#59507b]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-[#59507b]">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-[#d8d0f3] border-l-4 border-[#59507b] p-4 rounded-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#59507b]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-[#59507b]">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Création */}
      {mode === 'create' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">Créer un nouveau portefeuille</h3>
            <p className="text-[#59507b] text-sm">Générez un nouveau wallet avec une phrase de récupération sécurisée</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Mot de passe sécurisé"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-[#59507b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {password && (
                <div className="mt-3 p-3 bg-[#eeddde] rounded-lg">
                  <div className={`text-sm font-medium ${getPasswordStrengthColor(passwordValidation.score)}`}>
                    Force: {getPasswordStrengthText(passwordValidation.score)}
                  </div>
                  <div className="mt-2 space-y-1">
                    {passwordValidation.feedback.map((feedback, index) => (
                      <div key={index} className="text-xs text-[#59507b] flex items-center">
                        <div className="w-1 h-1 bg-[#59507b] rounded-full mr-2"></div>
                        {feedback}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Confirmer le mot de passe"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-[#59507b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreateWallet}
              disabled={loading || !passwordValidation.isValid}
              className="w-full bg-gradient-to-r from-[#59507b] to-[#d8d0f3] text-white py-3 px-4 sm:px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#59507b] hover:to-[#d8d0f3] transition-all duration-200 transform hover:scale-[1.02] text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création...
                </div>
              ) : (
                'Créer le portefeuille'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode Importation */}
      {mode === 'import' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">Importer un portefeuille existant</h3>
            <p className="text-[#59507b] text-sm">Importez votre wallet avec une clé privée</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Clé privée</label>
              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 resize-none text-base"
                rows={3}
                placeholder="0x..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Mot de passe pour chiffrer"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-[#59507b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleImportWallet}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#fcd6c5] to-[#eeddde] text-white py-3 px-4 sm:px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#fcd6c5] hover:to-[#eeddde] transition-all duration-200 transform hover:scale-[1.02] text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importation...
                </div>
              ) : (
                'Importer le portefeuille'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode Restauration */}
      {mode === 'restore' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">Restaurer avec phrase mnémonique</h3>
            <p className="text-[#59507b] text-sm">Récupérez votre wallet avec votre phrase de récupération</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Phrase mnémonique</label>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 resize-none text-base"
                rows={3}
                placeholder="word1 word2 word3..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Mot de passe pour chiffrer"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-[#59507b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleRestoreWallet}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d8d0f3] to-[#fcd6c5] text-white py-3 px-4 sm:px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#d8d0f3] hover:to-[#fcd6c5] transition-all duration-200 transform hover:scale-[1.02] text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Restauration...
                </div>
              ) : (
                'Restaurer le portefeuille'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode Connexion */}
      {mode === 'login' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">Se connecter</h3>
            <p className="text-[#59507b] text-sm">Accédez à votre wallet sauvegardé</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Portefeuille sauvegardé</label>
              <div className="relative">
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 appearance-none bg-[#fbf8f2]"
                >
                  <option value="">Sélectionner un portefeuille</option>
                  {savedWallets.map((address) => (
                    <option key={address} value={address}>
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#59507b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Mot de passe du portefeuille"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-[#59507b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#59507b] to-[#d8d0f3] text-white py-3 px-4 sm:px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#59507b] hover:to-[#d8d0f3] transition-all duration-200 transform hover:scale-[1.02] text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Affichage de la phrase mnémonique générée */}
      {showMnemonic && generatedMnemonic && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-[#fcd6c5] to-[#eeddde] border border-[#fcd6c5] rounded-2xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-[#59507b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-base sm:text-lg font-semibold text-[#59507b] mb-2">Phrase de récupération</h4>
              <p className="text-sm text-[#59507b] mb-4">
                Sauvegardez cette phrase dans un endroit sûr. Elle vous permettra de récupérer votre portefeuille.
              </p>
              <div className="bg-[#fbf8f2] p-3 sm:p-4 rounded-xl border border-[#fcd6c5] font-mono text-xs sm:text-sm text-[#59507b] break-all">
                {generatedMnemonic}
              </div>
              <button
                onClick={() => setShowMnemonic(false)}
                className="mt-4 bg-gradient-to-r from-[#59507b] to-[#d8d0f3] text-white px-4 sm:px-6 py-2 rounded-xl font-medium hover:from-[#59507b] hover:to-[#d8d0f3] transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
              >
                J'ai sauvegardé la phrase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton de déconnexion */}
      {secureWalletManager.isSessionActive() && (
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#eeddde]">
          <button
            onClick={handleLogout}
              className="w-full bg-gradient-to-r from-[#59507b] to-[#fcd6c5] text-white py-3 px-4 sm:px-6 rounded-xl font-medium hover:from-[#59507b] hover:to-[#fcd6c5] transition-all duration-200 transform hover:scale-[1.02] text-base"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
