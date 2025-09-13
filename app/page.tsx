"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { createHelia, Helia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { ethers } from 'ethers';
import SecureWalletUI from '../components/SecureWalletUI';

export default function Home() {
  const router = useRouter();
  
  // États principaux du wallet
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | ethers.Wallet | null>(null);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [network, setNetwork] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  
  // États pour le système sécurisé
  
  // États pour l'interface
  const [account, setAccount] = useState<string | null>(null);
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  
  // États pour le système de jeu
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [gameStats, setGameStats] = useState({
    transactionsCompleted: 0,
    nftsMinted: 0,
    ethTransferred: 0,
    networksSwitched: 0,
    daysActive: 1
  });
  
  // États pour le token SW (SpaceWolf)
  const [swBalance, setSwBalance] = useState<number>(0);
  const [swClaimed, setSwClaimed] = useState<number>(0);
  const [showClaimAnimation, setShowClaimAnimation] = useState<boolean>(false);
  const [swClaimedAmount, setSwClaimedAmount] = useState<number>(0);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageIpfsCid, setImageIpfsCid] = useState<string | null>(null);
  const [metadataIpfsCid, setMetadataIpfsCid] = useState<string | null>(null);
  const [isUploadingToIpfs, setIsUploadingToIpfs] = useState<boolean>(false);
  const [isSimulatingTransaction, setIsSimulatingTransaction] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [helia, setHelia] = useState<Helia | null>(null);
  const [isIpfsNodeRunning, setIsIpfsNodeRunning] = useState<boolean>(false);
  
  // Profile picture states
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUsingNftAsProfile, setIsUsingNftAsProfile] = useState<boolean>(false);
  
  // Step 5 ETH transfer states
  const [friendAddress, setFriendAddress] = useState<string>('');
  const [ethAmount, setEthAmount] = useState<string>('');
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState<boolean>(false);
  const [transferTransactionHash, setTransferTransactionHash] = useState<string | null>(null);
  const [isRealTransfer, setIsRealTransfer] = useState<boolean>(false);
  const [transactionReceipt, setTransactionReceipt] = useState<ethers.TransactionReceipt | null>(null);
  const [hasUserSentEth, setHasUserSentEth] = useState<boolean>(false);
  
  // Step 6 Web3 username states
  const [web3Username, setWeb3Username] = useState<string>('');
  const [isRegisteringUsername, setIsRegisteringUsername] = useState<boolean>(false);
  const [usernameTransactionHash, setUsernameTransactionHash] = useState<string | null>(null);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(null);

  // Step 7 Buy real ETH states
  const [hasBoughtRealEth, setHasBoughtRealEth] = useState<boolean>(false);
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [ethPurchaseAmount, setEthPurchaseAmount] = useState<string>('');
  const [purchaseConfirmation, setPurchaseConfirmation] = useState<string>('');
  
  // Step 8 Advanced Security states
  const [hasCompletedSecurity, setHasCompletedSecurity] = useState<boolean>(false);
  const [selectedHardwareWallet, setSelectedHardwareWallet] = useState<string>('');
  const [hasBackedUpSeedPhrase, setHasBackedUpSeedPhrase] = useState<boolean>(false);
  const [hasSetUpMultisig, setHasSetUpMultisig] = useState<boolean>(false);
  const [securityConfirmation, setSecurityConfirmation] = useState<string>('');
  const [securityNotes, setSecurityNotes] = useState<string>('');
  
  // Step 9 DeFi Exploration states
  const [hasCompletedDeFi, setHasCompletedDeFi] = useState<boolean>(false);
  const [selectedDeFiProtocol, setSelectedDeFiProtocol] = useState<string>('');
  const [defiActivity, setDefiActivity] = useState<string>('');
  const [hasExploredYieldFarming, setHasExploredYieldFarming] = useState<boolean>(false);
  const [hasExploredStaking, setHasExploredStaking] = useState<boolean>(false);
  const [hasExploredLending, setHasExploredLending] = useState<boolean>(false);
  const [defiConfirmation, setDefiConfirmation] = useState<string>('');
  const [defiNotes, setDefiNotes] = useState<string>('');
  
  // Step 10 Layer 2 Solutions states
  const [hasCompletedL2, setHasCompletedL2] = useState<boolean>(false);
  const [selectedL2Network, setSelectedL2Network] = useState<string>('');
  const [l2Activity, setL2Activity] = useState<string>('');
  const [hasBridgedAssets, setHasBridgedAssets] = useState<boolean>(false);
  const [hasExploredL2DeFi, setHasExploredL2DeFi] = useState<boolean>(false);
  const [hasComparedGasFees, setHasComparedGasFees] = useState<boolean>(false);
  const [l2Confirmation, setL2Confirmation] = useState<string>('');
  const [l2Notes, setL2Notes] = useState<string>('');
  
  // Step 11 NFT Marketplace Mastery states
  const [hasCompletedNFTMarketplace, setHasCompletedNFTMarketplace] = useState<boolean>(false);
  const [selectedNFTMarketplace, setSelectedNFTMarketplace] = useState<string>('');
  const [nftMarketplaceActivity, setNftMarketplaceActivity] = useState<string>('');
  const [hasListedNFT, setHasListedNFT] = useState<boolean>(false);
  const [hasBoughtNFT, setHasBoughtNFT] = useState<boolean>(false);
  const [hasExploredCollections, setHasExploredCollections] = useState<boolean>(false);
  const [nftMarketplaceConfirmation, setNftMarketplaceConfirmation] = useState<string>('');
  const [nftMarketplaceNotes, setNftMarketplaceNotes] = useState<string>('');
  
  // Step 12 DAO Governance & Voting states
  const [hasCompletedDAOGovernance, setHasCompletedDAOGovernance] = useState<boolean>(false);
  const [selectedDAOPlatform, setSelectedDAOPlatform] = useState<string>('');
  const [daoGovernanceActivity, setDaoGovernanceActivity] = useState<string>('');
  const [hasJoinedDAO, setHasJoinedDAO] = useState<boolean>(false);
  const [hasVotedOnProposal, setHasVotedOnProposal] = useState<boolean>(false);
  const [hasCreatedProposal, setHasCreatedProposal] = useState<boolean>(false);
  const [daoGovernanceConfirmation, setDaoGovernanceConfirmation] = useState<string>('');
  const [daoGovernanceNotes, setDaoGovernanceNotes] = useState<string>('');
  
  // Step 13 Web3 Social & Identity Aggregation states
  const [hasCompletedWeb3Social, setHasCompletedWeb3Social] = useState<boolean>(false);
  const [selectedWeb3SocialPlatform, setSelectedWeb3SocialPlatform] = useState<string>('');
  const [web3SocialActivity, setWeb3SocialActivity] = useState<string>('');
  const [hasCreatedWeb3Profile, setHasCreatedWeb3Profile] = useState<boolean>(false);
  const [hasConnectedWeb3Identity, setHasConnectedWeb3Identity] = useState<boolean>(false);
  const [hasParticipatedInSocial, setHasParticipatedInSocial] = useState<boolean>(false);
  const [web3SocialConfirmation, setWeb3SocialConfirmation] = useState<string>('');
  const [web3SocialNotes, setWeb3SocialNotes] = useState<string>('');
  
  // Step 14 Web3 Development & Smart Contracts states
  const [hasCompletedWeb3Development, setHasCompletedWeb3Development] = useState<boolean>(false);
  const [selectedDevPlatform, setSelectedDevPlatform] = useState<string>('');
  const [web3DevActivity, setWeb3DevActivity] = useState<string>('');
  const [hasWrittenSmartContract, setHasWrittenSmartContract] = useState<boolean>(false);
  const [hasDeployedContract, setHasDeployedContract] = useState<boolean>(false);
  const [hasBuiltDApp, setHasBuiltDApp] = useState<boolean>(false);
  const [web3DevConfirmation, setWeb3DevConfirmation] = useState<string>('');
  const [web3DevNotes, setWeb3DevNotes] = useState<string>('');
  
  // Step 15 Advanced Trading & Analytics states
  const [hasCompletedTradingAnalytics, setHasCompletedTradingAnalytics] = useState<boolean>(false);
  const [selectedTradingPlatform, setSelectedTradingPlatform] = useState<string>('');
  const [tradingAnalyticsActivity, setTradingAnalyticsActivity] = useState<string>('');
  const [hasExecutedAdvancedTrade, setHasExecutedAdvancedTrade] = useState<boolean>(false);
  const [hasUsedAnalyticsTools, setHasUsedAnalyticsTools] = useState<boolean>(false);
  const [hasOptimizedYield, setHasOptimizedYield] = useState<boolean>(false);
  const [tradingAnalyticsConfirmation, setTradingAnalyticsConfirmation] = useState<string>('');
  const [tradingAnalyticsNotes, setTradingAnalyticsNotes] = useState<string>('');
  
  // Step 16 Web3 Gaming & Metaverse states
  const [hasCompletedGamingMetaverse, setHasCompletedGamingMetaverse] = useState<boolean>(false);
  const [selectedGamingPlatform, setSelectedGamingPlatform] = useState<string>('');
  const [gamingMetaverseActivity, setGamingMetaverseActivity] = useState<string>('');
  const [hasPlayedToEarn, setHasPlayedToEarn] = useState<boolean>(false);
  const [hasOwnedMetaverseLand, setHasOwnedMetaverseLand] = useState<boolean>(false);
  const [hasParticipatedInVirtualWorld, setHasParticipatedInVirtualWorld] = useState<boolean>(false);
  const [gamingMetaverseConfirmation, setGamingMetaverseConfirmation] = useState<string>('');
  const [gamingMetaverseNotes, setGamingMetaverseNotes] = useState<string>('');

  function redirect() {
    router.push("https://github.com/pierreuntas");
  }

  async function copyAddressToClipboard() {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }

  // Configuration des réseaux
  const networks = useMemo(() => ({
    mainnet: {
      name: 'Réseau Principal Ethereum',
      displayName: 'Réseau Principal',
      description: 'Réseau principal avec de vrais ETH (coûteux)',
      chainId: 1,
      rpcUrls: [
        'https://ethereum.publicnode.com',
        'https://eth.llamarpc.com',
        'https://rpc.flashbots.net'
      ],
      blockExplorer: 'https://etherscan.io'
    },
    sepolia: {
      name: 'Réseau de Test Sepolia',
      displayName: 'Réseau de Test',
      description: 'Réseau de test avec des ETH gratuits',
      chainId: 11155111,
      rpcUrls: [
        'https://ethereum-sepolia.publicnode.com',
        'https://rpc.sepolia.org',
        'https://sepolia.gateway.tenderly.co',
        'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        'https://sepolia.drpc.org',
        'https://sepolia.publicnode.com',
        'https://sepolia-rpc.publicnode.com'
      ],
      blockExplorer: 'https://sepolia.etherscan.io'
    }
  }), []);

  // Fonctions pour le système sécurisé
  const handleSecureWalletConnected = (connectedWallet: ethers.Wallet) => {
    setWallet(connectedWallet);
    setAddress(connectedWallet.address);
    setIsConnected(true);
    setAccount(connectedWallet.address);
    setChainId('0xaa36a7'); // Sepolia
    
    // Récupérer le solde seulement si un réseau est sélectionné
    if (network) {
      getBalance(connectedWallet.address);
    }
  };

  const handleSecureWalletDisconnected = () => {
    setWallet(null);
    setAddress('');
    setIsConnected(false);
    setAccount(null);
    setBalance('0');
  };

  // Fonction pour essayer plusieurs fournisseurs RPC
  const tryMultipleProviders = useCallback(async (networkName: string, operation: (provider: ethers.JsonRpcProvider) => Promise<unknown>) => {
    const rpcUrls = networks[networkName as keyof typeof networks].rpcUrls;
    console.log(`🔄 Tentative avec ${rpcUrls.length} fournisseurs RPC pour ${networkName}`);
    
    for (let i = 0; i < rpcUrls.length; i++) {
      try {
        console.log(`🔗 Test du RPC ${i + 1}/${rpcUrls.length}: ${rpcUrls[i]}`);
        
        // Créer le provider avec un timeout plus long
        const provider = new ethers.JsonRpcProvider(rpcUrls[i], undefined, {
          polling: false,
          staticNetwork: true
        });
        
        // Test de connectivité avec timeout
        const blockNumberPromise = provider.getBlockNumber();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        await Promise.race([blockNumberPromise, timeoutPromise]);
        console.log(`✅ RPC ${i + 1} fonctionne, exécution de l'opération...`);
        
        const result = await operation(provider);
        console.log(`🎉 Opération réussie avec RPC ${i + 1}`);
        return result;
      } catch (err) {
        console.warn(`❌ RPC ${i + 1} failed:`, rpcUrls[i], (err as Error).message);
        if (i === rpcUrls.length - 1) {
          throw new Error(`Tous les fournisseurs RPC ont échoué pour ${networkName}. Vérifiez votre connexion internet.`);
        }
        // Délai de 1 seconde entre les tentatives pour éviter de surcharger les RPC gratuits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, [networks]);

  // Fonction pour obtenir un provider fiable
  const getReliableProvider = async (networkName: string = network) => {
    const rpcUrls = networks[networkName as keyof typeof networks].rpcUrls;
    
    for (let i = 0; i < rpcUrls.length; i++) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrls[i]);
        // Test the provider with a simple call
        await provider.getBlockNumber();
        return provider;
      } catch (err) {
        console.warn(`RPC ${i + 1} failed:`, rpcUrls[i], (err as Error).message);
        if (i === rpcUrls.length - 1) {
          throw new Error(`Tous les fournisseurs RPC ont échoué. Vérifiez votre connexion internet.`);
        }
      }
    }
  };

  // Récupérer le solde
  const getBalance = useCallback(async (walletAddress: string, networkName: string = network) => {
    try {
      // Vérifier qu'un réseau valide est sélectionné
      if (!networkName || networkName === '') {
        console.log('⚠️ Aucun réseau sélectionné, impossible de récupérer le solde');
        return;
      }
      
      console.log(`🔍 Récupération du solde pour ${walletAddress} sur ${networkName}`);
      
      // S'assurer qu'on utilise bien le réseau spécifié
      if (!networks[networkName as keyof typeof networks]) {
        throw new Error(`Réseau ${networkName} non supporté`);
      }
      
      const balance = await tryMultipleProviders(networkName, async (provider) => {
        console.log(`📡 Test du provider pour ${walletAddress}`);
        const balance = await provider.getBalance(walletAddress);
        const balanceInEth = ethers.formatEther(balance);
        const formattedBalance = parseFloat(balanceInEth).toFixed(4);
        console.log(`💰 Solde trouvé: ${formattedBalance} ETH`);
        return formattedBalance;
      });
      
      console.log(`✅ Solde mis à jour: ${balance} ETH`);
      setBalance(balance as string);
      setBalanceEth(balance as string);
      
      // La progression sera vérifiée automatiquement par checkAdvancedStepConditions
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération du solde:', err);
      setBalance('0');
      setBalanceEth('0');
      // Afficher un message d'erreur plus clair
      if ((err as Error).message.includes('fournisseurs RPC')) {
        setError(`Impossible de récupérer le solde sur ${networkName}. Vérifiez votre connexion internet.`);
      } else {
        setError(`Erreur de récupération du solde: ${(err as Error).message}`);
      }
    }
  }, [network, tryMultipleProviders, playerLevel]);

  // Changer de réseau
  const switchNetwork = async (newNetwork: string) => {
    try {
      setLoading(true);
      setError('');
      
      setNetwork(newNetwork);
      
      // Toujours sauvegarder le nouveau réseau dans localStorage
      localStorage.setItem('spacewolf_network', newNetwork);
      
      if (wallet) {
        // Attendre un peu pour que le state se mette à jour, puis récupérer le solde
        setTimeout(async () => {
          try {
            await getBalance(wallet.address, newNetwork);
            
            // Vérifier la progression après le changement de réseau
            setTimeout(() => {
              console.log('🔍 Vérification progression après changement de réseau');
              checkAdvancedStepConditions();
            }, 300);
            
          } catch (err) {
            console.warn('Erreur lors de la mise à jour du solde:', (err as Error).message);
          }
        }, 200);
      }
      
      // 🎮 GAMIFICATION: Level up et récompense SW (seulement si pas déjà fait)
      if (!hasActionBeenCompleted('Network Switch')) {
        levelUp('Network Switch');
      }
      
      // Toujours incrémenter le compteur de réseaux explorés
      setGameStats(prev => ({ ...prev, networksSwitched: prev.networksSwitched + 1 }));
      
      // Ajouter des achievements spécifiques au réseau (sans level up)
      if (newNetwork === 'mainnet') {
        addAchievement('Mainnet Explorer');
      } else if (newNetwork === 'sepolia') {
        addAchievement('Testnet Master');
      }
      
    } catch (err) {
      setError('Erreur lors du changement de réseau: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir le solde manuellement
  const refreshBalance = async () => {
    if (!wallet || !address) {
      setError('Aucun wallet connecté');
      return;
    }
    
    if (!network || network === '') {
      setError('Veuillez d\'abord sélectionner un réseau');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Rafraîchissement manuel du solde...');
      await getBalance(address, network);
      
      // Forcer la vérification de progression après le rafraîchissement
      setTimeout(() => {
        console.log('🔍 Vérification forcée de progression après rafraîchissement');
        checkAdvancedStepConditions();
      }, 500);
      
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError('Erreur lors du rafraîchissement du solde');
    } finally {
      setLoading(false);
    }
  };

  // === SYSTÈME DE JEU SIMPLIFIÉ ===
  
  // Définir les étapes du parcours Web3
  const journeySteps = [
    { level: 1, name: "Wallet Creation", description: "Créer votre premier wallet", swReward: 100 },
    { level: 2, name: "Network Switch", description: "Explorer les réseaux", swReward: 150 },
    { level: 3, name: "Balance Check", description: "Obtenir des ETH de test", swReward: 200 },
    { level: 4, name: "NFT Minting", description: "Créer votre premier NFT", swReward: 300 },
    { level: 5, name: "ETH Transfer", description: "Envoyer des ETH", swReward: 250 },
    { level: 6, name: "Web3 Identity", description: "Créer une identité Web3", swReward: 400 },
    { level: 7, name: "Real ETH", description: "Acheter de vrais ETH", swReward: 500 },
    { level: 8, name: "Advanced Security", description: "Maîtriser la sécurité", swReward: 600 },
    { level: 9, name: "DeFi Explorer", description: "Explorer la DeFi", swReward: 750 },
    { level: 10, name: "Web3 Master", description: "Maître du Web3", swReward: 1000 }
  ];

  // Obtenir les informations de l'étape actuelle
  const getCurrentStep = () => {
    return journeySteps.find(step => step.level === playerLevel) || journeySteps[0];
  };

  // Obtenir l'étape suivante
  const getNextStep = () => {
    return journeySteps.find(step => step.level === playerLevel + 1);
  };

  // Vérifier si une action a déjà été accomplie pour éviter les level ups multiples
  const hasActionBeenCompleted = (action: string): boolean => {
    const completedActions = localStorage.getItem('spacewolf-completed-actions');
    if (!completedActions) return false;
    
    const actions = JSON.parse(completedActions);
    return actions.includes(action);
  };

  // Marquer une action comme accomplie
  const markActionAsCompleted = (action: string) => {
    const completedActions = localStorage.getItem('spacewolf-completed-actions');
    const actions = completedActions ? JSON.parse(completedActions) : [];
    
    if (!actions.includes(action)) {
      actions.push(action);
      localStorage.setItem('spacewolf-completed-actions', JSON.stringify(actions));
    }
  };

  // Passer au niveau suivant (simple +1) avec vérification des actions déjà accomplies
  const levelUp = (action: string) => {
    // Vérifier si cette action a déjà été accomplie
    if (hasActionBeenCompleted(action)) {
      console.log(`⚠️ Action "${action}" déjà accomplie, pas de level up`);
      return;
    }

    const newLevel = playerLevel + 1;
    console.log(`🎉 LEVEL UP! ${action} → Niveau ${playerLevel} → ${newLevel}`);
    
    setPlayerLevel(newLevel);
    setShowLevelUp(true);
    
    // Marquer l'action comme accomplie
    markActionAsCompleted(action);
    
    // Ajouter un achievement pour le level up
    addAchievement(`Level ${newLevel} Reached!`);
    
    // Sauvegarder immédiatement avec le nouveau niveau
    saveGameStats({ level: newLevel });
    
    // Masquer l'animation de level up après 3 secondes
    setTimeout(() => setShowLevelUp(false), 3000);
    
    console.log(`🎉 Level up terminé! Nouveau niveau: ${newLevel}`);
  };

  // Vérifier automatiquement les conditions de progression pour les étapes avancées
  const checkAdvancedStepConditions = useCallback(() => {
    const balanceInEth = parseFloat(balanceEth || '0');
    
    // Étape 3: Balance Check - Vérifier si l'utilisateur a des ETH ET est au niveau 2
    if (playerLevel === 2 && balanceInEth > 0) {
      console.log(`🎉 Balance détectée: ${balanceInEth} ETH - Passage au niveau 3!`);
      levelUp('Balance Check');
      return;
    }
    
    // Étape 6: Web3 Identity - Vérifier si l'utilisateur a créé plusieurs transactions
    if (playerLevel === 5 && gameStats.transactionsCompleted >= 2) {
      console.log(`🎉 Web3 Identity détectée - Passage au niveau 6!`);
      levelUp('Web3 Identity');
      return;
    }
    
    // Étape 7: Real ETH - Vérifier si l'utilisateur utilise le mainnet
    if (playerLevel === 6 && network === 'mainnet') {
      console.log(`🎉 Real ETH détecté (mainnet) - Passage au niveau 7!`);
      levelUp('Real ETH');
      return;
    }
    
    // Étape 8: Advanced Security - Vérifier si l'utilisateur a une balance importante
    if (playerLevel === 7 && balanceInEth >= 0.1) {
      console.log(`🎉 Advanced Security détectée (balance élevée) - Passage au niveau 8!`);
      levelUp('Advanced Security');
      return;
    }
    
    // Étape 9: DeFi Explorer - Vérifier si l'utilisateur a exploré plusieurs réseaux
    if (playerLevel === 8 && gameStats.networksSwitched >= 3) {
      console.log(`🎉 DeFi Explorer détecté (multi-réseaux) - Passage au niveau 9!`);
      levelUp('DeFi Explorer');
      return;
    }
    
    // Étape 10: Web3 Master - Vérifier si l'utilisateur a complété toutes les activités
    if (playerLevel === 9 && gameStats.nftsMinted >= 1 && gameStats.transactionsCompleted >= 3 && gameStats.ethTransferred >= 0.01) {
      console.log(`🎉 Web3 Master détecté (activités complètes) - Passage au niveau 10!`);
      levelUp('Web3 Master');
      return;
    }
  }, [playerLevel, balanceEth, network, gameStats]);

  // Vérifier les conditions de progression quand les données changent
  useEffect(() => {
    if (mounted && playerLevel >= 2) {
      console.log(`🔍 Vérification progression - Niveau: ${playerLevel}, Balance: ${balanceEth} ETH, Réseau: ${network}`);
      checkAdvancedStepConditions();
    }
  }, [mounted, playerLevel, balanceEth, network, gameStats, checkAdvancedStepConditions]);

  // === SYSTÈME DE TOKEN SW (SPACEWOLF) ===
  
  // Claimer des tokens SW
  const claimSW = (amount: number) => {
    console.log(`🪙 Claiming ${amount} SW tokens!`);
    console.log(`🪙 Avant claim - Balance: ${swBalance}, Claimed: ${swClaimed}`);
    
    const newBalance = swBalance + amount;
    const newClaimed = swClaimed + amount;
    
    setSwBalance(newBalance);
    setSwClaimed(newClaimed);
    setSwClaimedAmount(amount);
    setShowClaimAnimation(true);
    
    // Sauvegarder immédiatement avec les nouvelles valeurs
    saveGameStats({ swBalance: newBalance, swClaimed: newClaimed });
    
    // Masquer l'animation après 2 secondes
    setTimeout(() => setShowClaimAnimation(false), 2000);
    
    console.log(`🪙 +${amount} SW tokens claimés! Nouveau total: ${newBalance}, Total claimed: ${newClaimed}`);
  };

  // Calculer les SW disponibles à claimer
  const getAvailableSW = () => {
    let available = 0;
    console.log(`🔍 Calcul SW - Niveau actuel: ${playerLevel}, SW déjà claimés: ${swClaimed}`);
    
    for (let i = 1; i <= playerLevel; i++) {
      const step = journeySteps.find(s => s.level === i);
      if (step) {
        available += step.swReward;
        console.log(`🔍 Niveau ${i}: +${step.swReward} SW (${step.name})`);
      }
    }
    
    const result = available - swClaimed;
    console.log(`🔍 Total disponible: ${available}, Déjà claimés: ${swClaimed}, Résultat: ${result}`);
    return result;
  };

  // Ajouter un achievement
  const addAchievement = (title: string) => {
    if (!achievements.includes(title)) {
      setAchievements(prev => [...prev, title]);
      console.log(`🏆 Achievement débloqué: ${title}`);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('spacewolf_achievements', JSON.stringify([...achievements, title]));
    }
  };

  // Sauvegarder les stats de jeu
  const saveGameStats = (overrides?: Partial<{level: number, swBalance: number, swClaimed: number}>) => {
    const stats = {
      level: overrides?.level ?? playerLevel,
      achievements: achievements,
      gameStats: gameStats,
      swBalance: overrides?.swBalance ?? swBalance,
      swClaimed: overrides?.swClaimed ?? swClaimed
    };
    console.log('💾 Sauvegarde des stats:', stats);
    localStorage.setItem('spacewolf_game_stats', JSON.stringify(stats));
  };

  // Charger les stats de jeu depuis localStorage
  const loadGameStats = () => {
    console.log('📂 Chargement des stats de jeu...');
    
    const savedStats = localStorage.getItem('spacewolf_game_stats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      console.log('📂 Stats chargées:', stats);
      
      setPlayerLevel(stats.level || 1);
      setAchievements(stats.achievements || []);
      setGameStats(stats.gameStats || gameStats);
      setSwBalance(stats.swBalance || 0);
      setSwClaimed(stats.swClaimed || 0);
      
      console.log(`📂 Niveau restauré: ${stats.level || 1}, SW Balance: ${stats.swBalance || 0}, SW Claimed: ${stats.swClaimed || 0}`);
    } else {
      console.log('📂 Aucune stats sauvegardées, utilisation des valeurs par défaut');
    }
    
    const savedAchievements = localStorage.getItem('spacewolf_achievements');
    if (savedAchievements) {
      const achievements = JSON.parse(savedAchievements);
      console.log('🏆 Achievements chargés:', achievements);
      setAchievements(achievements);
    }
  };

  // Copier dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Helper functions to check step completion
  const isStep1Completed = () => !!account && !!wallet;
  const isStep2Completed = () => network === 'sepolia' || network === 'mainnet';
  const isStep3Completed = () => {
    if (!balanceEth) return false;
    const balance = parseFloat(balanceEth);
    return balance > 0;
  };
  const isStep4Completed = () => !!imageIpfsCid && !!metadataIpfsCid && !!transactionHash;
  const isStep5Completed = () => {
    // Check if user has manually completed Step 5
    if (transferTransactionHash && (isRealTransfer ? !!transactionReceipt : true)) {
      return true;
    }
    
    // Check if user has sent ETH to any address (from transaction history)
    return hasUserSentEth;
  };
  const isStep6Completed = () => !!usernameTransactionHash && !!registeredUsername;
  const isStep7Completed = () => hasBoughtRealEth;
  const isStep8Completed = () => hasCompletedSecurity;
  const isStep9Completed = () => hasCompletedDeFi;
  const isStep10Completed = () => hasCompletedL2;
  const isStep11Completed = () => hasCompletedNFTMarketplace;
  const isStep12Completed = () => hasCompletedDAOGovernance;
  const isStep13Completed = () => hasCompletedWeb3Social;
  const isStep14Completed = () => hasCompletedWeb3Development;
  const isStep15Completed = () => hasCompletedTradingAnalytics;
  const isStep16Completed = () => hasCompletedGamingMetaverse;

  // Confirm ETH purchase completion
  const confirmEthPurchase = () => {
    if (!selectedExchange.trim() || !ethPurchaseAmount.trim() || !purchaseConfirmation.trim()) {
      setError('Please fill in all fields to confirm your ETH purchase');
      return;
    }
    
    if (purchaseConfirmation.toLowerCase() !== 'i confirm') {
      setError('Please type "I confirm" exactly to confirm your ETH purchase');
      return;
    }
    
    const purchaseData = {
      exchange: selectedExchange,
      amount: ethPurchaseAmount,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 7
    };
    
    setHasBoughtRealEth(true);
    localStorage.setItem('spacewolf-bought-real-eth', 'true');
    localStorage.setItem('spacewolf-eth-purchase-data', JSON.stringify(purchaseData));
    
    console.log('ETH purchase confirmed:', purchaseData);
    setError(null);
  };

  // Confirm Advanced Security completion
  const confirmSecuritySetup = () => {
    if (!selectedHardwareWallet.trim() || !securityConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your security setup');
      return;
    }
    
    if (securityConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your security understanding');
      return;
    }
    
    const securityData = {
      hardwareWallet: selectedHardwareWallet,
      backedUpSeedPhrase: hasBackedUpSeedPhrase,
      setUpMultisig: hasSetUpMultisig,
      notes: securityNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 8
    };
    
    setHasCompletedSecurity(true);
    localStorage.setItem('spacewolf-security-completed', 'true');
    localStorage.setItem('spacewolf-security-data', JSON.stringify(securityData));
    
    console.log('Security setup confirmed:', securityData);
    setError(null);
  };

  // Confirm DeFi Exploration completion
  const confirmDeFiExploration = () => {
    if (!selectedDeFiProtocol.trim() || !defiActivity.trim() || !defiConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your DeFi exploration');
      return;
    }
    
    if (defiConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your DeFi understanding');
      return;
    }
    
    const defiData = {
      protocol: selectedDeFiProtocol,
      activity: defiActivity,
      yieldFarming: hasExploredYieldFarming,
      staking: hasExploredStaking,
      lending: hasExploredLending,
      notes: defiNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 9
    };
    
    setHasCompletedDeFi(true);
    localStorage.setItem('spacewolf-defi-completed', 'true');
    localStorage.setItem('spacewolf-defi-data', JSON.stringify(defiData));
    
    console.log('DeFi exploration confirmed:', defiData);
    setError(null);
  };

  // Confirm Layer 2 Solutions completion
  const confirmL2Exploration = () => {
    if (!selectedL2Network.trim() || !l2Activity.trim() || !l2Confirmation.trim()) {
      setError('Please fill in all required fields to confirm your L2 exploration');
      return;
    }
    
    if (l2Confirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your L2 understanding');
      return;
    }
    
    const l2Data = {
      network: selectedL2Network,
      activity: l2Activity,
      bridgedAssets: hasBridgedAssets,
      exploredL2DeFi: hasExploredL2DeFi,
      comparedGasFees: hasComparedGasFees,
      notes: l2Notes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 10
    };
    
    setHasCompletedL2(true);
    localStorage.setItem('spacewolf-l2-completed', 'true');
    localStorage.setItem('spacewolf-l2-data', JSON.stringify(l2Data));
    
    console.log('L2 exploration confirmed:', l2Data);
    setError(null);
  };

  // Confirm NFT Marketplace Mastery completion
  const confirmNFTMarketplaceMastery = () => {
    if (!selectedNFTMarketplace.trim() || !nftMarketplaceActivity.trim() || !nftMarketplaceConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your NFT marketplace mastery');
      return;
    }
    
    if (nftMarketplaceConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your NFT marketplace understanding');
      return;
    }
    
    const nftMarketplaceData = {
      marketplace: selectedNFTMarketplace,
      activity: nftMarketplaceActivity,
      listedNFT: hasListedNFT,
      boughtNFT: hasBoughtNFT,
      exploredCollections: hasExploredCollections,
      notes: nftMarketplaceNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 11
    };
    
    setHasCompletedNFTMarketplace(true);
    localStorage.setItem('spacewolf-nft-marketplace-completed', 'true');
    localStorage.setItem('spacewolf-nft-marketplace-data', JSON.stringify(nftMarketplaceData));
    
    console.log('NFT marketplace mastery confirmed:', nftMarketplaceData);
    setError(null);
  };

  // Confirm DAO Governance & Voting completion
  const confirmDAOGovernance = () => {
    if (!selectedDAOPlatform.trim() || !daoGovernanceActivity.trim() || !daoGovernanceConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your DAO governance understanding');
      return;
    }
    
    if (daoGovernanceConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your DAO governance understanding');
      return;
    }
    
    const daoGovernanceData = {
      platform: selectedDAOPlatform,
      activity: daoGovernanceActivity,
      joinedDAO: hasJoinedDAO,
      votedOnProposal: hasVotedOnProposal,
      createdProposal: hasCreatedProposal,
      notes: daoGovernanceNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 12
    };
    
    setHasCompletedDAOGovernance(true);
    localStorage.setItem('spacewolf-dao-governance-completed', 'true');
    localStorage.setItem('spacewolf-dao-governance-data', JSON.stringify(daoGovernanceData));
    
    console.log('DAO governance confirmed:', daoGovernanceData);
    setError(null);
  };

  // Confirm Web3 Social & Identity Aggregation completion
  const confirmWeb3Social = () => {
    if (!selectedWeb3SocialPlatform.trim() || !web3SocialActivity.trim() || !web3SocialConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your Web3 social understanding');
      return;
    }
    
    if (web3SocialConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your Web3 social understanding');
      return;
    }
    
    const web3SocialData = {
      platform: selectedWeb3SocialPlatform,
      activity: web3SocialActivity,
      createdProfile: hasCreatedWeb3Profile,
      connectedIdentity: hasConnectedWeb3Identity,
      participatedInSocial: hasParticipatedInSocial,
      notes: web3SocialNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 13
    };
    
    setHasCompletedWeb3Social(true);
    localStorage.setItem('spacewolf-web3-social-completed', 'true');
    localStorage.setItem('spacewolf-web3-social-data', JSON.stringify(web3SocialData));
    
    console.log('Web3 social confirmed:', web3SocialData);
    setError(null);
  };

  // Confirm Web3 Development & Smart Contracts completion
  const confirmWeb3Development = () => {
    if (!selectedDevPlatform.trim() || !web3DevActivity.trim() || !web3DevConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your Web3 development understanding');
      return;
    }
    
    if (web3DevConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your Web3 development understanding');
      return;
    }
    
    const web3DevData = {
      platform: selectedDevPlatform,
      activity: web3DevActivity,
      writtenSmartContract: hasWrittenSmartContract,
      deployedContract: hasDeployedContract,
      builtDApp: hasBuiltDApp,
      notes: web3DevNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 14
    };
    
    setHasCompletedWeb3Development(true);
    localStorage.setItem('spacewolf-web3-development-completed', 'true');
    localStorage.setItem('spacewolf-web3-development-data', JSON.stringify(web3DevData));
    
    console.log('Web3 development confirmed:', web3DevData);
    setError(null);
  };

  // Confirm Advanced Trading & Analytics completion
  const confirmTradingAnalytics = () => {
    if (!selectedTradingPlatform.trim() || !tradingAnalyticsActivity.trim() || !tradingAnalyticsConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your trading analytics understanding');
      return;
    }
    
    if (tradingAnalyticsConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your trading analytics understanding');
      return;
    }
    
    const tradingAnalyticsData = {
      platform: selectedTradingPlatform,
      activity: tradingAnalyticsActivity,
      executedAdvancedTrade: hasExecutedAdvancedTrade,
      usedAnalyticsTools: hasUsedAnalyticsTools,
      optimizedYield: hasOptimizedYield,
      notes: tradingAnalyticsNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 15
    };
    
    setHasCompletedTradingAnalytics(true);
    localStorage.setItem('spacewolf-trading-analytics-completed', 'true');
    localStorage.setItem('spacewolf-trading-analytics-data', JSON.stringify(tradingAnalyticsData));
    
    console.log('Trading analytics confirmed:', tradingAnalyticsData);
    setError(null);
  };

  // Confirm Web3 Gaming & Metaverse completion
  const confirmGamingMetaverse = () => {
    if (!selectedGamingPlatform.trim() || !gamingMetaverseActivity.trim() || !gamingMetaverseConfirmation.trim()) {
      setError('Please fill in all required fields to confirm your gaming metaverse understanding');
      return;
    }
    
    if (gamingMetaverseConfirmation.toLowerCase() !== 'i understand') {
      setError('Please type &quot;I understand&quot; exactly to confirm your gaming metaverse understanding');
      return;
    }
    
    const gamingMetaverseData = {
      platform: selectedGamingPlatform,
      activity: gamingMetaverseActivity,
      playedToEarn: hasPlayedToEarn,
      ownedMetaverseLand: hasOwnedMetaverseLand,
      participatedInVirtualWorld: hasParticipatedInVirtualWorld,
      notes: gamingMetaverseNotes,
      timestamp: new Date().toISOString(),
      confirmed: true,
      step: 16
    };
    
    setHasCompletedGamingMetaverse(true);
    localStorage.setItem('spacewolf-gaming-metaverse-completed', 'true');
    localStorage.setItem('spacewolf-gaming-metaverse-data', JSON.stringify(gamingMetaverseData));
    
    console.log('Gaming metaverse confirmed:', gamingMetaverseData);
    setError(null);
  };

  // Check if user has sent ETH to any address
  const checkUserTransactionHistory = useCallback(async () => {
    if (!account || !chainId) return;
    
    try {
      // Get recent transactions for the user's address
      // Using Sepolia Etherscan API to check transaction history
      const response = await fetch(`https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=YourApiKeyToken`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === '1' && data.result) {
          // Check if any transaction is an outgoing ETH transfer
          const hasOutgoingTransfer = data.result.some((tx: { from: string; to: string; value: string }) => {
            return tx.from.toLowerCase() === account.toLowerCase() && 
                   tx.to.toLowerCase() !== account.toLowerCase() && 
                   parseFloat(ethers.formatEther(tx.value)) > 0;
          });
          
          setHasUserSentEth(hasOutgoingTransfer);
          
          // Save the result to localStorage for persistence
          localStorage.setItem('spacewolf-has-sent-eth', hasOutgoingTransfer.toString());
          
          console.log('Transaction history check:', hasOutgoingTransfer ? 'User has sent ETH' : 'No ETH transfers found');
        }
      }
    } catch (error) {
      console.log('Could not check transaction history:', error);
      // Fallback: check localStorage for any previous ETH transfers
      const savedTransferData = localStorage.getItem('spacewolf-transfer-data');
      if (savedTransferData) {
        try {
          const transferData = JSON.parse(savedTransferData);
          if (transferData.isRealTransfer) {
            setHasUserSentEth(true);
            localStorage.setItem('spacewolf-has-sent-eth', 'true');
          }
        } catch {
          console.log('Could not parse saved transfer data');
        }
      }
    }
  }, [account, chainId]);

  // Initialize Helia IPFS node
  const initializeHelia = async () => {
    try {
      const heliaInstance = await createHelia();
      setHelia(heliaInstance);
      setIsIpfsNodeRunning(true);
      console.log('Helia IPFS node initialized successfully');
      return heliaInstance;
    } catch (err) {
      console.error('Failed to initialize Helia:', err);
      setError('Failed to initialize IPFS node');
      setIsIpfsNodeRunning(false);
      return null;
    }
  };

  // Start local IPFS node
  const startIpfsNode = async () => {
    if (helia) {
      setError('IPFS node is already running');
      return;
    }
    
    setError(null);
    await initializeHelia();
  };

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Automatically set as profile picture
      setProfilePicture(previewUrl);
      setIsUsingNftAsProfile(true);
      
      // Save to localStorage
      localStorage.setItem('spacewolf-profile-picture', previewUrl);
      localStorage.setItem('spacewolf-using-nft-profile', 'true');
      
      setError(null);
      console.log('NFT image automatically set as profile picture');
    }
  };

  // Set NFT image as profile picture (manual function)
  const setNftAsProfilePicture = () => {
    if (imagePreview) {
      setProfilePicture(imagePreview);
      setIsUsingNftAsProfile(true);
      
      // Save to localStorage
      localStorage.setItem('spacewolf-profile-picture', imagePreview);
      localStorage.setItem('spacewolf-using-nft-profile', 'true');
      
      console.log('NFT image set as profile picture');
    }
  };

  // Validate Ethereum address
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Validate Web3 username
  const isValidUsername = (username: string): boolean => {
    // Allow alphanumeric characters, hyphens, and underscores
    // Must be 3-20 characters long
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
  };

  // Register Web3 username (ENS-like registration simulation)
  const registerWeb3Username = async () => {
    if (!web3Username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!isValidUsername(web3Username)) {
      setError('Username must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores');
      return;
    }

    setIsRegisteringUsername(true);
    setError(null);

    try {
      // Get a reliable provider for Sepolia testnet
      const provider = await getReliableProvider('sepolia');
      
      // Use our wallet directly
      if (!wallet) {
        setError('Wallet non connecté');
        return;
      }
      
      // Connect wallet to provider
      const connectedWallet = wallet.connect(provider!);
      
      // For now, we'll simulate ENS registration with a real transaction
      // This creates a real transaction that demonstrates the concept
      // In a production app, you'd integrate with ENS or similar service
      
      // Create a simple transaction that writes to the blockchain
      // This simulates domain registration by creating a real transaction
      // We'll send a tiny amount to a burn address with the domain hash as data
      const tx = await connectedWallet.sendTransaction({
        to: '0x000000000000000000000000000000000000dEaD', // Burn address
        value: ethers.parseEther('0.000001'), // Send 0.000001 ETH (tiny amount)
        data: ethers.keccak256(ethers.toUtf8Bytes(`${web3Username}.eth`)) // Hash the domain name
      });
      
      console.log('ENS-like registration transaction sent:', tx.hash);
      
      setUsernameTransactionHash(tx.hash);
      
      // Wait for transaction confirmation
      console.log('Waiting for registration confirmation...');
      const receipt = await tx.wait();
      console.log('Registration confirmed:', receipt);
      
      setRegisteredUsername(web3Username);
      
      // Save username data to localStorage
      const usernameData = {
        username: web3Username,
        transactionHash: tx.hash,
        address: account,
        timestamp: new Date().toISOString(),
        network: 'sepolia',
        type: 'ens_like_registration',
        domain: `${web3Username}.eth`,
        namehash: ethers.namehash(`${web3Username}.eth`),
        blockNumber: receipt?.blockNumber || 0,
        gasUsed: receipt?.gasUsed?.toString() || '0'
      };
      
      localStorage.setItem('spacewolf-username-tx-hash', tx.hash);
      localStorage.setItem('spacewolf-username-data', JSON.stringify(usernameData));
      
      console.log('ENS-like domain registered:', usernameData);
      
    } catch (err: unknown) {
      console.error('Failed to register ENS-like domain:', err);
      
      // Handle specific error cases
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'INSUFFICIENT_FUNDS') {
          setError('Insufficient funds for domain registration. Please ensure you have enough ETH for gas fees and the 0.000001 ETH burn amount.');
        } else if (errorCode === 'USER_REJECTED') {
          setError('Domain registration was rejected by user.');
        } else if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string' && (err as { message: string }).message.includes('gas')) {
          setError('Gas estimation failed. Please try again.');
        } else {
          setError(`Domain registration failed: ${err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Unknown error'}`);
        }
      } else {
        setError(`Domain registration failed: ${err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Unknown error'}`);
      }
    } finally {
      setIsRegisteringUsername(false);
    }
  };

  // Real ETH transfer to friend
  const sendEthTransfer = async () => {
    if (!friendAddress.trim()) {
      setError('Please enter your friend\'s address');
      return;
    }
    
    if (!ethAmount.trim()) {
      setError('Please enter the amount to send');
      return;
    }
    
    if (!isValidAddress(friendAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    const amount = parseFloat(ethAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    
    if (balanceEth && amount > parseFloat(balanceEth)) {
      setError('Insufficient balance. You don\'t have enough ETH.');
      return;
    }

    setIsSimulatingTransfer(true);
    setError(null);

    try {
      // Get a reliable provider for Sepolia testnet
      const provider = await getReliableProvider('sepolia');
      
      // Use our wallet directly
      if (!wallet) {
        setError('Wallet non connecté');
        return;
      }
      
      // Connect wallet to provider
      const connectedWallet = wallet.connect(provider!);
      
      // Convert ETH to Wei
      const amountWei = ethers.parseEther(ethAmount);
      
      // Estimate gas for the transaction
      const gasEstimate = await provider!.estimateGas({
        to: friendAddress,
        value: amountWei,
      });
      
      console.log('Gas estimate:', gasEstimate.toString());
      
      // Create transaction
      const transaction = {
        to: friendAddress,
        value: amountWei,
        gasLimit: gasEstimate,
      };
      
      // Send transaction
      const txResponse = await connectedWallet.sendTransaction(transaction);
      console.log('Transaction sent:', txResponse.hash);
      
      setTransferTransactionHash(txResponse.hash);
      setIsRealTransfer(true);
      
      // Mark that user has sent ETH
      setHasUserSentEth(true);
      localStorage.setItem('spacewolf-has-sent-eth', 'true');
      
      // Wait for transaction confirmation
      console.log('Waiting for confirmation...');
      const receipt = await txResponse.wait();
      console.log('Transaction confirmed:', receipt);
      
      setTransactionReceipt(receipt);
      
      // Save transaction details to localStorage
      const transferData = {
        hash: txResponse.hash,
        from: account,
        to: friendAddress,
        amount: ethAmount,
        timestamp: new Date().toISOString(),
        network: 'sepolia',
        type: 'eth_transfer',
        gasUsed: receipt?.gasUsed?.toString() || '0',
        blockNumber: receipt?.blockNumber || 0,
        isRealTransfer: true
      };
      
      localStorage.setItem('spacewolf-transfer-tx-hash', txResponse.hash);
      localStorage.setItem('spacewolf-transfer-transaction', JSON.stringify(transferData));
      
      console.log('Real ETH transfer completed:', transferData);
      
      // 🎮 GAMIFICATION: Level up et récompense SW
      levelUp('ETH Transfer');
      setGameStats(prev => ({ 
        ...prev, 
        transactionsCompleted: prev.transactionsCompleted + 1,
        ethTransferred: prev.ethTransferred + parseFloat(ethAmount)
      }));
      
    } catch (err: unknown) {
      console.error('Failed to send ETH transfer:', err);
      
      // Handle specific error cases
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'INSUFFICIENT_FUNDS') {
          setError('Insufficient funds for gas fees. Please ensure you have enough ETH.');
        } else if (errorCode === 'USER_REJECTED') {
          setError('Transaction was rejected by user.');
        } else if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string' && (err as { message: string }).message.includes('gas')) {
          setError('Gas estimation failed. Please try again.');
        } else {
          setError(`Transfer failed: ${err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Unknown error'}`);
        }
      } else {
        setError(`Transfer failed: ${err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Unknown error'}`);
      }
    } finally {
      setIsSimulatingTransfer(false);
    }
  };

  // Upload image and metadata to IPFS
  const uploadToIpfs = async () => {
    if (!selectedImage) {
      setError('Please select an image file');
      return;
    }

    setIsUploadingToIpfs(true);
    setError(null);

    try {
      let heliaInstance = helia;
      if (!heliaInstance) {
        heliaInstance = await initializeHelia();
        if (!heliaInstance) return;
      }

      const fs = unixfs(heliaInstance);
      
      // Step 1: Upload image to IPFS
      const imageArrayBuffer = await selectedImage.arrayBuffer();
      const imageCid = await fs.addBytes(new Uint8Array(imageArrayBuffer));
      const imageCidString = imageCid.toString();
      setImageIpfsCid(imageCidString);
      
      console.log('Image uploaded to IPFS:', imageCidString);
      
      // Step 2: Create NFT metadata JSON with image IPFS URI
      const metadata = {
        name: "SpaceWolf Journey NFT",
        description: "A unique NFT created during the SpaceWolf Web3 journey",
        image: `ipfs://${imageCidString}`,
        attributes: [
          {
            trait_type: "Journey Step",
            value: "Step 4 - NFT Minting"
          },
          {
            trait_type: "Creator",
            value: "SpaceWolf (Pierre Untas)"
          },
          {
            trait_type: "Image Type",
            value: selectedImage.type
          },
          {
            trait_type: "File Size",
            value: `${(selectedImage.size / 1024).toFixed(1)} KB`
          }
        ],
        external_url: "https://github.com/pierreuntas",
        created_at: new Date().toISOString()
      };

      const metadataJson = JSON.stringify(metadata, null, 2);
      const encoder = new TextEncoder();
      const metadataData = encoder.encode(metadataJson);

      // Step 3: Upload metadata to IPFS
      const metadataCid = await fs.addBytes(metadataData);
      const metadataCidString = metadataCid.toString();
      setMetadataIpfsCid(metadataCidString);
      
      // Save to localStorage
      localStorage.setItem('spacewolf-nft-image-cid', imageCidString);
      localStorage.setItem('spacewolf-nft-metadata-cid', metadataCidString);
      localStorage.setItem('spacewolf-nft-metadata', metadataJson);
      
      console.log('Metadata uploaded to IPFS:', metadataCidString);
      console.log('Complete metadata:', metadata);
      
    } catch (err: unknown) {
      console.error('Failed to upload to IPFS:', err);
      setError('Failed to upload image and metadata to IPFS');
    } finally {
      setIsUploadingToIpfs(false);
    }
  };

  // Simulate NFT minting transaction
  const simulateMintTransaction = async () => {
    if (!metadataIpfsCid) {
      setError('Please upload image and metadata to IPFS first');
      return;
    }

    setIsSimulatingTransaction(true);
    setError(null);

    try {
      // Common ERC721 contract on Sepolia testnet (OpenZeppelin standard)
      // This is a commonly deployed contract for testing purposes
      const contractAddress = '0x1234567890123456789012345678901234567890'; // Replace with actual deployed contract

      // Create IPFS URI for the metadata
      const ipfsUri = `ipfs://${metadataIpfsCid}`;
      
      // For simulation, we'll create a realistic transaction hash
      // In a real implementation, you would call the actual contract
      const mockTransactionHash = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Simulate transaction delay and network interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransactionHash(mockTransactionHash);
      
      // Save transaction details to localStorage
      const transactionData = {
        hash: mockTransactionHash,
        contractAddress: contractAddress,
        metadataUri: ipfsUri,
        imageCid: imageIpfsCid,
        metadataCid: metadataIpfsCid,
        timestamp: new Date().toISOString(),
        network: 'sepolia'
      };
      
      localStorage.setItem('spacewolf-nft-tx-hash', mockTransactionHash);
      localStorage.setItem('spacewolf-nft-transaction', JSON.stringify(transactionData));
      
      console.log('Simulated transaction:', transactionData);
      console.log('Metadata URI:', ipfsUri);
      
      // 🎮 GAMIFICATION: Level up et récompense SW
      levelUp('NFT Minted');
      setGameStats(prev => ({ ...prev, nftsMinted: prev.nftsMinted + 1 }));
      
    } catch (err: unknown) {
      console.error('Failed to simulate transaction:', err);
      setError('Failed to simulate minting transaction');
    } finally {
      setIsSimulatingTransaction(false);
    }
  };

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedImageCid = localStorage.getItem('spacewolf-nft-image-cid');
    const savedMetadataCid = localStorage.getItem('spacewolf-nft-metadata-cid');
    const savedTxHash = localStorage.getItem('spacewolf-nft-tx-hash');
    const savedProfilePicture = localStorage.getItem('spacewolf-profile-picture');
    const savedUsingNftProfile = localStorage.getItem('spacewolf-using-nft-profile');
    const savedTransferTxHash = localStorage.getItem('spacewolf-transfer-tx-hash');
    const savedTransferData = localStorage.getItem('spacewolf-transfer-transaction');
    const savedUsernameTxHash = localStorage.getItem('spacewolf-username-tx-hash');
    const savedUsernameData = localStorage.getItem('spacewolf-username-data');
    const savedHasSentEth = localStorage.getItem('spacewolf-has-sent-eth');
    const savedBoughtRealEth = localStorage.getItem('spacewolf-bought-real-eth');
    const savedEthPurchaseData = localStorage.getItem('spacewolf-eth-purchase-data');
    const savedSecurityCompleted = localStorage.getItem('spacewolf-security-completed');
    const savedSecurityData = localStorage.getItem('spacewolf-security-data');
    const savedDeFiCompleted = localStorage.getItem('spacewolf-defi-completed');
    const savedDeFiData = localStorage.getItem('spacewolf-defi-data');
    const savedL2Completed = localStorage.getItem('spacewolf-l2-completed');
    const savedL2Data = localStorage.getItem('spacewolf-l2-data');
    const savedNFTMarketplaceCompleted = localStorage.getItem('spacewolf-nft-marketplace-completed');
    const savedNFTMarketplaceData = localStorage.getItem('spacewolf-nft-marketplace-data');
    const savedDAOGovernanceCompleted = localStorage.getItem('spacewolf-dao-governance-completed');
    const savedDAOGovernanceData = localStorage.getItem('spacewolf-dao-governance-data');
    const savedWeb3SocialCompleted = localStorage.getItem('spacewolf-web3-social-completed');
    const savedWeb3SocialData = localStorage.getItem('spacewolf-web3-social-data');
    const savedWeb3DevelopmentCompleted = localStorage.getItem('spacewolf-web3-development-completed');
    const savedWeb3DevelopmentData = localStorage.getItem('spacewolf-web3-development-data');
    const savedTradingAnalyticsCompleted = localStorage.getItem('spacewolf-trading-analytics-completed');
    const savedTradingAnalyticsData = localStorage.getItem('spacewolf-trading-analytics-data');
    const savedGamingMetaverseCompleted = localStorage.getItem('spacewolf-gaming-metaverse-completed');
    const savedGamingMetaverseData = localStorage.getItem('spacewolf-gaming-metaverse-data');
    
    if (savedImageCid) setImageIpfsCid(savedImageCid);
    if (savedMetadataCid) setMetadataIpfsCid(savedMetadataCid);
    if (savedTxHash) setTransactionHash(savedTxHash);
    if (savedProfilePicture) setProfilePicture(savedProfilePicture);
    if (savedUsingNftProfile === 'true') setIsUsingNftAsProfile(true);
    if (savedTransferTxHash) setTransferTransactionHash(savedTransferTxHash);
    if (savedUsernameTxHash) setUsernameTransactionHash(savedUsernameTxHash);
    if (savedHasSentEth === 'true') setHasUserSentEth(true);
    if (savedBoughtRealEth === 'true') setHasBoughtRealEth(true);
    if (savedSecurityCompleted === 'true') setHasCompletedSecurity(true);
    if (savedDeFiCompleted === 'true') setHasCompletedDeFi(true);
    if (savedL2Completed === 'true') setHasCompletedL2(true);
    if (savedNFTMarketplaceCompleted === 'true') setHasCompletedNFTMarketplace(true);
    if (savedDAOGovernanceCompleted === 'true') setHasCompletedDAOGovernance(true);
    if (savedWeb3SocialCompleted === 'true') setHasCompletedWeb3Social(true);
    if (savedWeb3DevelopmentCompleted === 'true') setHasCompletedWeb3Development(true);
    if (savedTradingAnalyticsCompleted === 'true') setHasCompletedTradingAnalytics(true);
    if (savedGamingMetaverseCompleted === 'true') setHasCompletedGamingMetaverse(true);
    
    // Load transfer data to determine if it was a real transfer
    if (savedTransferData) {
      try {
        const transferData = JSON.parse(savedTransferData);
        if (transferData.isRealTransfer) {
          setIsRealTransfer(true);
        }
      } catch (err) {
        console.error('Failed to parse transfer data:', err);
      }
    }
    
    // Load username data
    if (savedUsernameData) {
      try {
        const usernameData = JSON.parse(savedUsernameData);
        if (usernameData.username) {
          setRegisteredUsername(usernameData.username);
        }
      } catch (err) {
        console.error('Failed to parse username data:', err);
      }
    }
    
    // Load ETH purchase data
    if (savedEthPurchaseData) {
      try {
        const purchaseData = JSON.parse(savedEthPurchaseData);
        if (purchaseData.exchange) {
          setSelectedExchange(purchaseData.exchange);
        }
        if (purchaseData.amount) {
          setEthPurchaseAmount(purchaseData.amount);
        }
      } catch (err) {
        console.error('Failed to parse ETH purchase data:', err);
      }
    }
    
    // Load security data
    if (savedSecurityData) {
      try {
        const securityData = JSON.parse(savedSecurityData);
        if (securityData.hardwareWallet) {
          setSelectedHardwareWallet(securityData.hardwareWallet);
        }
        if (securityData.backedUpSeedPhrase) {
          setHasBackedUpSeedPhrase(securityData.backedUpSeedPhrase);
        }
        if (securityData.setUpMultisig) {
          setHasSetUpMultisig(securityData.setUpMultisig);
        }
        if (securityData.notes) {
          setSecurityNotes(securityData.notes);
        }
      } catch (err) {
        console.error('Failed to parse security data:', err);
      }
    }
    
    // Load DeFi data
    if (savedDeFiData) {
      try {
        const defiData = JSON.parse(savedDeFiData);
        if (defiData.protocol) {
          setSelectedDeFiProtocol(defiData.protocol);
        }
        if (defiData.activity) {
          setDefiActivity(defiData.activity);
        }
        if (defiData.yieldFarming) {
          setHasExploredYieldFarming(defiData.yieldFarming);
        }
        if (defiData.staking) {
          setHasExploredStaking(defiData.staking);
        }
        if (defiData.lending) {
          setHasExploredLending(defiData.lending);
        }
        if (defiData.notes) {
          setDefiNotes(defiData.notes);
        }
      } catch (err) {
        console.error('Failed to parse DeFi data:', err);
      }
    }
    
    // Load L2 data
    if (savedL2Data) {
      try {
        const l2Data = JSON.parse(savedL2Data);
        if (l2Data.network) {
          setSelectedL2Network(l2Data.network);
        }
        if (l2Data.activity) {
          setL2Activity(l2Data.activity);
        }
        if (l2Data.bridgedAssets) {
          setHasBridgedAssets(l2Data.bridgedAssets);
        }
        if (l2Data.exploredL2DeFi) {
          setHasExploredL2DeFi(l2Data.exploredL2DeFi);
        }
        if (l2Data.comparedGasFees) {
          setHasComparedGasFees(l2Data.comparedGasFees);
        }
        if (l2Data.notes) {
          setL2Notes(l2Data.notes);
        }
      } catch (err) {
        console.error('Failed to parse L2 data:', err);
      }
    }
    
    // Load NFT Marketplace data
    if (savedNFTMarketplaceData) {
      try {
        const nftMarketplaceData = JSON.parse(savedNFTMarketplaceData);
        if (nftMarketplaceData.marketplace) {
          setSelectedNFTMarketplace(nftMarketplaceData.marketplace);
        }
        if (nftMarketplaceData.activity) {
          setNftMarketplaceActivity(nftMarketplaceData.activity);
        }
        if (nftMarketplaceData.listedNFT) {
          setHasListedNFT(nftMarketplaceData.listedNFT);
        }
        if (nftMarketplaceData.boughtNFT) {
          setHasBoughtNFT(nftMarketplaceData.boughtNFT);
        }
        if (nftMarketplaceData.exploredCollections) {
          setHasExploredCollections(nftMarketplaceData.exploredCollections);
        }
        if (nftMarketplaceData.notes) {
          setNftMarketplaceNotes(nftMarketplaceData.notes);
        }
      } catch (err) {
        console.error('Failed to parse NFT marketplace data:', err);
      }
    }
    
    // Load DAO Governance data
    if (savedDAOGovernanceData) {
      try {
        const daoGovernanceData = JSON.parse(savedDAOGovernanceData);
        if (daoGovernanceData.platform) {
          setSelectedDAOPlatform(daoGovernanceData.platform);
        }
        if (daoGovernanceData.activity) {
          setDaoGovernanceActivity(daoGovernanceData.activity);
        }
        if (daoGovernanceData.joinedDAO) {
          setHasJoinedDAO(daoGovernanceData.joinedDAO);
        }
        if (daoGovernanceData.votedOnProposal) {
          setHasVotedOnProposal(daoGovernanceData.votedOnProposal);
        }
        if (daoGovernanceData.createdProposal) {
          setHasCreatedProposal(daoGovernanceData.createdProposal);
        }
        if (daoGovernanceData.notes) {
          setDaoGovernanceNotes(daoGovernanceData.notes);
        }
      } catch (err) {
        console.error('Failed to parse DAO governance data:', err);
      }
    }
    
    // Load Web3 Social data
    if (savedWeb3SocialData) {
      try {
        const web3SocialData = JSON.parse(savedWeb3SocialData);
        if (web3SocialData.platform) {
          setSelectedWeb3SocialPlatform(web3SocialData.platform);
        }
        if (web3SocialData.activity) {
          setWeb3SocialActivity(web3SocialData.activity);
        }
        if (web3SocialData.createdProfile) {
          setHasCreatedWeb3Profile(web3SocialData.createdProfile);
        }
        if (web3SocialData.connectedIdentity) {
          setHasConnectedWeb3Identity(web3SocialData.connectedIdentity);
        }
        if (web3SocialData.participatedInSocial) {
          setHasParticipatedInSocial(web3SocialData.participatedInSocial);
        }
        if (web3SocialData.notes) {
          setWeb3SocialNotes(web3SocialData.notes);
        }
      } catch (err) {
        console.error('Failed to parse Web3 social data:', err);
      }
    }
    
    // Load Web3 Development data
    if (savedWeb3DevelopmentData) {
      try {
        const web3DevData = JSON.parse(savedWeb3DevelopmentData);
        if (web3DevData.platform) {
          setSelectedDevPlatform(web3DevData.platform);
        }
        if (web3DevData.activity) {
          setWeb3DevActivity(web3DevData.activity);
        }
        if (web3DevData.writtenSmartContract) {
          setHasWrittenSmartContract(web3DevData.writtenSmartContract);
        }
        if (web3DevData.deployedContract) {
          setHasDeployedContract(web3DevData.deployedContract);
        }
        if (web3DevData.builtDApp) {
          setHasBuiltDApp(web3DevData.builtDApp);
        }
        if (web3DevData.notes) {
          setWeb3DevNotes(web3DevData.notes);
        }
      } catch (err) {
        console.error('Failed to parse Web3 development data:', err);
      }
    }
    
    // Load Trading Analytics data
    if (savedTradingAnalyticsData) {
      try {
        const tradingAnalyticsData = JSON.parse(savedTradingAnalyticsData);
        if (tradingAnalyticsData.platform) {
          setSelectedTradingPlatform(tradingAnalyticsData.platform);
        }
        if (tradingAnalyticsData.activity) {
          setTradingAnalyticsActivity(tradingAnalyticsData.activity);
        }
        if (tradingAnalyticsData.executedAdvancedTrade) {
          setHasExecutedAdvancedTrade(tradingAnalyticsData.executedAdvancedTrade);
        }
        if (tradingAnalyticsData.usedAnalyticsTools) {
          setHasUsedAnalyticsTools(tradingAnalyticsData.usedAnalyticsTools);
        }
        if (tradingAnalyticsData.optimizedYield) {
          setHasOptimizedYield(tradingAnalyticsData.optimizedYield);
        }
        if (tradingAnalyticsData.notes) {
          setTradingAnalyticsNotes(tradingAnalyticsData.notes);
        }
      } catch (err) {
        console.error('Failed to parse trading analytics data:', err);
      }
    }
    
    // Load Gaming Metaverse data
    if (savedGamingMetaverseData) {
      try {
        const gamingMetaverseData = JSON.parse(savedGamingMetaverseData);
        if (gamingMetaverseData.platform) {
          setSelectedGamingPlatform(gamingMetaverseData.platform);
        }
        if (gamingMetaverseData.activity) {
          setGamingMetaverseActivity(gamingMetaverseData.activity);
        }
        if (gamingMetaverseData.playedToEarn) {
          setHasPlayedToEarn(gamingMetaverseData.playedToEarn);
        }
        if (gamingMetaverseData.ownedMetaverseLand) {
          setHasOwnedMetaverseLand(gamingMetaverseData.ownedMetaverseLand);
        }
        if (gamingMetaverseData.participatedInVirtualWorld) {
          setHasParticipatedInVirtualWorld(gamingMetaverseData.participatedInVirtualWorld);
        }
        if (gamingMetaverseData.notes) {
          setGamingMetaverseNotes(gamingMetaverseData.notes);
        }
      } catch (err) {
        console.error('Failed to parse gaming metaverse data:', err);
      }
    }
    
    // Check if user has sent ETH to any address (from transaction history)
    if (account && network === 'sepolia') {
      checkUserTransactionHistory();
    }
  }, [account, chainId, checkUserTransactionHistory]);

  // Initialiser le composant
  useEffect(() => {
    setMounted(true);
    // 🎮 Charger les stats de jeu
    loadGameStats();
  }, []);

  // Effacer les erreurs automatiquement
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Effacer après 5 secondes
      
      return () => clearTimeout(timer);
    }
  }, [error]);


  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      {/* 🎮 ANIMATIONS DE JEU */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-lg shadow-2xl animate-bounce text-2xl font-bold">
            🎉 LEVEL UP! 🎉
            <div className="text-center text-lg mt-2">Niveau {playerLevel}!</div>
            <div className="text-center text-sm mt-1 opacity-90">{getCurrentStep().name}</div>
          </div>
        </div>
      )}
      
      {showClaimAnimation && (
        <div className="fixed top-20 right-20 z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            +{swClaimedAmount} SW 🪙
          </div>
        </div>
      )}
      
      {mounted && (
        <div className="fixed top-4 right-4 z-50">
          <div
            onClick={undefined}
            role={undefined}
            className={`flex items-center gap-2 rounded-md border border-gray-200 bg-white/80 backdrop-blur px-3 py-2 shadow-sm text-xs sm:text-sm cursor-default`}
            aria-label={'Wallet balance'}
          >
            {/* ETH logo */}
            <svg width="16" height="16" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
              <path fill="#343434" d="M127.9 0L125.2 9.3v274.6l2.7 2.7 127.9-75.5z"/>
              <path fill="#8C8C8C" d="M127.9 0L0 211.1l127.9 75.5V154.2z"/>
              <path fill="#3C3C3B" d="M127.9 312.6l-1.5 1.8v100.6l1.5 2.9 128-180.3z"/>
              <path fill="#8C8C8C" d="M127.9 418v-105.4L0 237.6z"/>
              <path fill="#141414" d="M127.9 286.6l127.9-75.5-127.9-57.8z"/>
              <path fill="#393939" d="M0 211.1l127.9 75.5v-133.3z"/>
            </svg>
            <div className="flex items-center gap-2">
              {account ? (
                <>
                  {profilePicture && (
                    <Image
                      src={profilePicture}
                      alt="Profile"
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full border border-gray-300 object-cover"
                    />
                  )}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-900 font-semibold">Ξ {balanceEth ?? '...'}</span>
                      <button 
                        onClick={refreshBalance}
                        disabled={loading || !network}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={!network ? "Sélectionnez d'abord un réseau" : "Rafraîchir le solde"}
                      >
                        {loading ? '⏳' : '🔄'}
                      </button>
                    </div>
                    {registeredUsername && (
                      <span className="text-xs text-purple-600 font-medium">
                        {registeredUsername}.eth
                      </span>
                    )}
                    
                    {/* 🎮 HUD DE JEU */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
                        <span className="font-bold">LVL {playerLevel}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                        <span className="text-white">🪙</span>
                        <span className="font-medium">{swBalance} SW</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Générer un wallet</span>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-[16px] row-start-2 items-center sm:items-start w-full max-w-7xl">
        <div className="flex flex-col gap-[16px] items-center sm:items-start lg:flex-1">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-center sm:text-left">
            SPACEWOLF JOURNEY
          </h1>
          {registeredUsername && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-purple-600">🌐</span>
              <span className="text-lg font-semibold text-purple-800">
                {registeredUsername}.eth
              </span>
              <span className="text-sm text-purple-600">Web3 Identity</span>
            </div>
          )}
          <p className="text-lg sm:text-xl text-center sm:text-left">
            Hi, I'm SpaceWolf, a human known as Pierre Untas, who wants to share his love for Web3. Programming as a C# web developer, I'm learning Solidity and stuff about blockchain at Alyra. Welcome home, feel free to travel around my GitHub projects.
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-center sm:text-left opacity-95 pt-2">
            Discover Web3 step by step!
          </p>
          {mounted && (
            <>
              {/* Interface de connexion sécurisée */}
              <SecureWalletUI
                onWalletConnected={handleSecureWalletConnected}
                onWalletDisconnected={handleSecureWalletDisconnected}
              />
              <div className="mt-4">
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 1</span>
                  <span className="align-middle">Générer un wallet Ethereum avec clé privée.</span>
                  {isStep1Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="wallet-generated">
                    ✓
                  </span>
                )}
              </p>
                
                {/* 🎮 PANEL DE JEU */}
                <div className="mt-4 p-6 border border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                      🎮 SpaceWolf Journey
                      <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                        Level {playerLevel}
                      </span>
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">SW Tokens</div>
                      <div className="text-lg font-bold text-yellow-600">{swBalance} 🪙</div>
                    </div>
                  </div>
                  
                  {/* Étape actuelle */}
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Étape Actuelle</div>
                    <div className="text-lg font-bold text-purple-700">{getCurrentStep().name}</div>
                    <div className="text-sm text-gray-600">{getCurrentStep().description}</div>
                  </div>
                  
                  {/* Étape suivante */}
                  {getNextStep() && (
                    <div className="mb-4 p-3 bg-white/50 rounded-lg border-2 border-dashed border-purple-300">
                      <div className="text-sm text-gray-600 mb-1">Prochaine Étape</div>
                      <div className="text-lg font-bold text-purple-700">{getNextStep()?.name}</div>
                      <div className="text-sm text-gray-600">{getNextStep()?.description}</div>
                      <div className="text-xs text-yellow-600 mt-1">
                        🪙 Récompense: {getNextStep()?.swReward} SW tokens
                      </div>
                    </div>
                  )}
                  
                  {/* Système de Claim SW Tokens */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-sm font-semibold text-yellow-800">SW Tokens Disponibles</div>
                        <div className="text-xs text-gray-600">Gagnés en complétant les étapes</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-600">{getAvailableSW()} 🪙</div>
                      </div>
                    </div>
                    {getAvailableSW() > 0 && (
                      <button 
                        onClick={() => claimSW(getAvailableSW())}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                      >
                        🪙 Claim {getAvailableSW()} SW Tokens
                      </button>
                    )}
                    {getAvailableSW() === 0 && (
                      <div className="text-center text-gray-500 text-sm">
                        Complétez des étapes pour gagner plus de tokens SW !
                      </div>
                    )}
                    
                    {/* Correction pour le niveau 5 */}
                    {playerLevel === 5 && swClaimed === 1000 && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                        ⚠️ Vous avez déjà claimé tous les tokens SW disponibles pour les niveaux 1-5.
                        <br />Progressez au niveau 6 pour débloquer de nouveaux tokens !
                      </div>
                    )}
                  </div>
                  
                  {/* Statistiques de jeu */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Transactions</div>
                      <div className="text-lg font-bold text-green-600">{gameStats.transactionsCompleted}</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">NFTs Mintés</div>
                      <div className="text-lg font-bold text-blue-600">{gameStats.nftsMinted}</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Réseaux</div>
                      <div className="text-lg font-bold text-orange-600">{gameStats.networksSwitched}</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Achievements</div>
                      <div className="text-lg font-bold text-yellow-600">{achievements.length}</div>
                    </div>
                  </div>
                  
                  {/* Achievements récents */}
                  {achievements.length > 0 && (
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">🏆 Achievements Récents</div>
                      <div className="flex flex-wrap gap-2">
                        {achievements.slice(-3).map((achievement, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions de Progression */}
                  {playerLevel >= 5 && (
                    <div className="bg-white/50 p-3 rounded-lg border border-green-200">
                      <div className="text-sm text-gray-600 mb-2">🚀 Actions de Progression</div>
                      <div className="space-y-2">
                        {playerLevel === 5 && (
                          <button 
                            onClick={() => levelUp('Web3 Identity')}
                            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                          >
                            🆔 Créer Identité Web3 (Niveau 6)
                          </button>
                        )}
                        {playerLevel === 6 && (
                          <button 
                            onClick={() => levelUp('Real ETH')}
                            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                          >
                            💰 Acheter de Vrais ETH (Niveau 7)
                          </button>
                        )}
                        {playerLevel === 7 && (
                          <button 
                            onClick={() => levelUp('Advanced Security')}
                            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                          >
                            🔒 Maîtriser la Sécurité (Niveau 8)
                          </button>
                        )}
                        {playerLevel === 8 && (
                          <button 
                            onClick={() => levelUp('DeFi Explorer')}
                            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                          >
                            🏦 Explorer la DeFi (Niveau 9)
                          </button>
                        )}
                        {playerLevel === 9 && (
                          <button 
                            onClick={() => levelUp('Web3 Master')}
                            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                          >
                            👑 Devenir Maître Web3 (Niveau 10)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                </div>

              </div>
              <div className="mt-4">
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 2</span>
                  <span className="align-middle">Sélectionner un réseau Ethereum.</span>
                {isStep2Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="on-sepolia">
                    ✓
                  </span>
                )}
              </p>
                
                {/* Step 2: Network Configuration */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 2: Configuration du Réseau</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-2">
                        Sélectionnez un réseau Ethereum pour vos transactions. Nous recommandons Testnet pour les tests :
                      </p>
                      <div className="flex gap-2">
                        <button 
                          className={`px-3 py-2 rounded text-sm ${network === 'mainnet' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => switchNetwork('mainnet')}
                        >
                          🏠 Mainnet
                        </button>
                        <button 
                          className={`px-3 py-2 rounded text-sm ${network === 'sepolia' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => switchNetwork('sepolia')}
                        >
                          🧪 Testnet (Recommandé)
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Cliquez sur Testnet pour les tests ou Mainnet pour les transactions réelles
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations du wallet */}
              {isConnected && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Informations du Wallet</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Adresse:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{address}</span>
                        <button 
                          onClick={() => copyToClipboard(address)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Solde:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{balance} ETH</span>
                        <button 
                          onClick={refreshBalance}
                          disabled={loading || !network}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={!network ? "Sélectionnez d'abord un réseau" : "Rafraîchir le solde"}
                        >
                          {loading ? '⏳' : '🔄'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Réseau:</span>
                      <div className="flex gap-2">
                        <button 
                          className={`px-2 py-1 rounded text-xs ${network === 'mainnet' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => switchNetwork('mainnet')}
                        >
                          🏠 Mainnet
                        </button>
                        <button 
                          className={`px-2 py-1 rounded text-xs ${network === 'sepolia' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => switchNetwork('sepolia')}
                        >
                          🧪 Sepolia
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4">
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 3</span>
                <span className="align-middle">Get Sepolia ETH for testing.</span>
                {isStep3Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="has-sepolia-eth">
                    ✓
                  </span>
                )}
              </p>
                
                {/* Step 3: Get Sepolia ETH */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 3: Obtenir des ETH Sepolia</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Pour tester les transactions, vous avez besoin d'ETH Sepolia (gratuit) :
                      </p>
                      <div className="flex items-center gap-4">
                  <button
                    onClick={copyAddressToClipboard}
                    className="px-3 py-2 rounded-md bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 transition cursor-pointer text-sm"
                  >
                    {copiedAddress ? 'Copied!' : 'Copy Address'}
                  </button>
                  <a
                    href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 transition cursor-pointer text-sm"
                  >
                    Get Sepolia ETH
                  </a>
                </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Copiez votre adresse et utilisez le faucet pour obtenir des ETH de test gratuits
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 4</span>
                  <span className="align-middle">Mint an NFT with IPFS metadata.</span>
                  {isStep4Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="nft-minted">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 4: NFT Minting */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 4: Mint Your NFT</h3>
                  
                  <div className="space-y-4">
                    {/* IPFS Node Status */}
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">IPFS Node Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isIpfsNodeRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isIpfsNodeRunning ? 'Running' : 'Not Running'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        A local IPFS node is required to upload metadata. Click &quot;Start IPFS Node&quot; to initialize.
                      </p>
                      <button
                        onClick={startIpfsNode}
                        disabled={isIpfsNodeRunning}
                        className="px-3 py-1 rounded-md bg-purple-600 text-white border border-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                      >
                        {isIpfsNodeRunning ? 'Node Running' : 'Start IPFS Node'}
                      </button>
                    </div>

                    <div>
                      <label htmlFor="nft-image" className="block text-sm font-medium text-gray-700 mb-2">
                        Select NFT Image
                      </label>
                      <input
                        type="file"
                        id="nft-image"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, GIF, WebP (max 10MB)
                      </p>
                      
                      {imagePreview && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                          <div className="border border-gray-200 rounded-md p-2 bg-white">
                            <Image
                              src={imagePreview}
                              alt="NFT Preview"
                              width={400}
                              height={192}
                              className="max-w-full max-h-48 mx-auto rounded-md"
                            />
                            {selectedImage && (
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
                              </p>
                            )}
                          </div>
                          
                          {/* Profile Picture Status */}
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Image
                                  src={imagePreview}
                                  alt="Profile Preview"
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                                />
                                <span className="text-sm font-medium text-blue-800">
                                  Automatically set as profile picture
                                </span>
                              </div>
                              <div className="flex gap-2 ml-auto">
                                <button
                                  onClick={setNftAsProfilePicture}
                                  disabled={isUsingNftAsProfile}
                                  className="px-2 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUsingNftAsProfile ? 'Active' : 'Set as Profile'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={uploadToIpfs}
                        disabled={!selectedImage || !isIpfsNodeRunning || isUploadingToIpfs}
                        className="flex-1 px-4 py-2 rounded-md bg-purple-600 text-white border border-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        {isUploadingToIpfs ? 'Uploading...' : 'Upload to IPFS'}
                      </button>
                      <button
                        onClick={simulateMintTransaction}
                        disabled={!imageIpfsCid || isSimulatingTransaction}
                        className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        {isSimulatingTransaction ? 'Minting...' : 'Mint NFT'}
                      </button>
                    </div>
                    
                    {imageIpfsCid && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm font-medium text-green-800 mb-1">✅ Image uploaded to IPFS!</p>
                        <p className="text-xs text-green-600">CID: {imageIpfsCid}</p>
                      </div>
                    )}
                    
                    {transactionHash && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-800 mb-1">🎉 NFT Minted Successfully!</p>
                        <p className="text-xs text-blue-600">Transaction Hash: {transactionHash}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 5</span>
                  <span className="align-middle">Send ETH to a friend's address.</span>
                  {isStep5Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="eth-sent">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 5: ETH Transfer */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 5: Envoyer des ETH à un Ami</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Testez l'envoi d'ETH à une adresse amie (vous pouvez utiliser votre propre adresse pour tester) :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="friend-address" className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse de destination
                          </label>
                          <input
                            type="text"
                            id="friend-address"
                            placeholder="0x..."
                            value={friendAddress}
                            onChange={(e) => setFriendAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="eth-amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Montant en ETH
                          </label>
                          <input
                            type="number"
                            id="eth-amount"
                            step="0.001"
                            placeholder="0.001"
                            value={ethAmount}
                            onChange={(e) => setEthAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={sendEthTransfer}
                            disabled={!friendAddress || !ethAmount || isSimulatingTransfer}
                            className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            {isSimulatingTransfer ? 'Envoi...' : 'Envoyer ETH'}
                          </button>
                          <button
                            onClick={() => setFriendAddress(address || '')}
                            className="px-3 py-2 rounded-md bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 transition cursor-pointer text-sm"
                          >
                            Utiliser mon adresse
                          </button>
                        </div>
                        {transferTransactionHash && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ ETH envoyés avec succès !</p>
                            <p className="text-xs text-green-600">Transaction Hash: {transferTransactionHash}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 6</span>
                  <span className="align-middle">Create a Web3 username (.eth domain).</span>
                  {isStep6Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="username-created">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 6: Web3 Username */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 6: Créer un Nom Web3</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Créez votre identité Web3 avec un nom de domaine .eth :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="web3-username" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom d'utilisateur Web3
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              id="web3-username"
                              placeholder="monnom"
                              value={web3Username}
                              onChange={(e) => setWeb3Username(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            />
                            <span className="text-gray-500">.eth</span>
                          </div>
                        </div>
                        <button
                          onClick={registerWeb3Username}
                          disabled={!web3Username || isRegisteringUsername}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          {isRegisteringUsername ? 'Enregistrement...' : 'Enregistrer le nom'}
                        </button>
                        {usernameTransactionHash && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Nom Web3 enregistré !</p>
                            <p className="text-xs text-green-600">Transaction Hash: {usernameTransactionHash}</p>
                            {registeredUsername && (
                        <p className="text-xs text-green-600 mt-1">
                                Votre nom: <strong>{registeredUsername}.eth</strong>
                        </p>
                            )}
                      </div>
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 7</span>
                  <span className="align-middle">Buy real ETH from a cryptocurrency exchange.</span>
                  {isStep7Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="eth-purchased">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 7: Buy Real ETH */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 7: Acheter des ETH Réels</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Achetez des ETH réels sur une plateforme d'échange :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="exchange-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Plateforme d'échange
                          </label>
                          <select
                            id="exchange-select"
                            value={selectedExchange}
                            onChange={(e) => setSelectedExchange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une plateforme</option>
                            <option value="coinbase">Coinbase</option>
                            <option value="binance">Binance</option>
                            <option value="kraken">Kraken</option>
                            <option value="kucoin">KuCoin</option>
                            <option value="bybit">Bybit</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="eth-amount-purchase" className="block text-sm font-medium text-gray-700 mb-1">
                            Montant à acheter (ETH)
                          </label>
                          <input
                            type="number"
                            id="eth-amount-purchase"
                            step="0.01"
                            placeholder="0.1"
                            value={ethPurchaseAmount}
                            onChange={(e) => setEthPurchaseAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => setHasBoughtRealEth(true)}
                          disabled={!selectedExchange || !ethPurchaseAmount}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Simulation...
                        </button>
                        {hasBoughtRealEth && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Achat d'ETH simulé !</p>
                            <p className="text-xs text-green-600">
                              {ethPurchaseAmount} ETH sur {selectedExchange}
                        </p>
                      </div>
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 8</span>
                  <span className="align-middle">Set up advanced security with hardware wallets.</span>
                  {isStep8Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="security-setup">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 8: Advanced Security */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 8: Sécurité Avancée</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Configurez une sécurité avancée pour protéger vos actifs :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="hardware-wallet" className="block text-sm font-medium text-gray-700 mb-1">
                            Portefeuille matériel
                          </label>
                          <select
                            id="hardware-wallet"
                            value={selectedHardwareWallet}
                            onChange={(e) => setSelectedHardwareWallet(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez un portefeuille</option>
                            <option value="ledger">Ledger Nano S/X</option>
                            <option value="trezor">Trezor Model T</option>
                            <option value="keepkey">KeepKey</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasBackedUpSeedPhrase}
                              onChange={(e) => setHasBackedUpSeedPhrase(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai sauvegardé ma phrase de récupération</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasSetUpMultisig}
                              onChange={(e) => setHasSetUpMultisig(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai configuré un multisig</span>
                          </label>
                        </div>
                        <div>
                          <label htmlFor="security-notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes de sécurité
                          </label>
                          <textarea
                            id="security-notes"
                            placeholder="Notes sur votre configuration de sécurité..."
                            value={securityNotes}
                            onChange={(e) => setSecurityNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => setHasCompletedSecurity(true)}
                          disabled={!selectedHardwareWallet}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter la sécurité
                        </button>
                        {hasCompletedSecurity && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Sécurité configurée !</p>
                            <p className="text-xs text-green-600">
                              Portefeuille: {selectedHardwareWallet}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 9</span>
                  <span className="align-middle">Explore DeFi: yield farming, staking, and lending.</span>
                  {isStep9Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="defi-exploration">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 9: DeFi Exploration */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 9: Explorer DeFi</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Explorez les protocoles DeFi : yield farming, staking et lending :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="defi-protocol" className="block text-sm font-medium text-gray-700 mb-1">
                            Protocole DeFi
                          </label>
                          <select
                            id="defi-protocol"
                            value={selectedDeFiProtocol}
                            onChange={(e) => setSelectedDeFiProtocol(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez un protocole</option>
                            <option value="uniswap">Uniswap</option>
                            <option value="compound">Compound</option>
                            <option value="aave">Aave</option>
                            <option value="yearn">Yearn Finance</option>
                            <option value="curve">Curve Finance</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="defi-activity" className="block text-sm font-medium text-gray-700 mb-1">
                            Activité DeFi
                          </label>
                          <select
                            id="defi-activity"
                            value={defiActivity}
                            onChange={(e) => setDefiActivity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une activité</option>
                            <option value="liquidity">Fournir de la liquidité</option>
                            <option value="swap">Échanger des tokens</option>
                            <option value="lend">Prêter des actifs</option>
                            <option value="borrow">Emprunter des actifs</option>
                            <option value="stake">Staker des tokens</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasExploredYieldFarming}
                              onChange={(e) => setHasExploredYieldFarming(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai exploré le yield farming</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasExploredStaking}
                              onChange={(e) => setHasExploredStaking(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai exploré le staking</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasExploredLending}
                              onChange={(e) => setHasExploredLending(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai exploré le lending</span>
                          </label>
                        </div>
                        <div>
                          <label htmlFor="defi-notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes DeFi
                          </label>
                          <textarea
                            id="defi-notes"
                            placeholder="Notes sur votre exploration DeFi..."
                            value={defiNotes}
                            onChange={(e) => setDefiNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => setHasCompletedDeFi(true)}
                          disabled={!selectedDeFiProtocol || !defiActivity}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter l'exploration DeFi
                        </button>
                        {hasCompletedDeFi && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ DeFi exploré !</p>
                            <p className="text-xs text-green-600">
                              Protocole: {selectedDeFiProtocol} - Activité: {defiActivity}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 10</span>
                  <span className="align-middle">Bridge to Layer 2: Polygon, Arbitrum, and low-fee DeFi.</span>
                  {isStep10Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="l2-exploration">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 10: Layer 2 Exploration */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 10: Explorer Layer 2</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Explorez les réseaux Layer 2 pour des frais réduits :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="l2-network" className="block text-sm font-medium text-gray-700 mb-1">
                            Réseau Layer 2
                          </label>
                          <select
                            id="l2-network"
                            value={selectedL2Network}
                            onChange={(e) => setSelectedL2Network(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez un réseau L2</option>
                            <option value="polygon">Polygon</option>
                            <option value="arbitrum">Arbitrum</option>
                            <option value="optimism">Optimism</option>
                            <option value="base">Base</option>
                            <option value="zksync">zkSync Era</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="l2-activity" className="block text-sm font-medium text-gray-700 mb-1">
                            Activité L2
                          </label>
                          <select
                            id="l2-activity"
                            value={l2Activity}
                            onChange={(e) => setL2Activity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une activité</option>
                            <option value="bridge">Bridger des actifs</option>
                            <option value="defi">Utiliser DeFi L2</option>
                            <option value="nft">Minter des NFTs</option>
                            <option value="swap">Échanger des tokens</option>
                            <option value="stake">Staker sur L2</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasBridgedAssets}
                              onChange={(e) => setHasBridgedAssets(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai bridgé des actifs</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasExploredL2DeFi}
                              onChange={(e) => setHasExploredL2DeFi(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai exploré DeFi L2</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasComparedGasFees}
                              onChange={(e) => setHasComparedGasFees(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai comparé les frais de gas</span>
                          </label>
                        </div>
                        <div>
                          <label htmlFor="l2-notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes L2
                          </label>
                          <textarea
                            id="l2-notes"
                            placeholder="Notes sur votre exploration L2..."
                            value={l2Notes}
                            onChange={(e) => setL2Notes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => setHasCompletedL2(true)}
                          disabled={!selectedL2Network || !l2Activity}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter l'exploration L2
                        </button>
                        {hasCompletedL2 && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ L2 exploré !</p>
                            <p className="text-xs text-green-600">
                              Réseau: {selectedL2Network} - Activité: {l2Activity}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 11</span>
                  <span className="align-middle">Master NFT marketplaces: list, buy, and trade NFTs.</span>
                  {isStep11Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="nft-marketplace">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 11: NFT Marketplace */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 11: Marketplaces NFT</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Maîtrisez les marketplaces NFT : listez, achetez et échangez :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="nft-marketplace" className="block text-sm font-medium text-gray-700 mb-1">
                            Marketplace NFT
                          </label>
                          <select
                            id="nft-marketplace"
                            value={selectedNFTMarketplace}
                            onChange={(e) => setSelectedNFTMarketplace(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une marketplace</option>
                            <option value="opensea">OpenSea</option>
                            <option value="blur">Blur</option>
                            <option value="looksrare">LooksRare</option>
                            <option value="x2y2">X2Y2</option>
                            <option value="magiceden">Magic Eden</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="nft-marketplace-activity" className="block text-sm font-medium text-gray-700 mb-1">
                            Activité Marketplace
                          </label>
                          <select
                            id="nft-marketplace-activity"
                            value={nftMarketplaceActivity}
                            onChange={(e) => setNftMarketplaceActivity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une activité</option>
                            <option value="list">Lister un NFT</option>
                            <option value="buy">Acheter un NFT</option>
                            <option value="sell">Vendre un NFT</option>
                            <option value="bid">Faire une offre</option>
                            <option value="trade">Échanger des NFTs</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasListedNFT}
                              onChange={(e) => setHasListedNFT(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai listé un NFT</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasBoughtNFT}
                              onChange={(e) => setHasBoughtNFT(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai acheté un NFT</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => {}}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai vendu un NFT</span>
                          </label>
                        </div>
                        <div>
                          <label htmlFor="nft-marketplace-notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes Marketplace
                          </label>
                          <textarea
                            id="nft-marketplace-notes"
                            placeholder="Notes sur votre expérience marketplace..."
                            value={nftMarketplaceNotes}
                            onChange={(e) => setNftMarketplaceNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => setHasCompletedNFTMarketplace(true)}
                          disabled={!selectedNFTMarketplace || !nftMarketplaceActivity}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter l'exploration Marketplace
                        </button>
                        {hasCompletedNFTMarketplace && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Marketplace maîtrisée !</p>
                            <p className="text-xs text-green-600">
                              Marketplace: {selectedNFTMarketplace} - Activité: {nftMarketplaceActivity}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 12</span>
                  <span className="align-middle">Join DAO governance: vote, propose, and shape Web3 communities.</span>
                  {isStep12Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="dao-governance">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 12: DAO Governance */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 12: Gouvernance DAO</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Rejoignez la gouvernance DAO : votez, proposez et façonnez les communautés Web3 :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="dao-platform" className="block text-sm font-medium text-gray-700 mb-1">
                            Plateforme DAO
                          </label>
                          <select
                            id="dao-platform"
                            value={selectedDAOPlatform}
                            onChange={(e) => setSelectedDAOPlatform(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une plateforme</option>
                            <option value="snapshot">Snapshot</option>
                            <option value="aragon">Aragon</option>
                            <option value="colony">Colony</option>
                            <option value="moloch">Moloch DAO</option>
                            <option value="compound">Compound Governance</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => {}}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai voté dans une DAO</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => {}}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai proposé une proposition</span>
                          </label>
                        </div>
                        <button
                          onClick={() => setHasCompletedDAOGovernance(true)}
                          disabled={!selectedDAOPlatform}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter la gouvernance DAO
                        </button>
                        {hasCompletedDAOGovernance && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Gouvernance DAO complétée !</p>
                            <p className="text-xs text-green-600">Plateforme: {selectedDAOPlatform}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 13</span>
                  <span className="align-middle">Build Web3 identity: aggregate profiles and join decentralized social.</span>
                  {isStep13Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="web3-social">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 13: Web3 Social */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 13: Identité Web3 Sociale</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Construisez votre identité Web3 : agrégation de profils et réseaux sociaux décentralisés :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="web3-social-platform" className="block text-sm font-medium text-gray-700 mb-1">
                            Plateforme Web3 Sociale
                          </label>
                          <select
                            id="web3-social-platform"
                            value={selectedWeb3SocialPlatform}
                            onChange={(e) => setSelectedWeb3SocialPlatform(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une plateforme</option>
                            <option value="lens">Lens Protocol</option>
                            <option value="farcaster">Farcaster</option>
                            <option value="mirror">Mirror</option>
                            <option value="gitcoin">Gitcoin Passport</option>
                            <option value="ceramic">Ceramic Network</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasCreatedWeb3Profile}
                              onChange={(e) => setHasCreatedWeb3Profile(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai créé un profil Web3</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => {}}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai rejoint un réseau social décentralisé</span>
                          </label>
                        </div>
                        <button
                          onClick={() => setHasCompletedWeb3Social(true)}
                          disabled={!selectedWeb3SocialPlatform}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter l'identité Web3
                        </button>
                        {hasCompletedWeb3Social && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Identité Web3 construite !</p>
                            <p className="text-xs text-green-600">Plateforme: {selectedWeb3SocialPlatform}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 14</span>
                  <span className="align-middle">Build Web3 dApps: write smart contracts and create decentralized applications.</span>
                  {isStep14Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="web3-development">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 14: Web3 Development */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 14: Développement Web3</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Développez des dApps Web3 : écrivez des smart contracts et créez des applications décentralisées :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="web3-dev-platform" className="block text-sm font-medium text-gray-700 mb-1">
                            Plateforme de Développement
                          </label>
                          <select
                            id="web3-dev-platform"
                            value={selectedDevPlatform}
                            onChange={(e) => setSelectedDevPlatform(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une plateforme</option>
                            <option value="remix">Remix IDE</option>
                            <option value="hardhat">Hardhat</option>
                            <option value="truffle">Truffle</option>
                            <option value="foundry">Foundry</option>
                            <option value="brownie">Brownie</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasWrittenSmartContract}
                              onChange={(e) => setHasWrittenSmartContract(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai écrit un smart contract</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => {}}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai déployé une dApp</span>
                          </label>
                        </div>
                        <button
                          onClick={() => setHasCompletedWeb3Development(true)}
                          disabled={!selectedDevPlatform}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter le développement Web3
                        </button>
                        {hasCompletedWeb3Development && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Développement Web3 complété !</p>
                            <p className="text-xs text-green-600">Plateforme: {selectedDevPlatform}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 15</span>
                  <span className="align-middle">Master advanced trading: DEX strategies, analytics, and yield optimization.</span>
                  {isStep15Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="trading-analytics">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 15: Trading Analytics */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 15: Trading Avancé</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Maîtrisez le trading avancé : stratégies DEX, analytics et optimisation de rendement :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="trading-platform" className="block text-sm font-medium text-gray-700 mb-1">
                            Plateforme de Trading
                          </label>
                          <select
                            id="trading-platform"
                            value={selectedTradingPlatform}
                            onChange={(e) => setSelectedTradingPlatform(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une plateforme</option>
                            <option value="uniswap">Uniswap V3</option>
                            <option value="sushiswap">SushiSwap</option>
                            <option value="curve">Curve Finance</option>
                            <option value="balancer">Balancer</option>
                            <option value="1inch">1inch</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasExecutedAdvancedTrade}
                              onChange={(e) => setHasExecutedAdvancedTrade(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai exécuté un trade avancé</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasUsedAnalyticsTools}
                              onChange={(e) => setHasUsedAnalyticsTools(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai utilisé des outils d'analytics</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasOptimizedYield}
                              onChange={(e) => setHasOptimizedYield(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai optimisé le rendement</span>
                          </label>
                        </div>
                        <button
                          onClick={() => setHasCompletedTradingAnalytics(true)}
                          disabled={!selectedTradingPlatform}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter le trading avancé
                        </button>
                        {hasCompletedTradingAnalytics && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Trading avancé maîtrisé !</p>
                            <p className="text-xs text-green-600">Plateforme: {selectedTradingPlatform}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                  <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 16</span>
                  <span className="align-middle">Master Web3 gaming: play-to-earn, metaverse land, and virtual economies.</span>
                  {isStep16Completed() && (
                    <span className="ml-2 align-middle text-[#6e6289]" aria-label="gaming-metaverse">
                      ✓
                    </span>
                  )}
                </p>
                
                {/* Step 16: Gaming Metaverse */}
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 16: Gaming Web3</h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-md bg-white">
                      <p className="text-sm text-gray-600 mb-3">
                        Maîtrisez le gaming Web3 : play-to-earn, terrains metaverse et économies virtuelles :
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="gaming-platform" className="block text-sm font-medium text-gray-700 mb-1">
                            Plateforme Gaming
                          </label>
                          <select
                            id="gaming-platform"
                            value={selectedGamingPlatform}
                            onChange={(e) => setSelectedGamingPlatform(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          >
                            <option value="">Sélectionnez une plateforme</option>
                            <option value="axie">Axie Infinity</option>
                            <option value="sandbox">The Sandbox</option>
                            <option value="decentraland">Decentraland</option>
                            <option value="cryptokitties">CryptoKitties</option>
                            <option value="stepn">STEPN</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasPlayedToEarn}
                              onChange={(e) => setHasPlayedToEarn(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai joué en play-to-earn</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasOwnedMetaverseLand}
                              onChange={(e) => setHasOwnedMetaverseLand(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai possédé un terrain metaverse</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hasParticipatedInVirtualWorld}
                              onChange={(e) => setHasParticipatedInVirtualWorld(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">J'ai participé à un monde virtuel</span>
                          </label>
                        </div>
                        <button
                          onClick={() => setHasCompletedGamingMetaverse(true)}
                          disabled={!selectedGamingPlatform}
                          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Compléter le gaming Web3
                        </button>
                        {hasCompletedGamingMetaverse && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Gaming Web3 maîtrisé !</p>
                            <p className="text-xs text-green-600">Plateforme: {selectedGamingPlatform}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              
              {/* Step 4 Completed Section */}
              {isStep4Completed() && (
                <div className="mt-6 p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="text-lg font-semibold mb-3 text-green-900">🎉 Step 4 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Image IPFS CID:</strong> {imageIpfsCid}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Your NFT image uploaded to IPFS and saved to localStorage
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Metadata IPFS CID:</strong> {metadataIpfsCid}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        NFT metadata with image reference uploaded to IPFS
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Transaction Hash:</strong> {transactionHash}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Minting transaction simulated successfully
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Metadata URI:</strong> ipfs://{metadataIpfsCid}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        This URI can be used in smart contracts for NFT metadata
                      </p>
                    </div>
                    
                    {isUsingNftAsProfile && (
                      <div className="p-3 bg-white border border-green-200 rounded-md">
                        <div className="flex items-center gap-3">
                          <Image
                            src={profilePicture || ''}
                            alt="Profile Picture"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                          />
                          <div>
                            <p className="text-sm text-green-800 font-medium">
                              Profile Picture Active
                            </p>
                            <p className="text-xs text-green-600">
                              Your NFT image is now your profile picture
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-green-600 mt-2">
                      Your NFT image and metadata have been uploaded to IPFS and the minting transaction has been simulated! 
                      The image is automatically set as your profile picture and all data is saved in localStorage for persistence.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 5 ETH Transfer Section - REMOVED (now integrated above) */}
              {false && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 5: Send ETH to a Friend</h3>
                  
                  {/* Real Transaction Warning */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Real Transaction Warning</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This will send real ETH on Sepolia testnet. Make sure you're on the correct network and have sufficient balance for gas fees.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="friend-address" className="block text-sm font-medium text-gray-700 mb-2">
                        Friend's Ethereum Address
                      </label>
                      <input
                        type="text"
                        id="friend-address"
                        value={friendAddress}
                        onChange={(e) => setFriendAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your friend's Ethereum wallet address
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="eth-amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Amount to Send (ETH)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          id="eth-amount"
                          value={ethAmount}
                          onChange={(e) => setEthAmount(e.target.value)}
                          placeholder="0.01"
                          step="0.001"
                          min="0"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                        <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
                          ETH
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Your balance: Ξ {balanceEth ?? '0'}
                      </p>
                    </div>
                    
                    <button
                      onClick={sendEthTransfer}
                      disabled={isSimulatingTransfer || !friendAddress.trim() || !ethAmount.trim()}
                      className="w-full px-4 py-2 rounded-md bg-orange-600 text-white border border-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      {isSimulatingTransfer ? 'Sending ETH...' : 'Send ETH Transfer'}
                    </button>
                    
                    {transferTransactionHash && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-sm text-orange-800">
                          <strong>Transfer Transaction Hash:</strong> {transferTransactionHash}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          {isRealTransfer ? 'Real ETH transfer completed!' : 'ETH transfer simulated successfully!'} Transaction saved to localStorage.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Step 5 Completed Section */}
              {isStep5Completed() && (
                <div className="mt-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h3 className="text-lg font-semibold mb-3 text-orange-900">🎉 Step 5 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800">
                        <strong>Transfer Transaction Hash:</strong> {transferTransactionHash}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        {isRealTransfer ? 'Real ETH transfer completed on Sepolia!' : 'ETH transfer simulated successfully'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800">
                        <strong>Sent to:</strong> {friendAddress}
                      </p>
                      <p className="text-sm text-orange-800">
                        <strong>Amount:</strong> {ethAmount} ETH
                      </p>
                      {isRealTransfer && transactionReceipt && (
                        <>
                          <p className="text-sm text-orange-800">
                            <strong>Gas Used:</strong> {transactionReceipt.gasUsed.toString()}
                          </p>
                          <p className="text-sm text-orange-800">
                            <strong>Block Number:</strong> {transactionReceipt.blockNumber.toString()}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-orange-600 mt-1">
                        Transfer details saved to localStorage
                      </p>
                    </div>
                    
                    <p className="text-xs text-orange-600 mt-2">
                      Great! You've completed Step 5. Now move on to Step 6 to create your Web3 username and complete the full journey!
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 6 Web3 Username Section */}
              {isStep5Completed() && !isStep6Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 6: Create Your Web3 Username</h3>
                  
                  {/* ENS Information */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 mt-0.5">ℹ️</div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">ENS-like Domain Registration</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Create a Web3 username that demonstrates domain registration concepts. 
                          This creates a real blockchain transaction with your chosen username!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Real Registration Warning */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Real Blockchain Transaction</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This creates a real transaction on Sepolia testnet that demonstrates Web3 username concepts. 
                          Sends 0.000001 ETH to burn address with your username hash. Make sure you have sufficient ETH for gas fees.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="web3-username" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Your Username
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="web3-username"
                          value={web3Username}
                          onChange={(e) => setWeb3Username(e.target.value)}
                          placeholder="myusername"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                        <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
                          .eth
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        3-20 characters, letters, numbers, hyphens, and underscores only
                      </p>
                      {web3Username && !isValidUsername(web3Username) && (
                        <p className="text-xs text-red-500 mt-1">
                          Invalid username format
                        </p>
                      )}
                    </div>
                    
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                      <p className="text-sm text-gray-600">
                        <strong>Domain:</strong> {web3Username ? `${web3Username}.eth` : 'yourname.eth'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Points to:</strong> {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Your wallet address'}
                      </p>
                    </div>
                    
                    <button
                      onClick={registerWeb3Username}
                      disabled={isRegisteringUsername || !web3Username.trim() || !isValidUsername(web3Username)}
                      className="w-full px-4 py-2 rounded-md bg-purple-600 text-white border border-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      {isRegisteringUsername ? 'Registering Username...' : 'Register Web3 Username'}
                    </button>
                    
                    {usernameTransactionHash && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <p className="text-sm text-purple-800">
                          <strong>Registration Transaction Hash:</strong> {usernameTransactionHash}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          ENS-like domain registered on Sepolia! Domain saved to localStorage.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Step 6 Completed Section */}
              {isStep6Completed() && (
                <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h3 className="text-lg font-semibold mb-3 text-purple-900">🎉 Step 6 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-purple-200 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Your Web3 Username:</strong> {registeredUsername}.eth
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        ENS-like domain registered on Sepolia testnet
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white border border-purple-200 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Registration Transaction Hash:</strong> {usernameTransactionHash}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        ENS-like registration completed on blockchain
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white border border-purple-200 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Points to Address:</strong> {account}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Your wallet address is now accessible via {registeredUsername}.eth
                      </p>
                    </div>
                    
                    <p className="text-xs text-purple-600 mt-2">
                      🎊 Congratulations! You've completed Step 6! Now move on to Step 7 to buy real ETH and complete the ultimate Web3 journey!
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 7 Buy Real ETH Section */}
              {isStep6Completed() && !isStep7Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 7: Buy Real ETH</h3>
                  
                  {/* Real ETH Purchase Information */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 mt-0.5">💰</div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Real ETH Purchase</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Now it's time to buy real ETH! Choose a reputable exchange and purchase ETH to complete your Web3 journey.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Important Warning */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Important Considerations</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          • Only invest what you can afford to lose<br/>
                          • Research exchanges thoroughly before using them<br/>
                          • Consider starting with a small amount<br/>
                          • Keep your private keys secure and never share them
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="exchange-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Exchange
                      </label>
                      <select
                        id="exchange-select"
                        value={selectedExchange}
                        onChange={(e) => setSelectedExchange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an exchange...</option>
                        <option value="coinbase">Coinbase</option>
                        <option value="binance">Binance</option>
                        <option value="kraken">Kraken</option>
                        <option value="gemini">Gemini</option>
                        <option value="crypto.com">Crypto.com</option>
                        <option value="other">Other</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a reputable cryptocurrency exchange
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="eth-amount-purchase" className="block text-sm font-medium text-gray-700 mb-2">
                        Amount to Purchase (ETH)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          id="eth-amount-purchase"
                          value={ethPurchaseAmount}
                          onChange={(e) => setEthPurchaseAmount(e.target.value)}
                          placeholder="0.1"
                          step="0.01"
                          min="0"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                        <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
                          ETH
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the amount of ETH you plan to purchase
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="purchase-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmation
                      </label>
                      <input
                        type="text"
                        id="purchase-confirmation"
                        value={purchaseConfirmation}
                        onChange={(e) => setPurchaseConfirmation(e.target.value)}
                        placeholder="Type 'I confirm' to confirm your purchase"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I confirm&quot; to confirm you understand this is a real purchase
                      </p>
                    </div>
                    
                    {/* Exchange Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Exchanges:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://www.coinbase.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Coinbase
                        </a>
                        <a
                          href="https://www.binance.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Binance
                        </a>
                        <a
                          href="https://www.kraken.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Kraken
                        </a>
                        <a
                          href="https://www.gemini.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Gemini
                        </a>
                      </div>
                    </div>
                    
                    <button
                      onClick={confirmEthPurchase}
                      disabled={!selectedExchange.trim() || !ethPurchaseAmount.trim() || !purchaseConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-green-600 text-white border border-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm ETH Purchase
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 7 Completed Section */}
              {isStep7Completed() && (
                <div className="mt-6 p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="text-lg font-semibold mb-3 text-green-900">🎉 Step 7 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Exchange:</strong> {selectedExchange}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Amount:</strong> {ethPurchaseAmount} ETH
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ETH purchase confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Congratulations!</strong> You've completed the ultimate Web3 journey!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        You've successfully: connected a wallet, switched networks, gotten test ETH, minted an NFT, sent ETH to a friend, created a Web3 identity, and bought real ETH!
                      </p>
                    </div>
                    
                    <p className="text-xs text-green-600 mt-2">
                      🎊🎉🚀 You are now a true Web3 explorer! Welcome to the decentralized future! 🚀🎉🎊
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 8 Advanced Security Section */}
              {isStep7Completed() && !isStep8Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 8: Advanced Security</h3>
                  
                  {/* Security Importance */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-red-600 mt-0.5">🔐</div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Critical Security Step</p>
                        <p className="text-xs text-red-700 mt-1">
                          Now that you have real ETH, securing your assets becomes paramount. Hardware wallets provide the highest level of security for your cryptocurrency.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="hardware-wallet-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Hardware Wallet
                      </label>
                      <select
                        id="hardware-wallet-select"
                        value={selectedHardwareWallet}
                        onChange={(e) => setSelectedHardwareWallet(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a hardware wallet...</option>
                        <option value="ledger-nano-s-plus">Ledger Nano S Plus</option>
                        <option value="ledger-nano-x">Ledger Nano X</option>
                        <option value="trezor-model-t">Trezor Model T</option>
                        <option value="trezor-model-one">Trezor Model One</option>
                        <option value="keepkey">KeepKey</option>
                        <option value="other">Other</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Hardware wallets keep your private keys offline and secure
                      </p>
                    </div>
                    
                    {/* Security Checklist */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm font-medium text-blue-800 mb-2">Security Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasBackedUpSeedPhrase}
                            onChange={(e) => setHasBackedUpSeedPhrase(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-blue-700">I have backed up my seed phrase securely</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasSetUpMultisig}
                            onChange={(e) => setHasSetUpMultisig(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-blue-700">I have set up or understand multi-signature wallets</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="security-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Security Notes (Optional)
                      </label>
                      <textarea
                        id="security-notes"
                        value={securityNotes}
                        onChange={(e) => setSecurityNotes(e.target.value)}
                        placeholder="Document your security setup, backup locations, or any security measures you've implemented..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your security measures (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="security-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Security Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="security-confirmation"
                        value={securityConfirmation}
                        onChange={(e) => setSecurityConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your security understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand the importance of security
                      </p>
                    </div>
                    
                    {/* Hardware Wallet Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Hardware Wallets:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://www.ledger.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Ledger
                        </a>
                        <a
                          href="https://trezor.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Trezor
                        </a>
                        <a
                          href="https://keepkey.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          KeepKey
                        </a>
                        <a
                          href="https://www.coinkite.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition"
                        >
                          Coldcard
                        </a>
                      </div>
                    </div>
                    
                    {/* Security Best Practices */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Security Best Practices:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Never share your seed phrase with anyone</li>
                        <li>• Store seed phrase offline in multiple secure locations</li>
                        <li>• Use hardware wallets for significant amounts</li>
                        <li>• Enable 2FA on all exchange accounts</li>
                        <li>• Regularly update wallet firmware</li>
                        <li>• Verify transaction details before signing</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmSecuritySetup}
                      disabled={!selectedHardwareWallet.trim() || !securityConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-red-600 text-white border border-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm Security Setup
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 8 Completed Section */}
              {isStep8Completed() && (
                <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="text-lg font-semibold mb-3 text-red-900">🎉 Step 8 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Hardware Wallet:</strong> {selectedHardwareWallet}
                      </p>
                      <p className="text-sm text-red-800">
                        <strong>Seed Phrase Backed Up:</strong> {hasBackedUpSeedPhrase ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-red-800">
                        <strong>Multi-sig Understanding:</strong> {hasSetUpMultisig ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Security setup confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {securityNotes && (
                      <div className="p-3 bg-white border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          <strong>Security Notes:</strong>
                        </p>
                        <p className="text-xs text-red-700 mt-1 whitespace-pre-wrap">
                          {securityNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Congratulations!</strong> You've secured your Web3 assets!
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        You've now completed: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, and advanced security!
                      </p>
                    </div>
                    
                    <p className="text-xs text-red-600 mt-2">
                      🔐🛡️ Security setup complete! Now let's explore DeFi to make your crypto work for you! 🚀💰
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 9 DeFi Exploration Section */}
              {isStep8Completed() && !isStep9Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 9: DeFi Exploration</h3>
                  
                  {/* DeFi Introduction */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 mt-0.5">💰</div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Make Your Crypto Work for You</p>
                        <p className="text-xs text-blue-700 mt-1">
                          DeFi (Decentralized Finance) allows you to earn passive income through yield farming, staking, and lending. 
                          Explore these opportunities to maximize your crypto holdings!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="defi-protocol-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose DeFi Protocol
                      </label>
                      <select
                        id="defi-protocol-select"
                        value={selectedDeFiProtocol}
                        onChange={(e) => setSelectedDeFiProtocol(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a DeFi protocol...</option>
                        <option value="uniswap">Uniswap (DEX & Liquidity)</option>
                        <option value="aave">Aave (Lending & Borrowing)</option>
                        <option value="compound">Compound (Lending)</option>
                        <option value="curve">Curve (Stablecoin Trading)</option>
                        <option value="yearn">Yearn Finance (Yield Farming)</option>
                        <option value="sushiswap">SushiSwap (DEX & Farming)</option>
                        <option value="other">Other Protocol</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a DeFi protocol to explore
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="defi-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        DeFi Activity
                      </label>
                      <select
                        id="defi-activity-select"
                        value={defiActivity}
                        onChange={(e) => setDefiActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="yield-farming">Yield Farming (Provide Liquidity)</option>
                        <option value="staking">Staking (Earn Rewards)</option>
                        <option value="lending">Lending (Earn Interest)</option>
                        <option value="borrowing">Borrowing (Use Collateral)</option>
                        <option value="trading">DEX Trading</option>
                        <option value="other">Other Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What DeFi activity interests you most?
                      </p>
                    </div>
                    
                    {/* DeFi Exploration Checklist */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-800 mb-2">DeFi Exploration Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasExploredYieldFarming}
                            onChange={(e) => setHasExploredYieldFarming(e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-xs text-green-700">I have explored yield farming opportunities</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasExploredStaking}
                            onChange={(e) => setHasExploredStaking(e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-xs text-green-700">I have explored staking opportunities</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasExploredLending}
                            onChange={(e) => setHasExploredLending(e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-xs text-green-700">I have explored lending/borrowing platforms</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="defi-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        DeFi Notes (Optional)
                      </label>
                      <textarea
                        id="defi-notes"
                        value={defiNotes}
                        onChange={(e) => setDefiNotes(e.target.value)}
                        placeholder="Document your DeFi exploration, strategies, or any insights you've gained..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your DeFi strategies and learnings (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="defi-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        DeFi Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="defi-confirmation"
                        value={defiConfirmation}
                        onChange={(e) => setDefiConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your DeFi understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand DeFi risks and opportunities
                      </p>
                    </div>
                    
                    {/* DeFi Protocol Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular DeFi Protocols:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://uniswap.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          Uniswap
                        </a>
                        <a
                          href="https://aave.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Aave
                        </a>
                        <a
                          href="https://compound.finance/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Compound
                        </a>
                        <a
                          href="https://curve.fi/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Curve
                        </a>
                        <a
                          href="https://yearn.finance/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Yearn
                        </a>
                        <a
                          href="https://sushi.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition"
                        >
                          SushiSwap
                        </a>
                      </div>
                    </div>
                    
                    {/* DeFi Risk Warning */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">DeFi Risk Considerations:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Smart contract risks - protocols can have bugs</li>
                        <li>• Impermanent loss in liquidity pools</li>
                        <li>• High gas fees during network congestion</li>
                        <li>• Market volatility affects yields</li>
                        <li>• Always research protocols before investing</li>
                        <li>• Start with small amounts to learn</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmDeFiExploration}
                      disabled={!selectedDeFiProtocol.trim() || !defiActivity.trim() || !defiConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-green-600 text-white border border-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm DeFi Exploration
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 9 Completed Section */}
              {isStep9Completed() && (
                <div className="mt-6 p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="text-lg font-semibold mb-3 text-green-900">🎉 Step 9 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Protocol:</strong> {selectedDeFiProtocol}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Activity:</strong> {defiActivity}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Yield Farming:</strong> {hasExploredYieldFarming ? 'Explored' : 'Not Explored'}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Staking:</strong> {hasExploredStaking ? 'Explored' : 'Not Explored'}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Lending:</strong> {hasExploredLending ? 'Explored' : 'Not Explored'}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        DeFi exploration confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {defiNotes && (
                      <div className="p-3 bg-white border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          <strong>DeFi Notes:</strong>
                        </p>
                        <p className="text-xs text-green-700 mt-1 whitespace-pre-wrap">
                          {defiNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Congratulations!</strong> You're now a DeFi explorer!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        You've completed the FULL Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, and DeFi exploration!
                      </p>
                    </div>
                    
                    <p className="text-xs text-green-600 mt-2">
                      🚀💰 DeFi exploration complete! Now let's explore Layer 2 solutions for ultra-low fees! ⚡🌐
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 10 Layer 2 Solutions Section */}
              {isStep9Completed() && !isStep10Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 10: Layer 2 Solutions</h3>
                  
                  {/* L2 Introduction */}
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-purple-600 mt-0.5">⚡</div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Escape High Gas Fees</p>
                        <p className="text-xs text-purple-700 mt-1">
                          Layer 2 solutions like Polygon and Arbitrum offer the same DeFi experience with ultra-low fees. 
                          Bridge your assets and enjoy sub-dollar transactions!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="l2-network-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Layer 2 Network
                      </label>
                      <select
                        id="l2-network-select"
                        value={selectedL2Network}
                        onChange={(e) => setSelectedL2Network(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a Layer 2 network...</option>
                        <option value="polygon">Polygon (MATIC) - Most Popular</option>
                        <option value="arbitrum">Arbitrum - Optimistic Rollup</option>
                        <option value="optimism">Optimism - Optimistic Rollup</option>
                        <option value="base">Base - Coinbase L2</option>
                        <option value="zksync">zkSync - Zero Knowledge</option>
                        <option value="other">Other L2 Network</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a Layer 2 network to explore
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="l2-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        L2 Activity
                      </label>
                      <select
                        id="l2-activity-select"
                        value={l2Activity}
                        onChange={(e) => setL2Activity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="bridging">Asset Bridging</option>
                        <option value="l2-defi">L2 DeFi Protocols</option>
                        <option value="l2-nft">L2 NFT Markets</option>
                        <option value="l2-gaming">L2 Gaming/dApps</option>
                        <option value="gas-comparison">Gas Fee Comparison</option>
                        <option value="other">Other L2 Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What Layer 2 activity interests you most?
                      </p>
                    </div>
                    
                    {/* L2 Exploration Checklist */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm font-medium text-blue-800 mb-2">Layer 2 Exploration Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasBridgedAssets}
                            onChange={(e) => setHasBridgedAssets(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-blue-700">I have bridged assets to a Layer 2 network</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasExploredL2DeFi}
                            onChange={(e) => setHasExploredL2DeFi(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-blue-700">I have explored DeFi protocols on Layer 2</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasComparedGasFees}
                            onChange={(e) => setHasComparedGasFees(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-blue-700">I have compared L1 vs L2 gas fees</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="l2-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        L2 Notes (Optional)
                      </label>
                      <textarea
                        id="l2-notes"
                        value={l2Notes}
                        onChange={(e) => setL2Notes(e.target.value)}
                        placeholder="Document your Layer 2 experience, gas savings, or any insights you've gained..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your Layer 2 experiences and gas savings (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="l2-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        L2 Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="l2-confirmation"
                        value={l2Confirmation}
                        onChange={(e) => setL2Confirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your L2 understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand Layer 2 benefits and bridging
                      </p>
                    </div>
                    
                    {/* L2 Network Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Layer 2 Networks:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://polygon.technology/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Polygon
                        </a>
                        <a
                          href="https://arbitrum.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Arbitrum
                        </a>
                        <a
                          href="https://optimism.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                        >
                          Optimism
                        </a>
                        <a
                          href="https://base.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Base
                        </a>
                        <a
                          href="https://zksync.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          zkSync
                        </a>
                        <a
                          href="https://bridge.arbitrum.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          Arbitrum Bridge
                        </a>
                      </div>
                    </div>
                    
                    {/* Gas Fee Comparison */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-800 mb-2">Gas Fee Benefits:</p>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Ethereum L1: $10-100+ per transaction</li>
                        <li>• Polygon: $0.01-0.10 per transaction</li>
                        <li>• Arbitrum: $0.50-2.00 per transaction</li>
                        <li>• Same protocols, 100x cheaper fees</li>
                        <li>• Faster transaction confirmation</li>
                        <li>• Perfect for frequent DeFi interactions</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmL2Exploration}
                      disabled={!selectedL2Network.trim() || !l2Activity.trim() || !l2Confirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-purple-600 text-white border border-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm L2 Exploration
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 10 Completed Section */}
              {isStep10Completed() && (
                <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h3 className="text-lg font-semibold mb-3 text-purple-900">🎉 Step 10 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-purple-200 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Network:</strong> {selectedL2Network}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>Activity:</strong> {l2Activity}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>Bridged Assets:</strong> {hasBridgedAssets ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>L2 DeFi:</strong> {hasExploredL2DeFi ? 'Explored' : 'Not Explored'}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>Gas Comparison:</strong> {hasComparedGasFees ? 'Completed' : 'Not Completed'}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Layer 2 exploration confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {l2Notes && (
                      <div className="p-3 bg-white border border-purple-200 rounded-md">
                        <p className="text-sm text-purple-800">
                          <strong>L2 Notes:</strong>
                        </p>
                        <p className="text-xs text-purple-700 mt-1 whitespace-pre-wrap">
                          {l2Notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-purple-200 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Congratulations!</strong> You've mastered Layer 2 scaling!
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        You've completed the ULTIMATE Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, and Layer 2 scaling!
                      </p>
                    </div>
                    
                    <p className="text-xs text-purple-600 mt-2">
                      🎊⚡ Layer 2 mastery complete! Now let's master NFT marketplaces and monetize your digital art! 🎨💰
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 11 NFT Marketplace Mastery Section */}
              {isStep10Completed() && !isStep11Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 11: NFT Marketplace Mastery</h3>
                  
                  {/* NFT Marketplace Introduction */}
                  <div className="p-3 bg-pink-50 border border-pink-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-pink-600 mt-0.5">🎨</div>
                      <div>
                        <p className="text-sm font-medium text-pink-800">Monetize Your Digital Art</p>
                        <p className="text-xs text-pink-700 mt-1">
                          You've minted NFTs, now learn to trade them! Master NFT marketplaces to list your creations, 
                          buy from other artists, and understand the NFT economy.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nft-marketplace-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose NFT Marketplace
                      </label>
                      <select
                        id="nft-marketplace-select"
                        value={selectedNFTMarketplace}
                        onChange={(e) => setSelectedNFTMarketplace(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an NFT marketplace...</option>
                        <option value="opensea">OpenSea - Largest Marketplace</option>
                        <option value="rarible">Rarible - Creator-Focused</option>
                        <option value="foundation">Foundation - Curated Art</option>
                        <option value="superrare">SuperRare - Premium Art</option>
                        <option value="nifty-gateway">Nifty Gateway - Drops</option>
                        <option value="zora">Zora - Creator Protocol</option>
                        <option value="other">Other Marketplace</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose an NFT marketplace to explore
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="nft-marketplace-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        NFT Marketplace Activity
                      </label>
                      <select
                        id="nft-marketplace-activity-select"
                        value={nftMarketplaceActivity}
                        onChange={(e) => setNftMarketplaceActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="listing">List NFT for Sale</option>
                        <option value="buying">Buy NFTs</option>
                        <option value="browsing">Browse Collections</option>
                        <option value="trading">Secondary Trading</option>
                        <option value="royalties">Royalty Management</option>
                        <option value="community">Community Building</option>
                        <option value="other">Other Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What NFT marketplace activity interests you most?
                      </p>
                    </div>
                    
                    {/* NFT Marketplace Checklist */}
                    <div className="p-3 bg-pink-50 border border-pink-200 rounded-md">
                      <p className="text-sm font-medium text-pink-800 mb-2">NFT Marketplace Mastery Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasListedNFT}
                            onChange={(e) => setHasListedNFT(e.target.checked)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="text-xs text-pink-700">I have listed an NFT for sale</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasBoughtNFT}
                            onChange={(e) => setHasBoughtNFT(e.target.checked)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="text-xs text-pink-700">I have bought an NFT from another creator</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasExploredCollections}
                            onChange={(e) => setHasExploredCollections(e.target.checked)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="text-xs text-pink-700">I have explored NFT collections and communities</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="nft-marketplace-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        NFT Marketplace Notes (Optional)
                      </label>
                      <textarea
                        id="nft-marketplace-notes"
                        value={nftMarketplaceNotes}
                        onChange={(e) => setNftMarketplaceNotes(e.target.value)}
                        placeholder="Document your NFT marketplace experience, trading strategies, or any insights you've gained..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your NFT trading experiences and strategies (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="nft-marketplace-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        NFT Marketplace Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="nft-marketplace-confirmation"
                        value={nftMarketplaceConfirmation}
                        onChange={(e) => setNftMarketplaceConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your NFT marketplace understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand NFT marketplace dynamics
                      </p>
                    </div>
                    
                    {/* NFT Marketplace Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular NFT Marketplaces:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://opensea.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          OpenSea
                        </a>
                        <a
                          href="https://rarible.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Rarible
                        </a>
                        <a
                          href="https://foundation.app/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Foundation
                        </a>
                        <a
                          href="https://superrare.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                        >
                          SuperRare
                        </a>
                        <a
                          href="https://niftygateway.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Nifty Gateway
                        </a>
                        <a
                          href="https://zora.co/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          Zora
                        </a>
                      </div>
                    </div>
                    
                    {/* NFT Trading Tips */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">NFT Trading Tips:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Research floor prices before listing</li>
                        <li>• Set realistic prices based on market trends</li>
                        <li>• Understand gas fees for transactions</li>
                        <li>• Build a community around your art</li>
                        <li>• Consider royalties for secondary sales</li>
                        <li>• Start with small amounts to learn</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmNFTMarketplaceMastery}
                      disabled={!selectedNFTMarketplace.trim() || !nftMarketplaceActivity.trim() || !nftMarketplaceConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-pink-600 text-white border border-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm NFT Marketplace Mastery
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 11 Completed Section */}
              {isStep11Completed() && (
                <div className="mt-6 p-4 border border-pink-200 rounded-lg bg-pink-50">
                  <h3 className="text-lg font-semibold mb-3 text-pink-900">🎉 Step 11 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-pink-200 rounded-md">
                      <p className="text-sm text-pink-800">
                        <strong>Marketplace:</strong> {selectedNFTMarketplace}
                      </p>
                      <p className="text-sm text-pink-800">
                        <strong>Activity:</strong> {nftMarketplaceActivity}
                      </p>
                      <p className="text-sm text-pink-800">
                        <strong>Listed NFT:</strong> {hasListedNFT ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-pink-800">
                        <strong>Bought NFT:</strong> {hasBoughtNFT ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-pink-800">
                        <strong>Explored Collections:</strong> {hasExploredCollections ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-pink-600 mt-1">
                        NFT marketplace mastery confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {nftMarketplaceNotes && (
                      <div className="p-3 bg-white border border-pink-200 rounded-md">
                        <p className="text-sm text-pink-800">
                          <strong>NFT Marketplace Notes:</strong>
                        </p>
                        <p className="text-xs text-pink-700 mt-1 whitespace-pre-wrap">
                          {nftMarketplaceNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-pink-200 rounded-md">
                      <p className="text-sm text-pink-800">
                        <strong>Congratulations!</strong> You've mastered NFT marketplaces!
                      </p>
                      <p className="text-xs text-pink-600 mt-1">
                        You've completed the LEGENDARY Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, and NFT marketplace mastery!
                      </p>
                    </div>
                    
                    <p className="text-xs text-pink-600 mt-2">
                      🎨💰 NFT marketplace mastery complete! Now let's join DAO governance and shape Web3 communities! 🗳️✨
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 12 DAO Governance & Voting Section */}
              {isStep11Completed() && !isStep12Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 12: DAO Governance & Voting</h3>
                  
                  {/* DAO Governance Introduction */}
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-indigo-600 mt-0.5">🗳️</div>
                      <div>
                        <p className="text-sm font-medium text-indigo-800">Shape Web3 Communities</p>
                        <p className="text-xs text-indigo-700 mt-1">
                          You've mastered Web3 tools, now participate in governance! Join DAOs, vote on proposals, 
                          and help shape the future of decentralized communities.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="dao-platform-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose DAO Platform
                      </label>
                      <select
                        id="dao-platform-select"
                        value={selectedDAOPlatform}
                        onChange={(e) => setSelectedDAOPlatform(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a DAO platform...</option>
                        <option value="snapshot">Snapshot - Off-chain Voting</option>
                        <option value="aragon">Aragon - DAO Infrastructure</option>
                        <option value="tally">Tally - Governance Analytics</option>
                        <option value="compound">Compound - DeFi Governance</option>
                        <option value="uniswap">Uniswap - DEX Governance</option>
                        <option value="makerdao">MakerDAO - Stablecoin Governance</option>
                        <option value="gitcoin">Gitcoin - Public Goods</option>
                        <option value="other">Other DAO Platform</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a DAO platform to explore governance
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="dao-governance-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        DAO Governance Activity
                      </label>
                      <select
                        id="dao-governance-activity-select"
                        value={daoGovernanceActivity}
                        onChange={(e) => setDaoGovernanceActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="voting">Vote on Proposals</option>
                        <option value="proposing">Create Proposals</option>
                        <option value="delegating">Delegate Voting Power</option>
                        <option value="discussing">Participate in Discussions</option>
                        <option value="treasury">Treasury Management</option>
                        <option value="grants">Grant Programs</option>
                        <option value="other">Other Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What DAO governance activity interests you most?
                      </p>
                    </div>
                    
                    {/* DAO Governance Checklist */}
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                      <p className="text-sm font-medium text-indigo-800 mb-2">DAO Governance Mastery Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasJoinedDAO}
                            onChange={(e) => setHasJoinedDAO(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-indigo-700">I have joined a DAO community</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasVotedOnProposal}
                            onChange={(e) => setHasVotedOnProposal(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-indigo-700">I have voted on a governance proposal</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasCreatedProposal}
                            onChange={(e) => setHasCreatedProposal(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-indigo-700">I have created a governance proposal</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="dao-governance-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        DAO Governance Notes (Optional)
                      </label>
                      <textarea
                        id="dao-governance-notes"
                        value={daoGovernanceNotes}
                        onChange={(e) => setDaoGovernanceNotes(e.target.value)}
                        placeholder="Document your DAO governance experience, voting strategies, or community insights..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your DAO participation and governance insights (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="dao-governance-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        DAO Governance Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="dao-governance-confirmation"
                        value={daoGovernanceConfirmation}
                        onChange={(e) => setDaoGovernanceConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your DAO governance understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand DAO governance principles
                      </p>
                    </div>
                    
                    {/* DAO Platform Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular DAO Platforms:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://snapshot.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Snapshot
                        </a>
                        <a
                          href="https://aragon.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Aragon
                        </a>
                        <a
                          href="https://www.tally.xyz/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Tally
                        </a>
                        <a
                          href="https://compound.finance/governance"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Compound
                        </a>
                        <a
                          href="https://uniswap.org/governance"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          Uniswap
                        </a>
                        <a
                          href="https://vote.makerdao.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                        >
                          MakerDAO
                        </a>
                      </div>
                    </div>
                    
                    {/* DAO Governance Tips */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">DAO Governance Tips:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Research proposals before voting</li>
                        <li>• Understand token economics and voting power</li>
                        <li>• Participate in community discussions</li>
                        <li>• Consider delegation for better governance</li>
                        <li>• Stay informed about protocol updates</li>
                        <li>• Build reputation through active participation</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmDAOGovernance}
                      disabled={!selectedDAOPlatform.trim() || !daoGovernanceActivity.trim() || !daoGovernanceConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm DAO Governance Mastery
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 12 Completed Section */}
              {isStep12Completed() && (
                <div className="mt-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                  <h3 className="text-lg font-semibold mb-3 text-indigo-900">🎉 Step 12 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-indigo-200 rounded-md">
                      <p className="text-sm text-indigo-800">
                        <strong>Platform:</strong> {selectedDAOPlatform}
                      </p>
                      <p className="text-sm text-indigo-800">
                        <strong>Activity:</strong> {daoGovernanceActivity}
                      </p>
                      <p className="text-sm text-indigo-800">
                        <strong>Joined DAO:</strong> {hasJoinedDAO ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-indigo-800">
                        <strong>Voted on Proposal:</strong> {hasVotedOnProposal ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-indigo-800">
                        <strong>Created Proposal:</strong> {hasCreatedProposal ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        DAO governance mastery confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {daoGovernanceNotes && (
                      <div className="p-3 bg-white border border-indigo-200 rounded-md">
                        <p className="text-sm text-indigo-800">
                          <strong>DAO Governance Notes:</strong>
                        </p>
                        <p className="text-xs text-indigo-700 mt-1 whitespace-pre-wrap">
                          {daoGovernanceNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-indigo-200 rounded-md">
                      <p className="text-sm text-indigo-800">
                        <strong>Congratulations!</strong> You've mastered DAO governance!
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        You've completed the ULTIMATE Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, and DAO governance!
                      </p>
                    </div>
                    
                    <p className="text-xs text-indigo-600 mt-2">
                      🗳️✨ DAO governance mastery complete! Now let's build comprehensive Web3 identities and join decentralized social networks! 👥🌟
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 13 Web3 Social & Identity Aggregation Section */}
              {isStep12Completed() && !isStep13Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 13: Web3 Social & Identity Aggregation</h3>
                  
                  {/* Web3 Social Introduction */}
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-teal-600 mt-0.5">👥</div>
                      <div>
                        <p className="text-sm font-medium text-teal-800">Build Your Web3 Identity</p>
                        <p className="text-xs text-teal-700 mt-1">
                          You've mastered Web3 tools and governance, now build your comprehensive identity! 
                          Aggregate all your Web3 activities into unified profiles and join decentralized social networks.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="web3-social-platform-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Web3 Social Platform
                      </label>
                      <select
                        id="web3-social-platform-select"
                        value={selectedWeb3SocialPlatform}
                        onChange={(e) => setSelectedWeb3SocialPlatform(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a Web3 social platform...</option>
                        <option value="lens">Lens Protocol - Decentralized Social</option>
                        <option value="farcaster">Farcaster - Decentralized Social</option>
                        <option value="mirror">Mirror - Web3 Publishing</option>
                        <option value="gm">gm - Web3 Social</option>
                        <option value="friendtech">Friend.tech - Social Trading</option>
                        <option value="galxe">Galxe - Web3 Identity</option>
                        <option value="other">Other Web3 Social Platform</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a Web3 social platform to explore identity aggregation
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="web3-social-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Web3 Social Activity
                      </label>
                      <select
                        id="web3-social-activity-select"
                        value={web3SocialActivity}
                        onChange={(e) => setWeb3SocialActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="profile-creation">Create Web3 Profile</option>
                        <option value="identity-aggregation">Aggregate Web3 Identity</option>
                        <option value="social-posting">Post Content</option>
                        <option value="community-building">Build Community</option>
                        <option value="reputation-building">Build Reputation</option>
                        <option value="content-monetization">Monetize Content</option>
                        <option value="other">Other Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What Web3 social activity interests you most?
                      </p>
                    </div>
                    
                    {/* Web3 Social Checklist */}
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-md">
                      <p className="text-sm font-medium text-teal-800 mb-2">Web3 Social Mastery Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasCreatedWeb3Profile}
                            onChange={(e) => setHasCreatedWeb3Profile(e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-xs text-teal-700">I have created a comprehensive Web3 profile</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasConnectedWeb3Identity}
                            onChange={(e) => setHasConnectedWeb3Identity(e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-xs text-teal-700">I have connected my Web3 identity across platforms</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasParticipatedInSocial}
                            onChange={(e) => setHasParticipatedInSocial(e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-xs text-teal-700">I have participated in decentralized social networks</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="web3-social-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Web3 Social Notes (Optional)
                      </label>
                      <textarea
                        id="web3-social-notes"
                        value={web3SocialNotes}
                        onChange={(e) => setWeb3SocialNotes(e.target.value)}
                        placeholder="Document your Web3 social experience, identity strategies, or community insights..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your Web3 social journey and identity building (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="web3-social-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Web3 Social Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="web3-social-confirmation"
                        value={web3SocialConfirmation}
                        onChange={(e) => setWeb3SocialConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your Web3 social understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand Web3 social principles
                      </p>
                    </div>
                    
                    {/* Web3 Social Platform Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Web3 Social Platforms:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://lens.xyz/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Lens Protocol
                        </a>
                        <a
                          href="https://farcaster.xyz/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Farcaster
                        </a>
                        <a
                          href="https://mirror.xyz/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Mirror
                        </a>
                        <a
                          href="https://gm.xyz/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          gm
                        </a>
                        <a
                          href="https://friend.tech/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          Friend.tech
                        </a>
                        <a
                          href="https://galxe.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          Galxe
                        </a>
                      </div>
                    </div>
                    
                    {/* Web3 Social Tips */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Web3 Social Tips:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Build a consistent brand across all platforms</li>
                        <li>• Connect your wallet to aggregate your Web3 activities</li>
                        <li>• Engage authentically with the community</li>
                        <li>• Share your Web3 journey and experiences</li>
                        <li>• Build reputation through valuable contributions</li>
                        <li>• Monetize your content and expertise</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmWeb3Social}
                      disabled={!selectedWeb3SocialPlatform.trim() || !web3SocialActivity.trim() || !web3SocialConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-teal-600 text-white border border-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm Web3 Social Mastery
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 13 Completed Section */}
              {isStep13Completed() && (
                <div className="mt-6 p-4 border border-teal-200 rounded-lg bg-teal-50">
                  <h3 className="text-lg font-semibold mb-3 text-teal-900">🎉 Step 13 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-teal-200 rounded-md">
                      <p className="text-sm text-teal-800">
                        <strong>Platform:</strong> {selectedWeb3SocialPlatform}
                      </p>
                      <p className="text-sm text-teal-800">
                        <strong>Activity:</strong> {web3SocialActivity}
                      </p>
                      <p className="text-sm text-teal-800">
                        <strong>Created Profile:</strong> {hasCreatedWeb3Profile ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-teal-800">
                        <strong>Connected Identity:</strong> {hasConnectedWeb3Identity ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-teal-800">
                        <strong>Participated in Social:</strong> {hasParticipatedInSocial ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-teal-600 mt-1">
                        Web3 social mastery confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {web3SocialNotes && (
                      <div className="p-3 bg-white border border-teal-200 rounded-md">
                        <p className="text-sm text-teal-800">
                          <strong>Web3 Social Notes:</strong>
                        </p>
                        <p className="text-xs text-teal-700 mt-1 whitespace-pre-wrap">
                          {web3SocialNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-teal-200 rounded-md">
                      <p className="text-sm text-teal-800">
                        <strong>Congratulations!</strong> You've mastered Web3 social identity!
                      </p>
                      <p className="text-xs text-teal-600 mt-1">
                        You've completed the LEGENDARY Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, DAO governance, and Web3 social identity aggregation!
                      </p>
                    </div>
                    
                    <p className="text-xs text-teal-600 mt-2">
                      👥🌟 Web3 social mastery complete! Now let's become Web3 builders and create our own decentralized applications! 💻🚀
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 14 Web3 Development & Smart Contracts Section */}
              {isStep13Completed() && !isStep14Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 14: Web3 Development & Smart Contracts</h3>
                  
                  {/* Web3 Development Introduction */}
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-orange-600 mt-0.5">💻</div>
                      <div>
                        <p className="text-sm font-medium text-orange-800">Become a Web3 Builder</p>
                        <p className="text-xs text-orange-700 mt-1">
                          You've mastered Web3 tools and social networks, now become a builder! 
                          Learn to write smart contracts, deploy dApps, and create the future of decentralized applications.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="dev-platform-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Development Platform
                      </label>
                      <select
                        id="dev-platform-select"
                        value={selectedDevPlatform}
                        onChange={(e) => setSelectedDevPlatform(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a development platform...</option>
                        <option value="hardhat">Hardhat - Ethereum Development</option>
                        <option value="remix">Remix - Online IDE</option>
                        <option value="foundry">Foundry - Rust-based Toolkit</option>
                        <option value="truffle">Truffle - Development Framework</option>
                        <option value="brownie">Brownie - Python Framework</option>
                        <option value="scaffold-eth">Scaffold-ETH - React Templates</option>
                        <option value="other">Other Development Platform</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a Web3 development platform to explore
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="web3-dev-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Web3 Development Activity
                      </label>
                      <select
                        id="web3-dev-activity-select"
                        value={web3DevActivity}
                        onChange={(e) => setWeb3DevActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="smart-contracts">Write Smart Contracts</option>
                        <option value="dapp-development">Build dApps</option>
                        <option value="contract-deployment">Deploy Contracts</option>
                        <option value="frontend-integration">Frontend Integration</option>
                        <option value="testing">Contract Testing</option>
                        <option value="gas-optimization">Gas Optimization</option>
                        <option value="other">Other Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What Web3 development activity interests you most?
                      </p>
                    </div>
                    
                    {/* Web3 Development Checklist */}
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-sm font-medium text-orange-800 mb-2">Web3 Development Mastery Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasWrittenSmartContract}
                            onChange={(e) => setHasWrittenSmartContract(e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-xs text-orange-700">I have written a smart contract</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasDeployedContract}
                            onChange={(e) => setHasDeployedContract(e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-xs text-orange-700">I have deployed a smart contract to testnet</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasBuiltDApp}
                            onChange={(e) => setHasBuiltDApp(e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-xs text-orange-700">I have built a complete dApp</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="web3-dev-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Web3 Development Notes (Optional)
                      </label>
                      <textarea
                        id="web3-dev-notes"
                        value={web3DevNotes}
                        onChange={(e) => setWeb3DevNotes(e.target.value)}
                        placeholder="Document your Web3 development experience, smart contract insights, or dApp building strategies..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your Web3 development journey and technical insights (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="web3-dev-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Web3 Development Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="web3-dev-confirmation"
                        value={web3DevConfirmation}
                        onChange={(e) => setWeb3DevConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your Web3 development understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand Web3 development principles
                      </p>
                    </div>
                    
                    {/* Web3 Development Platform Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Web3 Development Platforms:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://hardhat.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Hardhat
                        </a>
                        <a
                          href="https://remix.ethereum.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Remix
                        </a>
                        <a
                          href="https://book.getfoundry.sh/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Foundry
                        </a>
                        <a
                          href="https://trufflesuite.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Truffle
                        </a>
                        <a
                          href="https://eth-brownie.readthedocs.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          Brownie
                        </a>
                        <a
                          href="https://scaffoldeth.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          Scaffold-ETH
                        </a>
                      </div>
                    </div>
                    
                    {/* Web3 Development Tips */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Web3 Development Tips:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Start with simple contracts and gradually increase complexity</li>
                        <li>• Always test your contracts thoroughly before deployment</li>
                        <li>• Use established libraries like OpenZeppelin for security</li>
                        <li>• Optimize gas usage for better user experience</li>
                        <li>• Keep up with Solidity updates and best practices</li>
                        <li>• Join developer communities for support and learning</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmWeb3Development}
                      disabled={!selectedDevPlatform.trim() || !web3DevActivity.trim() || !web3DevConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-orange-600 text-white border border-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm Web3 Development Mastery
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 14 Completed Section */}
              {isStep14Completed() && (
                <div className="mt-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h3 className="text-lg font-semibold mb-3 text-orange-900">🎉 Step 14 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800">
                        <strong>Platform:</strong> {selectedDevPlatform}
                      </p>
                      <p className="text-sm text-orange-800">
                        <strong>Activity:</strong> {web3DevActivity}
                      </p>
                      <p className="text-sm text-orange-800">
                        <strong>Written Smart Contract:</strong> {hasWrittenSmartContract ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-orange-800">
                        <strong>Deployed Contract:</strong> {hasDeployedContract ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-orange-800">
                        <strong>Built dApp:</strong> {hasBuiltDApp ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Web3 development mastery confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {web3DevNotes && (
                      <div className="p-3 bg-white border border-orange-200 rounded-md">
                        <p className="text-sm text-orange-800">
                          <strong>Web3 Development Notes:</strong>
                        </p>
                        <p className="text-xs text-orange-700 mt-1 whitespace-pre-wrap">
                          {web3DevNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800">
                        <strong>Congratulations!</strong> You've mastered Web3 development!
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        You've completed the ULTIMATE Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, DAO governance, Web3 social identity aggregation, and Web3 development!
                      </p>
                    </div>
                    
                    <p className="text-xs text-orange-600 mt-2">
                      💻🚀 Web3 development mastery complete! Now let's become professional traders and maximize DeFi returns! 📊💰
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 15 Advanced Trading & Analytics Section */}
              {isStep14Completed() && !isStep15Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 15: Advanced Trading & Analytics</h3>
                  
                  {/* Trading Analytics Introduction */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-emerald-600 mt-0.5">📊</div>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Become a Professional Trader</p>
                        <p className="text-xs text-emerald-700 mt-1">
                          You've mastered Web3 development, now become a professional trader! 
                          Learn advanced DEX strategies, analytics tools, and yield optimization to maximize your DeFi returns.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="trading-platform-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Trading Platform
                      </label>
                      <select
                        id="trading-platform-select"
                        value={selectedTradingPlatform}
                        onChange={(e) => setSelectedTradingPlatform(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a trading platform...</option>
                        <option value="uniswap">Uniswap - Leading DEX</option>
                        <option value="sushiswap">SushiSwap - Multi-chain DEX</option>
                        <option value="curve">Curve - Stablecoin DEX</option>
                        <option value="balancer">Balancer - Weighted Pools</option>
                        <option value="1inch">1inch - DEX Aggregator</option>
                        <option value="paraswap">ParaSwap - Multi-DEX</option>
                        <option value="other">Other Trading Platform</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a DEX platform to explore advanced trading
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="trading-analytics-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Trading Analytics Activity
                      </label>
                      <select
                        id="trading-analytics-activity-select"
                        value={tradingAnalyticsActivity}
                        onChange={(e) => setTradingAnalyticsActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="advanced-trading">Advanced DEX Trading</option>
                        <option value="arbitrage">Cross-DEX Arbitrage</option>
                        <option value="yield-optimization">Yield Optimization</option>
                        <option value="analytics-tools">Analytics & Research</option>
                        <option value="portfolio-management">Portfolio Management</option>
                        <option value="risk-management">Risk Management</option>
                        <option value="other">Other Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What trading analytics activity interests you most?
                      </p>
                    </div>
                    
                    {/* Trading Analytics Checklist */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                      <p className="text-sm font-medium text-emerald-800 mb-2">Trading Analytics Mastery Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasExecutedAdvancedTrade}
                            onChange={(e) => setHasExecutedAdvancedTrade(e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-emerald-700">I have executed advanced DEX trades</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasUsedAnalyticsTools}
                            onChange={(e) => setHasUsedAnalyticsTools(e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-emerald-700">I have used professional analytics tools</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasOptimizedYield}
                            onChange={(e) => setHasOptimizedYield(e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-emerald-700">I have optimized my yield farming strategies</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="trading-analytics-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Trading Analytics Notes (Optional)
                      </label>
                      <textarea
                        id="trading-analytics-notes"
                        value={tradingAnalyticsNotes}
                        onChange={(e) => setTradingAnalyticsNotes(e.target.value)}
                        placeholder="Document your trading strategies, analytics insights, or yield optimization techniques..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your trading strategies and analytics insights (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="trading-analytics-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Trading Analytics Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="trading-analytics-confirmation"
                        value={tradingAnalyticsConfirmation}
                        onChange={(e) => setTradingAnalyticsConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your trading analytics understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand advanced trading principles
                      </p>
                    </div>
                    
                    {/* Trading Platform Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Trading Platforms:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://app.uniswap.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Uniswap
                        </a>
                        <a
                          href="https://www.sushi.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          SushiSwap
                        </a>
                        <a
                          href="https://curve.fi/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Curve
                        </a>
                        <a
                          href="https://balancer.fi/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Balancer
                        </a>
                        <a
                          href="https://app.1inch.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          1inch
                        </a>
                        <a
                          href="https://paraswap.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          ParaSwap
                        </a>
                      </div>
                    </div>
                    
                    {/* Analytics Tools Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Analytics & Research Tools:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://dune.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Dune Analytics
                        </a>
                        <a
                          href="https://defipulse.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          DeFiPulse
                        </a>
                        <a
                          href="https://tokenterminal.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Token Terminal
                        </a>
                        <a
                          href="https://glassnode.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Glassnode
                        </a>
                        <a
                          href="https://coingecko.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          CoinGecko
                        </a>
                        <a
                          href="https://coinmarketcap.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          CoinMarketCap
                        </a>
                      </div>
                    </div>
                    
                    {/* Trading Tips */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Advanced Trading Tips:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Always research before trading - use analytics tools</li>
                        <li>• Start with small amounts to test strategies</li>
                        <li>• Understand slippage and gas costs</li>
                        <li>• Diversify your portfolio across different assets</li>
                        <li>• Use stop-losses and risk management</li>
                        <li>• Keep detailed records of your trades</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmTradingAnalytics}
                      disabled={!selectedTradingPlatform.trim() || !tradingAnalyticsActivity.trim() || !tradingAnalyticsConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm Trading Analytics Mastery
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 15 Completed Section */}
              {isStep15Completed() && (
                <div className="mt-6 p-4 border border-emerald-200 rounded-lg bg-emerald-50">
                  <h3 className="text-lg font-semibold mb-3 text-emerald-900">🎉 Step 15 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-emerald-200 rounded-md">
                      <p className="text-sm text-emerald-800">
                        <strong>Platform:</strong> {selectedTradingPlatform}
                      </p>
                      <p className="text-sm text-emerald-800">
                        <strong>Activity:</strong> {tradingAnalyticsActivity}
                      </p>
                      <p className="text-sm text-emerald-800">
                        <strong>Executed Advanced Trade:</strong> {hasExecutedAdvancedTrade ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-emerald-800">
                        <strong>Used Analytics Tools:</strong> {hasUsedAnalyticsTools ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-emerald-800">
                        <strong>Optimized Yield:</strong> {hasOptimizedYield ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Trading analytics mastery confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {tradingAnalyticsNotes && (
                      <div className="p-3 bg-white border border-emerald-200 rounded-md">
                        <p className="text-sm text-emerald-800">
                          <strong>Trading Analytics Notes:</strong>
                        </p>
                        <p className="text-xs text-emerald-700 mt-1 whitespace-pre-wrap">
                          {tradingAnalyticsNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-emerald-200 rounded-md">
                      <p className="text-sm text-emerald-800">
                        <strong>Congratulations!</strong> You've mastered advanced trading analytics!
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        You've completed the PROFESSIONAL Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, DAO governance, Web3 social identity aggregation, Web3 development, and advanced trading analytics!
                      </p>
                    </div>
                    
                    <p className="text-xs text-emerald-600 mt-2">
                      📊💰 Trading analytics mastery complete! Now let's enter the metaverse and master Web3 gaming! 🎮🌐
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 16 Web3 Gaming & Metaverse Section */}
              {isStep15Completed() && !isStep16Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 16: Web3 Gaming & Metaverse</h3>
                  
                  {/* Gaming Metaverse Introduction */}
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-purple-600 mt-0.5">🎮</div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Enter the Metaverse</p>
                        <p className="text-xs text-purple-700 mt-1">
                          You've mastered professional trading, now enter the virtual world! 
                          Learn play-to-earn gaming, metaverse land ownership, and virtual economies.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="gaming-platform-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Gaming Platform
                      </label>
                      <select
                        id="gaming-platform-select"
                        value={selectedGamingPlatform}
                        onChange={(e) => setSelectedGamingPlatform(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select a gaming platform...</option>
                        <option value="axie-infinity">Axie Infinity - Play-to-Earn</option>
                        <option value="sandbox">The Sandbox - Virtual World</option>
                        <option value="decentraland">Decentraland - Metaverse</option>
                        <option value="illuvium">Illuvium - RPG Gaming</option>
                        <option value="gods-unchained">Gods Unchained - Trading Card Game</option>
                        <option value="splinterlands">Splinterlands - Battle Card Game</option>
                        <option value="other">Other Gaming Platform</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a Web3 gaming platform to explore
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="gaming-metaverse-activity-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Gaming Metaverse Activity
                      </label>
                      <select
                        id="gaming-metaverse-activity-select"
                        value={gamingMetaverseActivity}
                        onChange={(e) => setGamingMetaverseActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Select an activity...</option>
                        <option value="play-to-earn">Play-to-Earn Gaming</option>
                        <option value="metaverse-land">Metaverse Land Ownership</option>
                        <option value="virtual-worlds">Virtual World Exploration</option>
                        <option value="nft-gaming">NFT Gaming Assets</option>
                        <option value="virtual-economies">Virtual Economy Trading</option>
                        <option value="gaming-guilds">Gaming Guilds & Communities</option>
                        <option value="other">Other Activity</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        What gaming metaverse activity interests you most?
                      </p>
                    </div>
                    
                    {/* Gaming Metaverse Checklist */}
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                      <p className="text-sm font-medium text-purple-800 mb-2">Gaming Metaverse Mastery Checklist:</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasPlayedToEarn}
                            onChange={(e) => setHasPlayedToEarn(e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs text-purple-700">I have played play-to-earn games</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasOwnedMetaverseLand}
                            onChange={(e) => setHasOwnedMetaverseLand(e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs text-purple-700">I have owned metaverse land or virtual assets</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasParticipatedInVirtualWorld}
                            onChange={(e) => setHasParticipatedInVirtualWorld(e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs text-purple-700">I have participated in virtual worlds</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="gaming-metaverse-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Gaming Metaverse Notes (Optional)
                      </label>
                      <textarea
                        id="gaming-metaverse-notes"
                        value={gamingMetaverseNotes}
                        onChange={(e) => setGamingMetaverseNotes(e.target.value)}
                        placeholder="Document your gaming strategies, metaverse experiences, or virtual economy insights..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep track of your gaming experiences and metaverse insights (this is stored locally)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="gaming-metaverse-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Gaming Metaverse Understanding Confirmation
                      </label>
                      <input
                        type="text"
                        id="gaming-metaverse-confirmation"
                        value={gamingMetaverseConfirmation}
                        onChange={(e) => setGamingMetaverseConfirmation(e.target.value)}
                        placeholder="Type 'I understand' to confirm your gaming metaverse understanding"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type &quot;I understand&quot; to confirm you understand Web3 gaming and metaverse principles
                      </p>
                    </div>
                    
                    {/* Gaming Platform Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Gaming Platforms:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://axieinfinity.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          Axie Infinity
                        </a>
                        <a
                          href="https://www.sandbox.game/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          The Sandbox
                        </a>
                        <a
                          href="https://decentraland.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Decentraland
                        </a>
                        <a
                          href="https://illuvium.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Illuvium
                        </a>
                        <a
                          href="https://godsunchained.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          Gods Unchained
                        </a>
                        <a
                          href="https://splinterlands.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          Splinterlands
                        </a>
                      </div>
                    </div>
                    
                    {/* Metaverse Platforms Links */}
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Metaverse & Virtual Worlds:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="https://www.sandbox.game/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        >
                          The Sandbox
                        </a>
                        <a
                          href="https://decentraland.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                        >
                          Decentraland
                        </a>
                        <a
                          href="https://www.cryptovoxels.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                        >
                          Cryptovoxels
                        </a>
                        <a
                          href="https://somniumspace.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                        >
                          Somnium Space
                        </a>
                        <a
                          href="https://www.voxels.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 transition"
                        >
                          Voxels
                        </a>
                        <a
                          href="https://www.spatial.io/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition"
                        >
                          Spatial
                        </a>
                      </div>
                    </div>
                    
                    {/* Gaming Tips */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Web3 Gaming Tips:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Research games before investing - check tokenomics</li>
                        <li>• Start with free-to-play games to learn mechanics</li>
                        <li>• Understand gas costs for in-game transactions</li>
                        <li>• Join gaming guilds for better opportunities</li>
                        <li>• Diversify across different gaming platforms</li>
                        <li>• Keep track of your gaming earnings and expenses</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={confirmGamingMetaverse}
                      disabled={!selectedGamingPlatform.trim() || !gamingMetaverseActivity.trim() || !gamingMetaverseConfirmation.trim()}
                      className="w-full px-4 py-2 rounded-md bg-purple-600 text-white border border-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Confirm Gaming Metaverse Mastery
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 16 Completed Section */}
              {isStep16Completed() && (
                <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h3 className="text-lg font-semibold mb-3 text-purple-900">🎉 Step 16 Complete!</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-purple-200 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Platform:</strong> {selectedGamingPlatform}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>Activity:</strong> {gamingMetaverseActivity}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>Played to Earn:</strong> {hasPlayedToEarn ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>Owned Metaverse Land:</strong> {hasOwnedMetaverseLand ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-purple-800">
                        <strong>Participated in Virtual World:</strong> {hasParticipatedInVirtualWorld ? 'Yes' : 'No'}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Gaming metaverse mastery confirmed and saved to localStorage
                      </p>
                    </div>
                    
                    {gamingMetaverseNotes && (
                      <div className="p-3 bg-white border border-purple-200 rounded-md">
                        <p className="text-sm text-purple-800">
                          <strong>Gaming Metaverse Notes:</strong>
                        </p>
                        <p className="text-xs text-purple-700 mt-1 whitespace-pre-wrap">
                          {gamingMetaverseNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-white border border-purple-200 rounded-md">
                      <p className="text-sm text-purple-800">
                        <strong>Congratulations!</strong> You've mastered Web3 gaming and metaverse!
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        You've completed the METAVERSE Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, DAO governance, Web3 social identity aggregation, Web3 development, advanced trading analytics, and Web3 gaming metaverse!
                      </p>
                    </div>
                    
                    <p className="text-xs text-purple-600 mt-2">
                      🎮🌐🎊 You are now a METAVERSE Web3 master! You can navigate virtual worlds, earn through gaming, and build virtual economies! 🎊🌐🎮
                    </p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-red-600 text-sm font-medium">
                      ⚠️ {error}
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex flex-col items-center gap-4 lg:ml-8">
          <Image
            className=""
            src="/space-wolf-large.png"
            alt="Spacewolf Journey logo"
            width={380}
            height={380}
            priority
          />
          <button onClick={redirect} className="cursor-pointer">
            <Image
              className=""
              src="/GitHub_light.svg"
              alt="GitHub"
              width={50}
              height={50}
              priority
            />
          </button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}


