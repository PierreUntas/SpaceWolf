"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const isStep1Completed = () => !!account;
  const isStep2Completed = () => chainId === '0xaa36a7';
  const isStep3Completed = () => {
    if (!balanceEth) return false;
    const balance = parseFloat(balanceEth);
    return balance > 0;
  };

  async function connectWallet() {
    try {
      if (!hasMetaMask) {
        setError('MetaMask not detected. Please install the extension.');
        return;
      }
      const ethereum = (window as WindowWithEthereum).ethereum as EthereumProvider;
      const accounts = await ethereum.request<string[]>({ method: 'eth_requestAccounts' });
      setAccount(accounts?.[0] ?? null);
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
      } catch (e: unknown) {
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
      } catch (e: unknown) {
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
                <span className="text-gray-900 font-semibold">Ξ {balanceEth ?? '...'}</span>
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
