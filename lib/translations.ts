export type Language = 'fr' | 'en';

export interface Translations {
  // Navigation et modes
  create: string;
  import: string;
  restore: string;
  login: string;
  logout: string;
  
  // Titres et descriptions
  secureWallet: string;
  secureWalletDescription: string;
  createNewWallet: string;
  createNewWalletDescription: string;
  importExistingWallet: string;
  importExistingWalletDescription: string;
  restoreWithMnemonic: string;
  restoreWithMnemonicDescription: string;
  connectToWallet: string;
  connectToWalletDescription: string;
  
  // Champs de formulaire
  password: string;
  confirmPassword: string;
  privateKey: string;
  mnemonicPhrase: string;
  savedWallet: string;
  selectWallet: string;
  
  // Placeholders
  securePassword: string;
  confirmSecurePassword: string;
  enterPrivateKey: string;
  enterMnemonicPhrase: string;
  passwordToEncrypt: string;
  walletPassword: string;
  
  // Boutons
  createWallet: string;
  importWallet: string;
  restoreWallet: string;
  connect: string;
  creating: string;
  importing: string;
  restoring: string;
  connecting: string;
  
  // Messages de succès
  walletCreatedSuccess: string;
  walletImportedSuccess: string;
  walletRestoredSuccess: string;
  loginSuccess: string;
  logoutSuccess: string;
  
  // Messages d'erreur
  passwordsDoNotMatch: string;
  passwordCriteriaNotMet: string;
  fillAllFields: string;
  selectWalletAndPassword: string;
  initializationError: string;
  creationError: string;
  importError: string;
  restoreError: string;
  connectionError: string;
  walletNotFound: string;
  incorrectPassword: string;
  walletNotConnected: string;
  
  // Validation du mot de passe
  passwordStrength: string;
  weak: string;
  medium: string;
  strong: string;
  passwordRequirements: string;
  
  // Phrase de récupération
  recoveryPhrase: string;
  recoveryPhraseDescription: string;
  savePhraseSecurely: string;
  phraseSaved: string;
  
  // Interface principale
  spaceWolf: string;
  welcomeToSpaceWolf: string;
  spaceWolfDescription: string;
  discoverWeb3: string;
  connectYourWallet: string;
  gameProgress: string;
  achievements: string;
  level: string;
  balance: string;
  address: string;
  copyAddress: string;
  addressCopied: string;
  
  // Étapes du jeu
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;
  
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  step5Title: string;
  step6Title: string;
  
  step1Description: string;
  step2Description: string;
  step3Description: string;
  step4Description: string;
  step5Description: string;
  step6Description: string;
  
  // Actions
  start: string;
  next: string;
  previous: string;
  complete: string;
  mint: string;
  transfer: string;
  claim: string;
  
  // Tokens et récompenses
  swTokens: string;
  claimTokens: string;
  tokensClaimed: string;
  
  // NFT
  createNFT: string;
  uploadImage: string;
  nftName: string;
  nftDescription: string;
  mintNFT: string;
  nftMinted: string;
  
  // Transfert ETH
  transferETH: string;
  friendAddress: string;
  amount: string;
  sendETH: string;
  ethTransferred: string;
  
  // Profil Web3
  createWeb3Profile: string;
  profileName: string;
  profileDescription: string;
  createProfile: string;
  profileCreated: string;
  
  // Gouvernance
  createProposal: string;
  proposalTitle: string;
  proposalDescription: string;
  submitProposal: string;
  proposalCreated: string;
  
  // Hardware Wallet
  connectHardwareWallet: string;
  selectHardwareWallet: string;
  ledger: string;
  trezor: string;
  securityConfirmation: string;
  connectHardware: string;
  hardwareConnected: string;
  
  // Général
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    // Navigation et modes
    create: 'Créer',
    import: 'Importer',
    restore: 'Restaurer',
    login: 'Connexion',
    logout: 'Se déconnecter',
    
    // Titres et descriptions
    secureWallet: 'Portefeuille Sécurisé',
    secureWalletDescription: 'Gérez vos wallets de manière sécurisée',
    createNewWallet: 'Créer un nouveau portefeuille',
    createNewWalletDescription: 'Générez un nouveau wallet avec une phrase de récupération sécurisée',
    importExistingWallet: 'Importer un portefeuille existant',
    importExistingWalletDescription: 'Importez votre wallet avec une clé privée',
    restoreWithMnemonic: 'Restaurer avec phrase mnémonique',
    restoreWithMnemonicDescription: 'Récupérez votre wallet avec votre phrase de récupération',
    connectToWallet: 'Se connecter',
    connectToWalletDescription: 'Accédez à votre wallet sauvegardé',
    
    // Champs de formulaire
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    privateKey: 'Clé privée',
    mnemonicPhrase: 'Phrase mnémonique',
    savedWallet: 'Portefeuille sauvegardé',
    selectWallet: 'Sélectionner un portefeuille',
    
    // Placeholders
    securePassword: 'Mot de passe sécurisé',
    confirmSecurePassword: 'Confirmer le mot de passe',
    enterPrivateKey: '0x...',
    enterMnemonicPhrase: 'word1 word2 word3...',
    passwordToEncrypt: 'Mot de passe pour chiffrer',
    walletPassword: 'Mot de passe du portefeuille',
    
    // Boutons
    createWallet: 'Créer le portefeuille',
    importWallet: 'Importer le portefeuille',
    restoreWallet: 'Restaurer le portefeuille',
    connect: 'Se connecter',
    creating: 'Création...',
    importing: 'Importation...',
    restoring: 'Restauration...',
    connecting: 'Connexion...',
    
    // Messages de succès
    walletCreatedSuccess: 'Wallet créé avec succès !',
    walletImportedSuccess: 'Wallet importé avec succès !',
    walletRestoredSuccess: 'Wallet restauré avec succès !',
    loginSuccess: 'Connexion réussie !',
    logoutSuccess: 'Déconnexion réussie',
    
    // Messages d'erreur
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    passwordCriteriaNotMet: 'Le mot de passe ne respecte pas les critères de sécurité',
    fillAllFields: 'Veuillez remplir tous les champs',
    selectWalletAndPassword: 'Veuillez sélectionner un wallet et entrer le mot de passe',
    initializationError: 'Erreur d\'initialisation',
    creationError: 'Erreur de création',
    importError: 'Erreur d\'importation',
    restoreError: 'Erreur de restauration',
    connectionError: 'Erreur de connexion',
    walletNotFound: 'Wallet non trouvé',
    incorrectPassword: 'Mot de passe incorrect',
    walletNotConnected: 'Wallet non connecté',
    
    // Validation du mot de passe
    passwordStrength: 'Force',
    weak: 'Faible',
    medium: 'Moyen',
    strong: 'Fort',
    passwordRequirements: 'Critères de sécurité',
    
    // Phrase de récupération
    recoveryPhrase: 'Phrase de récupération',
    recoveryPhraseDescription: 'Sauvegardez cette phrase dans un endroit sûr. Elle vous permettra de récupérer votre portefeuille.',
    savePhraseSecurely: 'J\'ai sauvegardé la phrase',
    phraseSaved: 'Phrase sauvegardée',
    
    // Interface principale
    spaceWolf: 'SpaceWolf',
    welcomeToSpaceWolf: 'Bienvenue dans SpaceWolf',
    spaceWolfDescription: 'Salut, je suis SpaceWolf, un humain connu sous le nom de Pierre Untas, qui veut partager son amour pour le Web3. En tant que développeur web C#, j\'apprends Solidity et tout ce qui concerne la blockchain chez Alyra. Bienvenue chez moi, n\'hésitez pas à explorer mes projets GitHub.',
    discoverWeb3: 'Découvrez le Web3 étape par étape !',
    connectYourWallet: 'Connectez votre portefeuille',
    gameProgress: 'Progression du jeu',
    achievements: 'Succès',
    level: 'Niveau',
    balance: 'Solde',
    address: 'Adresse',
    copyAddress: 'Copier l\'adresse',
    addressCopied: 'Adresse copiée',
    
    // Étapes du jeu
    step1: 'Étape 1',
    step2: 'Étape 2',
    step3: 'Étape 3',
    step4: 'Étape 4',
    step5: 'Étape 5',
    step6: 'Étape 6',
    
    step1Title: 'Création du Wallet',
    step2Title: 'Connexion au Réseau',
    step3Title: 'Mintage NFT',
    step4Title: 'Transfert ETH',
    step5Title: 'Profil Web3',
    step6Title: 'Gouvernance',
    
    step1Description: 'Créez votre premier wallet sécurisé',
    step2Description: 'Connectez-vous au réseau Ethereum',
    step3Description: 'Créez votre premier NFT',
    step4Description: 'Transférez des ETH à un ami',
    step5Description: 'Créez votre identité Web3',
    step6Description: 'Participez à la gouvernance',
    
    // Actions
    start: 'Commencer',
    next: 'Suivant',
    previous: 'Précédent',
    complete: 'Terminer',
    mint: 'Minter',
    transfer: 'Transférer',
    claim: 'Réclamer',
    
    // Tokens et récompenses
    swTokens: 'Tokens SW',
    claimTokens: 'Réclamer les tokens',
    tokensClaimed: 'Tokens réclamés',
    
    // NFT
    createNFT: 'Créer un NFT',
    uploadImage: 'Télécharger une image',
    nftName: 'Nom du NFT',
    nftDescription: 'Description du NFT',
    mintNFT: 'Minter le NFT',
    nftMinted: 'NFT minté',
    
    // Transfert ETH
    transferETH: 'Transférer des ETH',
    friendAddress: 'Adresse de l\'ami',
    amount: 'Montant',
    sendETH: 'Envoyer des ETH',
    ethTransferred: 'ETH transférés',
    
    // Profil Web3
    createWeb3Profile: 'Créer un profil Web3',
    profileName: 'Nom du profil',
    profileDescription: 'Description du profil',
    createProfile: 'Créer le profil',
    profileCreated: 'Profil créé',
    
    // Gouvernance
    createProposal: 'Créer une proposition',
    proposalTitle: 'Titre de la proposition',
    proposalDescription: 'Description de la proposition',
    submitProposal: 'Soumettre la proposition',
    proposalCreated: 'Proposition créée',
    
    // Hardware Wallet
    connectHardwareWallet: 'Connecter un wallet matériel',
    selectHardwareWallet: 'Sélectionner un wallet matériel',
    ledger: 'Ledger',
    trezor: 'Trezor',
    securityConfirmation: 'Confirmation de sécurité',
    connectHardware: 'Connecter le wallet matériel',
    hardwareConnected: 'Wallet matériel connecté',
    
    // Général
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Sauvegarder',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
  },
  
  en: {
    // Navigation et modes
    create: 'Create',
    import: 'Import',
    restore: 'Restore',
    login: 'Login',
    logout: 'Logout',
    
    // Titres et descriptions
    secureWallet: 'Secure Wallet',
    secureWalletDescription: 'Manage your wallets securely',
    createNewWallet: 'Create a new wallet',
    createNewWalletDescription: 'Generate a new wallet with a secure recovery phrase',
    importExistingWallet: 'Import existing wallet',
    importExistingWalletDescription: 'Import your wallet with a private key',
    restoreWithMnemonic: 'Restore with mnemonic phrase',
    restoreWithMnemonicDescription: 'Recover your wallet with your recovery phrase',
    connectToWallet: 'Connect',
    connectToWalletDescription: 'Access your saved wallet',
    
    // Champs de formulaire
    password: 'Password',
    confirmPassword: 'Confirm password',
    privateKey: 'Private key',
    mnemonicPhrase: 'Mnemonic phrase',
    savedWallet: 'Saved wallet',
    selectWallet: 'Select wallet',
    
    // Placeholders
    securePassword: 'Secure password',
    confirmSecurePassword: 'Confirm password',
    enterPrivateKey: '0x...',
    enterMnemonicPhrase: 'word1 word2 word3...',
    passwordToEncrypt: 'Password to encrypt',
    walletPassword: 'Wallet password',
    
    // Boutons
    createWallet: 'Create wallet',
    importWallet: 'Import wallet',
    restoreWallet: 'Restore wallet',
    connect: 'Connect',
    creating: 'Creating...',
    importing: 'Importing...',
    restoring: 'Restoring...',
    connecting: 'Connecting...',
    
    // Messages de succès
    walletCreatedSuccess: 'Wallet created successfully!',
    walletImportedSuccess: 'Wallet imported successfully!',
    walletRestoredSuccess: 'Wallet restored successfully!',
    loginSuccess: 'Login successful!',
    logoutSuccess: 'Logout successful',
    
    // Messages d'erreur
    passwordsDoNotMatch: 'Passwords do not match',
    passwordCriteriaNotMet: 'Password does not meet security criteria',
    fillAllFields: 'Please fill all fields',
    selectWalletAndPassword: 'Please select a wallet and enter password',
    initializationError: 'Initialization error',
    creationError: 'Creation error',
    importError: 'Import error',
    restoreError: 'Restore error',
    connectionError: 'Connection error',
    walletNotFound: 'Wallet not found',
    incorrectPassword: 'Incorrect password',
    walletNotConnected: 'Wallet not connected',
    
    // Validation du mot de passe
    passwordStrength: 'Strength',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    passwordRequirements: 'Security criteria',
    
    // Phrase de récupération
    recoveryPhrase: 'Recovery phrase',
    recoveryPhraseDescription: 'Save this phrase in a safe place. It will allow you to recover your wallet.',
    savePhraseSecurely: 'I have saved the phrase',
    phraseSaved: 'Phrase saved',
    
    // Interface principale
    spaceWolf: 'SpaceWolf',
    welcomeToSpaceWolf: 'Welcome to SpaceWolf',
    spaceWolfDescription: 'Hi, I\'m SpaceWolf, a human known as Pierre Untas, who wants to share his love for Web3. Programming as a C# web developer, I\'m learning Solidity and stuff about blockchain at Alyra. Welcome home, feel free to travel around my GitHub projects.',
    discoverWeb3: 'Discover Web3 step by step!',
    connectYourWallet: 'Connect your wallet',
    gameProgress: 'Game progress',
    achievements: 'Achievements',
    level: 'Level',
    balance: 'Balance',
    address: 'Address',
    copyAddress: 'Copy address',
    addressCopied: 'Address copied',
    
    // Étapes du jeu
    step1: 'Step 1',
    step2: 'Step 2',
    step3: 'Step 3',
    step4: 'Step 4',
    step5: 'Step 5',
    step6: 'Step 6',
    
    step1Title: 'Wallet Creation',
    step2Title: 'Network Connection',
    step3Title: 'NFT Minting',
    step4Title: 'ETH Transfer',
    step5Title: 'Web3 Profile',
    step6Title: 'Governance',
    
    step1Description: 'Create your first secure wallet',
    step2Description: 'Connect to Ethereum network',
    step3Description: 'Create your first NFT',
    step4Description: 'Transfer ETH to a friend',
    step5Description: 'Create your Web3 identity',
    step6Description: 'Participate in governance',
    
    // Actions
    start: 'Start',
    next: 'Next',
    previous: 'Previous',
    complete: 'Complete',
    mint: 'Mint',
    transfer: 'Transfer',
    claim: 'Claim',
    
    // Tokens et récompenses
    swTokens: 'SW Tokens',
    claimTokens: 'Claim tokens',
    tokensClaimed: 'Tokens claimed',
    
    // NFT
    createNFT: 'Create NFT',
    uploadImage: 'Upload image',
    nftName: 'NFT name',
    nftDescription: 'NFT description',
    mintNFT: 'Mint NFT',
    nftMinted: 'NFT minted',
    
    // Transfert ETH
    transferETH: 'Transfer ETH',
    friendAddress: 'Friend\'s address',
    amount: 'Amount',
    sendETH: 'Send ETH',
    ethTransferred: 'ETH transferred',
    
    // Profil Web3
    createWeb3Profile: 'Create Web3 profile',
    profileName: 'Profile name',
    profileDescription: 'Profile description',
    createProfile: 'Create profile',
    profileCreated: 'Profile created',
    
    // Gouvernance
    createProposal: 'Create proposal',
    proposalTitle: 'Proposal title',
    proposalDescription: 'Proposal description',
    submitProposal: 'Submit proposal',
    proposalCreated: 'Proposal created',
    
    // Hardware Wallet
    connectHardwareWallet: 'Connect hardware wallet',
    selectHardwareWallet: 'Select hardware wallet',
    ledger: 'Ledger',
    trezor: 'Trezor',
    securityConfirmation: 'Security confirmation',
    connectHardware: 'Connect hardware wallet',
    hardwareConnected: 'Hardware wallet connected',
    
    // Général
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
  },
};
