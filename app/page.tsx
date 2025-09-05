"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);

  function redirect() {
    router.push("https://github.com/pierreuntas");
  }

  async function connectWallet() {
    try {
      if (!hasMetaMask) {
        setError('MetaMask not detected. Please install the extension.');
        return;
      }
      const ethereum = (window as any).ethereum;
      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts?.[0] ?? null);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to connect wallet');
    }
  }

  useEffect(() => {
    setMounted(true);
    const ethereum = (window as any)?.ethereum;
    const detected = !!ethereum?.isMetaMask;
    setHasMetaMask(detected);

    if (!detected) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts?.[0] ?? null);
    };

    // Get already authorized accounts on load
    ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: string[]) => setAccount(accounts?.[0] ?? null))
      .catch(() => {});

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-center sm:text-left">
          SPACEWOLF JOURNEY
        </h1>
        <p className="text-lg sm:text-xl text-center sm:text-left">
          Hi, I&apos;m SpaceWolf, a human known as Pierre Untas, who wants to share his love for Web3. Programming as a C# web developer, I&apos;m learning Solidity and stuff about blockchain at Alyra. Welcome home, feel free to travel around my GitHub projects.
        </p>
        <p className="text-lg sm:text-2xl font-semibold text-center sm:text-left opacity-95">
          Discover Web3 step by step!
        </p>
        {mounted && (
          <>
            <div className="flex items-center gap-4">
              <button
                onClick={connectWallet}
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-300 hover:opacity-95 transition"
              >
                {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect MetaMask'}
              </button>
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
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </>
        )}
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
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
