"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createHelia, Helia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { ethers } from 'ethers';

type EthereumRequestArgs = {
  method: string;
  params?: unknown[];
};

type EthereumProvider = {
  isMetaMask?: boolean;
  request: <T = unknown>(args: EthereumRequestArgs) => Promise<T>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

type WindowWithEthereum = Window & { ethereum?: EthereumProvider };

export default function Home() {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  
  // Step 4 NFT minting states
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

  // Helper functions to check step completion
  const isStep2Completed = () => chainId === '0xaa36a7';
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
      setError('Please type "I understand" exactly to confirm your security understanding');
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
      setError('Please type "I understand" exactly to confirm your DeFi understanding');
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
      setError('Please type "I understand" exactly to confirm your L2 understanding');
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
      setError('Please type "I understand" exactly to confirm your NFT marketplace understanding');
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
      setError('Please type "I understand" exactly to confirm your DAO governance understanding');
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
      setError('Please type "I understand" exactly to confirm your Web3 social understanding');
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
      setError('Please type "I understand" exactly to confirm your Web3 development understanding');
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

  async function connectWallet() {
    try {
      if (!hasMetaMask) {
        setError('MetaMask not detected. Please install the extension.');
        return;
      }
      const ethereum = (window as WindowWithEthereum).ethereum as EthereumProvider;
      const accounts = await ethereum.request<string[]>({ method: 'eth_requestAccounts' });
      setAccount(accounts?.[0] ?? null);
      
      // Check transaction history after connecting wallet
      if (accounts?.[0] && chainId === '0xaa36a7') {
        setTimeout(() => checkUserTransactionHistory(), 1000); // Small delay to ensure state is updated
      }
      
      setError(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to connect wallet';
      setError(message);
    }
  }

  async function switchToSepolia() {
    try {
      if (!hasMetaMask) {
        setError('MetaMask not detected. Please install the extension.');
        return;
      }
      const ethereum = (window as WindowWithEthereum).ethereum as EthereumProvider;
      // Try to switch first
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      });
      setError(null);
    } catch (e: unknown) {
      // 4902 = Unrecognized chain, attempt to add
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes('4902')) {
        try {
          const ethereum = (window as WindowWithEthereum).ethereum as EthereumProvider;
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
                rpcUrls: ['https://sepolia.optimism.io', 'https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
          setError(null);
        } catch (addErr: unknown) {
          setError(addErr instanceof Error ? addErr.message : 'Failed to add Sepolia');
        }
      } else {
        setError(message || 'Failed to switch network');
      }
    }
  }

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

  // Reset profile picture
  const resetProfilePicture = () => {
    setProfilePicture(null);
    setIsUsingNftAsProfile(false);
    
    // Remove from localStorage
    localStorage.removeItem('spacewolf-profile-picture');
    localStorage.removeItem('spacewolf-using-nft-profile');
    
    console.log('Profile picture reset');
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
      const ethereum = (window as WindowWithEthereum).ethereum as EthereumProvider;
      
      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // For now, we'll simulate ENS registration with a real transaction
      // This creates a real transaction that demonstrates the concept
      // In a production app, you'd integrate with ENS or similar service
      
      // Create a simple transaction that writes to the blockchain
      // This simulates domain registration by creating a real transaction
      // We'll send a tiny amount to a burn address with the domain hash as data
      const tx = await signer.sendTransaction({
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
      const ethereum = (window as WindowWithEthereum).ethereum as EthereumProvider;
      
      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // Convert ETH to Wei
      const amountWei = ethers.parseEther(ethAmount);
      
      // Estimate gas for the transaction
      const gasEstimate = await provider.estimateGas({
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
      const txResponse = await signer.sendTransaction(transaction);
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
      const contractABI = [
        {
          "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "string", "name": "uri", "type": "string"}
          ],
          "name": "safeMint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];

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
    
    // Check if user has sent ETH to any address (from transaction history)
    if (account && chainId === '0xaa36a7') {
      checkUserTransactionHistory();
    }
  }, [account, chainId, checkUserTransactionHistory]);

  useEffect(() => {
    setMounted(true);
    const ethereum = (window as WindowWithEthereum)?.ethereum;
    const detected = !!ethereum?.isMetaMask;
    setHasMetaMask(detected);

    if (!detected) return;

    const fetchBalanceFor = async (address: string | null) => {
      if (!address) {
        setBalanceEth(null);
        return;
      }
      try {
        const weiHex = await ethereum.request<string>({ method: 'eth_getBalance', params: [address, 'latest'] });
        setBalanceEth(formatWeiToEth4dp(weiHex));
      } catch {
        setBalanceEth(null);
      }
    };

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = (Array.isArray(args) ? (args[0] as string[] | undefined) : undefined) ?? [];
      const next = accounts?.[0] ?? null;
      setAccount(next);
      fetchBalanceFor(next);
    };
    const handleChainChanged = (...args: unknown[]) => {
      const newChainId = (Array.isArray(args) ? (args[0] as string | undefined) : undefined) ?? null;
      if (newChainId) setChainId(newChainId);
      ethereum.request<string[]>({ method: 'eth_accounts' })
        .then((accounts) => {
          const next = accounts?.[0] ?? null;
          setAccount(next);
          fetchBalanceFor(next);
        })
        .catch(() => {});
    };
    const handleConnect = () => {
      // On provider connect, refresh accounts and balance
      ethereum.request<string[]>({ method: 'eth_accounts' })
        .then((accounts) => {
          const next = accounts?.[0] ?? null;
          setAccount(next);
          fetchBalanceFor(next);
        })
        .catch(() => {});
    };
    const handleDisconnect = () => {
      setAccount(null);
      setBalanceEth(null);
    };

    // Get already authorized accounts on load
    ethereum
      .request<string[]>({ method: 'eth_accounts' })
      .then((accounts) => {
        const next = accounts?.[0] ?? null;
        setAccount(next);
        fetchBalanceFor(next);
      })
      .catch(() => {});
    ethereum
      .request<string>({ method: 'eth_chainId' })
      .then((id) => setChainId(id))
      .catch(() => {});

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);
    ethereum.on?.('connect', handleConnect);
    ethereum.on?.('disconnect', handleDisconnect);
    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
      ethereum.removeListener?.('connect', handleConnect);
      ethereum.removeListener?.('disconnect', handleDisconnect);
    };
  }, []);

  // Format wei hex string to ETH with 4 decimals without floating precision loss
  function formatWeiToEth4dp(weiHex: string): string {
    try {
      const wei = BigInt(weiHex);
      const WEI_IN_ETH = BigInt("1000000000000000000"); // 1e18
      const ether = wei / WEI_IN_ETH;
      const remainder = wei % WEI_IN_ETH;
      const frac = remainder.toString().padStart(18, '0').slice(0, 4);
      const trimmedFrac = frac.replace(/0+$/, '');
      return trimmedFrac ? `${ether.toString()}.${trimmedFrac}` : ether.toString();
    } catch {
      return '0';
    }
  }

  // Backup: poll balance periodically and on deps change
  useEffect(() => {
    if (!mounted || !hasMetaMask || !account) {
      setBalanceEth(null);
      return;
    }
    const ethereum = (window as WindowWithEthereum).ethereum as EthereumProvider;
    let cancelled = false;

    const fetchBalance = async () => {
      try {
        const weiHex = await ethereum.request<string>({ method: 'eth_getBalance', params: [account, 'latest'] });
        if (!cancelled) setBalanceEth(formatWeiToEth4dp(weiHex));
      } catch {
        if (!cancelled) setBalanceEth(null);
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 15000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [mounted, hasMetaMask, account, chainId]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      {mounted && (
        <div className="fixed top-4 right-4 z-50">
          <div
            onClick={!account ? connectWallet : undefined}
            role={!account ? 'button' : undefined}
            className={`flex items-center gap-2 rounded-md border border-gray-200 bg-white/80 backdrop-blur px-3 py-2 shadow-sm text-xs sm:text-sm ${!account ? 'cursor-pointer hover:bg-white' : 'cursor-default'}`}
            aria-label={!account ? 'Connect wallet' : 'Wallet balance'}
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
                    <span className="text-gray-900 font-semibold">Ξ {balanceEth ?? '...'}</span>
                    {registeredUsername && (
                      <span className="text-xs text-purple-600 font-medium">
                        {registeredUsername}.eth
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Connect wallet</span>
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
            Hi, I&apos;m SpaceWolf, a human known as Pierre Untas, who wants to share his love for Web3. Programming as a C# web developer, I&apos;m learning Solidity and stuff about blockchain at Alyra. Welcome home, feel free to travel around my GitHub projects.
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-center sm:text-left opacity-95 pt-2">
            Discover Web3 step by step!
          </p>
          {mounted && (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 transition cursor-pointer"
                >
                  {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect MetaMask'}
                </button>
                {chainId !== '0xaa36a7' && (
                  <button
                    onClick={switchToSepolia}
                    className="px-3 py-2 rounded-md bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 transition cursor-pointer"
                  >
                    Switch to Sepolia
                  </button>
                )}
                {!hasMetaMask && (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline text-gray-800 opacity-90 font-medium"
                  >
                    Get MetaMask
                  </a>
                )}
              </div>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 1</span>
                <span className="align-middle">First connect a wallet, or create one on MetaMask.</span>
                {account && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="connected">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 2</span>
                <span className="align-middle">Switch to Sepolia test network.</span>
                {isStep2Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="on-sepolia">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 3</span>
                <span className="align-middle">Get Sepolia ETH for testing.</span>
                {isStep3Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="has-sepolia-eth">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 4</span>
                <span className="align-middle">Mint an NFT with IPFS metadata.</span>
                {isStep4Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="nft-minted">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 5</span>
                <span className="align-middle">Send ETH to a friend&apos;s address.</span>
                {isStep5Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="eth-sent">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 6</span>
                <span className="align-middle">Create a Web3 username (.eth domain).</span>
                {isStep6Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="username-created">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 7</span>
                <span className="align-middle">Buy real ETH from a cryptocurrency exchange.</span>
                {isStep7Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="eth-purchased">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 8</span>
                <span className="align-middle">Set up advanced security with hardware wallets.</span>
                {isStep8Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="security-setup">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 9</span>
                <span className="align-middle">Explore DeFi: yield farming, staking, and lending.</span>
                {isStep9Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="defi-exploration">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 10</span>
                <span className="align-middle">Bridge to Layer 2: Polygon, Arbitrum, and low-fee DeFi.</span>
                {isStep10Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="l2-exploration">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 11</span>
                <span className="align-middle">Master NFT marketplaces: list, buy, and trade NFTs.</span>
                {isStep11Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="nft-marketplace">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 12</span>
                <span className="align-middle">Join DAO governance: vote, propose, and shape Web3 communities.</span>
                {isStep12Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="dao-governance">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 13</span>
                <span className="align-middle">Build Web3 identity: aggregate profiles and join decentralized social.</span>
                {isStep13Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="web3-social">
                    ✓
                  </span>
                )}
              </p>
              <p className="text-base sm:text-lg text-center sm:text-left opacity-90 mt-1">
                <span className="inline-block mr-2 px-2 py-0.5 rounded-full bg-[#d8d0f3] text-gray-900 text-sm font-semibold align-middle">Step 14</span>
                <span className="align-middle">Build Web3 dApps: write smart contracts and create decentralized applications.</span>
                {isStep14Completed() && (
                  <span className="ml-2 align-middle text-[#6e6289]" aria-label="web3-development">
                    ✓
                  </span>
                )}
              </p>
              {account && !isStep3Completed() && (
                <div className="flex items-center gap-4 mt-2">
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
              )}
              
              {/* Step 4 NFT Minting Section */}
              {isStep3Completed() && !isStep4Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
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
                        A local IPFS node is required to upload metadata. Click "Start IPFS Node" to initialize.
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
                                <button
                                  onClick={resetProfilePicture}
                                  disabled={!isUsingNftAsProfile}
                                  className="px-2 py-1 rounded text-xs bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Reset
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
                        disabled={isUploadingToIpfs || !selectedImage || !isIpfsNodeRunning}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                      >
                        {isUploadingToIpfs ? 'Uploading to IPFS...' : 'Upload Image to IPFS'}
                      </button>
                      
                      <button
                        onClick={simulateMintTransaction}
                        disabled={isSimulatingTransaction || !metadataIpfsCid}
                        className="px-4 py-2 rounded-md bg-green-600 text-white border border-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                      >
                        {isSimulatingTransaction ? 'Simulating...' : 'Simulate Mint Transaction'}
                      </button>
                    </div>
                    
                    {imageIpfsCid && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          <strong>Image IPFS CID:</strong> {imageIpfsCid}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Image uploaded successfully to IPFS!
                        </p>
                      </div>
                    )}
                    
                    {metadataIpfsCid && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Metadata IPFS CID:</strong> {metadataIpfsCid}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          NFT metadata uploaded successfully! CID saved to localStorage.
                        </p>
                      </div>
                    )}
                    
                    {transactionHash && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <p className="text-sm text-purple-800">
                          <strong>Transaction Hash:</strong> {transactionHash}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Minting transaction simulated successfully! Hash saved to localStorage.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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
              
              {/* Step 5 ETH Transfer Section */}
              {isStep4Completed() && !isStep5Completed() && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 5: Send ETH to a Friend</h3>
                  
                  {/* Real Transaction Warning */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Real Transaction Warning</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This will send real ETH on Sepolia testnet. Make sure you&apos;re on the correct network and have sufficient balance for gas fees.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="friend-address" className="block text-sm font-medium text-gray-700 mb-2">
                        Friend&apos;s Ethereum Address
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
                        Enter your friend&apos;s Ethereum wallet address
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
                      Great! You&apos;ve completed Step 5. Now move on to Step 6 to create your Web3 username and complete the full journey!
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
                      🎊 Congratulations! You&apos;ve completed Step 6! Now move on to Step 7 to buy real ETH and complete the ultimate Web3 journey!
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
                          Now it&apos;s time to buy real ETH! Choose a reputable exchange and purchase ETH to complete your Web3 journey.
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
                        <strong>Congratulations!</strong> You&apos;ve completed the ultimate Web3 journey!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        You&apos;ve successfully: connected a wallet, switched networks, gotten test ETH, minted an NFT, sent ETH to a friend, created a Web3 identity, and bought real ETH!
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
                        <strong>Congratulations!</strong> You&apos;ve secured your Web3 assets!
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        You&apos;ve now completed: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, and advanced security!
                      </p>
                    </div>
                    
                    <p className="text-xs text-red-600 mt-2">
                      🔐🛡️ Security setup complete! Now let&apos;s explore DeFi to make your crypto work for you! 🚀💰
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
                        <strong>Congratulations!</strong> You&apos;re now a DeFi explorer!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        You&apos;ve completed the FULL Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, and DeFi exploration!
                      </p>
                    </div>
                    
                    <p className="text-xs text-green-600 mt-2">
                      🚀💰 DeFi exploration complete! Now let&apos;s explore Layer 2 solutions for ultra-low fees! ⚡🌐
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
                        <strong>Congratulations!</strong> You&apos;ve mastered Layer 2 scaling!
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        You&apos;ve completed the ULTIMATE Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, and Layer 2 scaling!
                      </p>
                    </div>
                    
                    <p className="text-xs text-purple-600 mt-2">
                      🎊⚡ Layer 2 mastery complete! Now let&apos;s master NFT marketplaces and monetize your digital art! 🎨💰
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
                          You&apos;ve minted NFTs, now learn to trade them! Master NFT marketplaces to list your creations, 
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
                        <strong>Congratulations!</strong> You&apos;ve mastered NFT marketplaces!
                      </p>
                      <p className="text-xs text-pink-600 mt-1">
                        You&apos;ve completed the LEGENDARY Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, and NFT marketplace mastery!
                      </p>
                    </div>
                    
                    <p className="text-xs text-pink-600 mt-2">
                      🎨💰 NFT marketplace mastery complete! Now let&apos;s join DAO governance and shape Web3 communities! 🗳️✨
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
                          You&apos;ve mastered Web3 tools, now participate in governance! Join DAOs, vote on proposals, 
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
                        <strong>Congratulations!</strong> You&apos;ve mastered DAO governance!
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        You&apos;ve completed the ULTIMATE Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, and DAO governance!
                      </p>
                    </div>
                    
                    <p className="text-xs text-indigo-600 mt-2">
                      🗳️✨ DAO governance mastery complete! Now let&apos;s build comprehensive Web3 identities and join decentralized social networks! 👥🌟
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
                          You&apos;ve mastered Web3 tools and governance, now build your comprehensive identity! 
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
                        <strong>Congratulations!</strong> You&apos;ve mastered Web3 social identity!
                      </p>
                      <p className="text-xs text-teal-600 mt-1">
                        You&apos;ve completed the LEGENDARY Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, DAO governance, and Web3 social identity aggregation!
                      </p>
                    </div>
                    
                    <p className="text-xs text-teal-600 mt-2">
                      👥🌟 Web3 social mastery complete! Now let&apos;s become Web3 builders and create our own decentralized applications! 💻🚀
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
                          You&apos;ve mastered Web3 tools and social networks, now become a builder! 
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
                        <strong>Congratulations!</strong> You&apos;ve mastered Web3 development!
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        You&apos;ve completed the ULTIMATE Web3 journey: wallet connection, network switching, test ETH, NFT minting, ETH transfers, Web3 identity, real ETH purchase, advanced security, DeFi exploration, Layer 2 scaling, NFT marketplace mastery, DAO governance, Web3 social identity aggregation, and Web3 development!
                      </p>
                    </div>
                    
                    <p className="text-xs text-orange-600 mt-2">
                      💻🚀🎊 You are now an ULTIMATE Web3 builder! You can create, deploy, and build the future of decentralized applications! 🎊🚀💻
                    </p>
                  </div>
                </div>
              )}
              
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
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
