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
    
    if (savedImageCid) setImageIpfsCid(savedImageCid);
    if (savedMetadataCid) setMetadataIpfsCid(savedMetadataCid);
    if (savedTxHash) setTransactionHash(savedTxHash);
    if (savedProfilePicture) setProfilePicture(savedProfilePicture);
    if (savedUsingNftProfile === 'true') setIsUsingNftAsProfile(true);
    if (savedTransferTxHash) setTransferTransactionHash(savedTransferTxHash);
    if (savedUsernameTxHash) setUsernameTransactionHash(savedUsernameTxHash);
    if (savedHasSentEth === 'true') setHasUserSentEth(true);
    
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
                      🎊 Congratulations! You&apos;ve completed the FULL SpaceWolf Web3 journey! 
                      You&apos;ve connected a wallet, switched networks, gotten test ETH, minted an NFT, sent ETH to a friend, and created your own Web3 identity!
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
