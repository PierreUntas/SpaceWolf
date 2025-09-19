"use client";

import React, { useState, useEffect, useRef } from 'react';
import { secureWalletManager } from '../lib/secureWallet';
import { ethers } from 'ethers';
import { useLanguage } from '../lib/LanguageContext';

interface SecureWalletUIProps {
  onWalletConnected: (wallet: ethers.Wallet) => void;
  onWalletDisconnected: () => void;
}

export default function SecureWalletUI({ onWalletConnected, onWalletDisconnected }: SecureWalletUIProps) {
  const { t } = useLanguage();
  
  // États pour l'interface
  const [mode, setMode] = useState<'create' | 'import' | 'restore' | 'login'>('login');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Références sécurisées pour les mots de passe
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  
  // États pour la validation
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; score: number; feedback: string[] }>({ isValid: false, score: 0, feedback: [] });
  const [savedWallets, setSavedWallets] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');

  // Initialiser la base de données et charger les wallets
  useEffect(() => {
    initializeSecureWallet();
  }, []);

  // Fonctions sécurisées pour gérer les mots de passe
  const getPasswordValue = () => passwordRef.current?.value || '';
  const getConfirmPasswordValue = () => confirmPasswordRef.current?.value || '';
  
  const clearPasswordFields = () => {
    if (passwordRef.current) passwordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    setPassword('');
    setConfirmPassword('');
  };

  // Valider le mot de passe en temps réel
  useEffect(() => {
    const currentPassword = getPasswordValue();
    if (currentPassword) {
      const validation = secureWalletManager.validatePassword(currentPassword);
      setPasswordValidation(validation);
    }
  }, [password]);

  const initializeSecureWallet = async () => {
    try {
      await secureWalletManager.initializeDB();
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
    } catch (err) {
      setError(t.initializationError + ': ' + (err as Error).message);
    }
  };

  const handleCreateWallet = async () => {
    const currentPassword = getPasswordValue();
    const currentConfirmPassword = getConfirmPasswordValue();
    
    if (!currentPassword || currentPassword !== currentConfirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    if (!passwordValidation.isValid) {
      setError(t.passwordCriteriaNotMet);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletData = await secureWalletManager.createSecureWallet(currentPassword);
      
      setGeneratedMnemonic(walletData.mnemonic || '');
      setShowMnemonic(true);
      setSuccess(t.walletCreatedSuccess);
      
      // Charger la liste des wallets
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
      
      // Effacer les champs de mot de passe après utilisation
      clearPasswordFields();
      
    } catch (err) {
      setError(t.creationError + ': ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    const currentPassword = getPasswordValue();
    
    if (!privateKey.trim() || !currentPassword) {
      setError(t.fillAllFields);
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
      }, currentPassword);
      
      setSuccess(t.walletImportedSuccess);
      
      // Charger la liste des wallets
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
      
      // Effacer les champs après utilisation
      clearPasswordFields();
      setPrivateKey('');
      
    } catch (err) {
      setError(t.importError + ': ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreWallet = async () => {
    const currentPassword = getPasswordValue();
    
    if (!mnemonic.trim() || !currentPassword) {
      setError(t.fillAllFields);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletData = await secureWalletManager.restoreFromMnemonic(mnemonic.trim(), currentPassword);
      setSuccess(t.walletRestoredSuccess);
      
      // Charger la liste des wallets
      const wallets = await secureWalletManager.listSavedWallets();
      setSavedWallets(wallets);
      
      // Effacer les champs après utilisation
      clearPasswordFields();
      setMnemonic('');
      
    } catch (err) {
      setError(t.restoreError + ': ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const currentPassword = getPasswordValue();
    
    if (!selectedAddress || !currentPassword) {
      setError(t.selectWalletAndPassword);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletData = await secureWalletManager.loadSecureWallet(selectedAddress, currentPassword);
      const wallet = new ethers.Wallet(walletData.privateKey);
      
      // Enregistrer l'activité pour le système de sessions
      secureWalletManager.recordActivity();
      
      onWalletConnected(wallet);
      setSuccess(t.loginSuccess);
      
      // Effacer le champ de mot de passe après utilisation
      clearPasswordFields();
      
    } catch (err) {
      setError(t.connectionError + ': ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    secureWalletManager.logout();
    onWalletDisconnected();
    setSuccess(t.logoutSuccess);
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'text-red-500';
    if (score <= 2) return 'text-orange-500';
    if (score <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return t.weak;
    if (score <= 3) return t.medium;
    return t.strong;
  };

  return (
    <div className="w-full max-w-md mx-auto p-2 sm:p-4 lg:p-8 rounded-2xl shadow-xl border overflow-x-hidden" 
         style={{ 
           backgroundColor: 'var(--theme-accent-2)', 
           borderColor: 'var(--theme-accent-2)',
           backdropFilter: 'blur(10px)'
         }}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
             style={{ 
               background: 'linear-gradient(135deg, var(--theme-secondary), var(--theme-primary))'
             }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent"
            style={{ 
              backgroundImage: 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))'
            }}>
          {t.secureWallet}
        </h2>
        <p className="mt-2" style={{ color: 'var(--theme-text)' }}>{t.secureWalletDescription}</p>
      </div>
      
      {/* Navigation des modes - Interface simplifiée */}
      <div className="mb-6 sm:mb-8">
        {/* Boutons principaux */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
          {/* Bouton Connexion - Principal */}
          <button
            onClick={() => setMode('login')}
            className={`flex-1 min-w-[140px] px-4 sm:px-6 py-4 sm:py-4 rounded-xl font-semibold transition-all duration-200 text-base sm:text-lg ${
              mode === 'login' 
                ? 'text-white shadow-lg transform scale-[1.02]' 
                : 'hover:text-white hover:shadow-md border-2'
            }`}
            style={mode === 'login' 
              ? { background: 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))' }
              : { 
                  color: 'var(--theme-secondary)', 
                  borderColor: 'var(--theme-secondary)',
                  background: 'transparent'
                }
            }
            onMouseEnter={(e) => {
              if (mode !== 'login') {
                e.currentTarget.style.background = 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'login') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            🔑 {t.login}
          </button>
          
          {/* Bouton Création - Secondaire */}
          <button
            onClick={() => setMode('create')}
            className={`flex-1 min-w-[140px] px-4 sm:px-6 py-4 sm:py-4 rounded-xl font-semibold transition-all duration-200 text-base sm:text-lg ${
              mode === 'create' 
                ? 'shadow-md' 
                : 'hover:border-2'
            }`}
            style={mode === 'create' 
              ? { 
                  background: 'linear-gradient(to right, var(--theme-accent), var(--theme-accent-2))',
                  color: 'var(--theme-text)'
                }
              : { 
                  color: 'var(--theme-text)', 
                  borderColor: 'var(--theme-accent)',
                  background: 'transparent'
                }
            }
            onMouseEnter={(e) => {
              if (mode !== 'create') {
                e.currentTarget.style.background = 'var(--theme-accent)';
                e.currentTarget.style.opacity = '0.7';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'create') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            ✨ {t.create}
          </button>
        </div>
        
        {/* Bouton pour révéler les options avancées */}
        <div className="text-center">
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-sm hover:underline transition-colors duration-200"
            style={{ color: 'var(--theme-text)', opacity: 0.7 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            {showAdvancedOptions ? 'Masquer les options avancées' : 'Options avancées (Import/Restore)'}
          </button>
        </div>
        
        {/* Options avancées - Masquées par défaut */}
        {showAdvancedOptions && (
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-accent-2)', opacity: 0.5 }}>
            <p className="text-xs mb-3 text-center" style={{ color: 'var(--theme-text)', opacity: 0.8 }}>
              Ces options sont destinées aux utilisateurs expérimentés qui comprennent les concepts de clé privée et de phrase mnémonique.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setMode('import')}
                className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm opacity-70 ${
                  mode === 'import' 
                    ? '' 
                    : 'hover:opacity-100'
                }`}
                style={mode === 'import' 
                  ? { 
                      backgroundColor: 'var(--theme-accent)', 
                      color: 'var(--theme-text)',
                      opacity: 0.5
                    }
                  : { 
                      color: 'var(--theme-text)', 
                      backgroundColor: 'transparent',
                      opacity: 0.7
                    }
                }
                onMouseEnter={(e) => {
                  if (mode !== 'import') {
                    e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
                    e.currentTarget.style.opacity = '0.3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== 'import') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
              >
                📥 {t.import}
              </button>
              <button
                onClick={() => setMode('restore')}
                className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm opacity-70 ${
                  mode === 'restore' 
                    ? '' 
                    : 'hover:opacity-100'
                }`}
                style={mode === 'restore' 
                  ? { 
                      backgroundColor: 'var(--theme-accent)', 
                      color: 'var(--theme-text)',
                      opacity: 0.5
                    }
                  : { 
                      color: 'var(--theme-text)', 
                      backgroundColor: 'transparent',
                      opacity: 0.7
                    }
                }
                onMouseEnter={(e) => {
                  if (mode !== 'restore') {
                    e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
                    e.currentTarget.style.opacity = '0.3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== 'restore') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
              >
                🔄 {t.restore}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="border-l-4 p-4 rounded-lg mb-6"
             style={{
               backgroundColor: 'var(--theme-accent)',
               borderLeftColor: 'var(--theme-secondary)'
             }}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" style={{ color: 'var(--theme-text)' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm" style={{ color: 'var(--theme-text)' }}>{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="border-l-4 p-4 rounded-lg mb-6"
             style={{
               backgroundColor: 'var(--theme-primary)',
               borderLeftColor: 'var(--theme-secondary)'
             }}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" style={{ color: 'var(--theme-text)' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm" style={{ color: 'var(--theme-text)' }}>{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Création */}
      {mode === 'create' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">{t.createNewWallet}</h3>
            <p className="text-[#59507b] text-sm">{t.createNewWalletDescription}</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">{t.password}</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder={t.securePassword}
                  autoComplete="new-password"
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
                    {t.passwordStrength}: {getPasswordStrengthText(passwordValidation.score)}
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
              <label className="block text-sm font-medium text-[#59507b] mb-2">{t.confirmPassword}</label>
              <div className="relative">
                <input
                  ref={confirmPasswordRef}
                  type="password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder={t.confirmSecurePassword}
                  autoComplete="new-password"
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
              className="w-full py-3 px-4 sm:px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] text-base text-white"
              style={{
                background: 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.creating}
                </div>
              ) : (
                t.createWallet
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode Importation */}
      {mode === 'import' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">{t.importExistingWallet}</h3>
            <p className="text-[#59507b] text-sm">{t.importExistingWalletDescription}</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">{t.privateKey}</label>
              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 resize-none text-base"
                rows={3}
                placeholder={t.enterPrivateKey}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder={t.passwordToEncrypt}
                  autoComplete="current-password"
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
                  {t.importing}
                </div>
              ) : (
                t.importWallet
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode Restauration */}
      {mode === 'restore' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">{t.restoreWithMnemonic}</h3>
            <p className="text-[#59507b] text-sm">{t.restoreWithMnemonicDescription}</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">{t.mnemonicPhrase}</label>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 resize-none text-base"
                rows={3}
                placeholder={t.enterMnemonicPhrase}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder={t.passwordToEncrypt}
                  autoComplete="current-password"
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
                  {t.restoring}
                </div>
              ) : (
                t.restoreWallet
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode Connexion */}
      {mode === 'login' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-[#59507b] mb-2">{t.connectToWallet}</h3>
            <p className="text-[#59507b] text-sm">{t.connectToWalletDescription}</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#59507b] mb-2">{t.savedWallet}</label>
              <div className="relative">
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 appearance-none bg-[#fbf8f2]"
                >
                  <option value="">{t.selectWallet}</option>
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
                  ref={passwordRef}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-[#eeddde] rounded-xl focus:ring-2 focus:ring-[#59507b] focus:border-transparent transition-all duration-200 text-base"
                  placeholder={t.walletPassword}
                  autoComplete="current-password"
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
              className="w-full py-3 px-4 sm:px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] text-base text-white"
              style={{
                background: 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.connecting}
                </div>
              ) : (
                t.connect
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
              <h4 className="text-base sm:text-lg font-semibold text-[#59507b] mb-2">{t.recoveryPhrase}</h4>
              <p className="text-sm text-[#59507b] mb-4">
                {t.recoveryPhraseDescription}
              </p>
              <div className="bg-[#fbf8f2] p-3 sm:p-4 rounded-xl border border-[#fcd6c5] font-mono text-xs sm:text-sm text-[#59507b] break-all">
                {generatedMnemonic}
              </div>
              <button
                onClick={() => setShowMnemonic(false)}
                className="mt-4 px-4 sm:px-6 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base text-white"
                style={{
                  background: 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))'
                }}
              >
                {t.savePhraseSecurely}
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
            t.logout
          </button>
        </div>
      )}
    </div>
  );
}
