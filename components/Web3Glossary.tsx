"use client";

import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

export default function Web3Glossary() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const glossaryTerms: GlossaryTerm[] = language === 'fr' ? [
    {
      term: 'Wallet',
      definition: 'Un portefeuille numérique qui stocke vos clés privées et permet d\'interagir avec la blockchain.',
      example: 'Comme un compte bancaire, mais pour les cryptomonnaies.'
    },
    {
      term: 'Blockchain',
      definition: 'Une base de données décentralisée qui enregistre toutes les transactions de manière transparente et sécurisée.',
      example: 'Ethereum, Bitcoin, Polygon sont des blockchains.'
    },
    {
      term: 'NFT',
      definition: 'Non-Fungible Token - Un certificat numérique unique qui prouve la propriété d\'un objet digital.',
      example: 'Une œuvre d\'art numérique, un avatar, un objet de jeu.'
    },
    {
      term: 'DeFi',
      definition: 'Finance Décentralisée - Services financiers sans intermédiaires bancaires.',
      example: 'Prêt, emprunt, échange de tokens directement sur la blockchain.'
    },
    {
      term: 'Smart Contract',
      definition: 'Un programme qui s\'exécute automatiquement sur la blockchain selon des règles prédéfinies.',
      example: 'Comme un contrat légal, mais qui s\'exécute tout seul.'
    },
    {
      term: 'Gas',
      definition: 'Frais payés pour exécuter des transactions sur la blockchain Ethereum.',
      example: 'Comme les frais bancaires, mais payés en ETH.'
    },
    {
      term: 'ENS',
      definition: 'Ethereum Name Service - Système qui permet d\'utiliser des noms lisibles au lieu d\'adresses longues.',
      example: 'pierre.eth au lieu de 0x1234...5678'
    },
    {
      term: 'IPFS',
      definition: 'InterPlanetary File System - Système de stockage de fichiers décentralisé.',
      example: 'Comme Google Drive, mais distribué sur plusieurs ordinateurs.'
    },
    {
      term: 'DAO',
      definition: 'Decentralized Autonomous Organization - Organisation gérée par des règles programmées et des votes communautaires.',
      example: 'Une entreprise sans PDG, dirigée par les détenteurs de tokens.'
    },
    {
      term: 'Web3',
      definition: 'Internet décentralisé où les utilisateurs contrôlent leurs données et identités.',
      example: 'L\'évolution d\'Internet vers plus de contrôle utilisateur.'
    }
  ] : [
    {
      term: 'Wallet',
      definition: 'A digital wallet that stores your private keys and allows interaction with the blockchain.',
      example: 'Like a bank account, but for cryptocurrencies.'
    },
    {
      term: 'Blockchain',
      definition: 'A decentralized database that records all transactions transparently and securely.',
      example: 'Ethereum, Bitcoin, Polygon are blockchains.'
    },
    {
      term: 'NFT',
      definition: 'Non-Fungible Token - A unique digital certificate that proves ownership of a digital object.',
      example: 'A digital artwork, avatar, or game item.'
    },
    {
      term: 'DeFi',
      definition: 'Decentralized Finance - Financial services without banking intermediaries.',
      example: 'Lending, borrowing, token swapping directly on the blockchain.'
    },
    {
      term: 'Smart Contract',
      definition: 'A program that automatically executes on the blockchain according to predefined rules.',
      example: 'Like a legal contract, but executes automatically.'
    },
    {
      term: 'Gas',
      definition: 'Fees paid to execute transactions on the Ethereum blockchain.',
      example: 'Like banking fees, but paid in ETH.'
    },
    {
      term: 'ENS',
      definition: 'Ethereum Name Service - System that allows using readable names instead of long addresses.',
      example: 'pierre.eth instead of 0x1234...5678'
    },
    {
      term: 'IPFS',
      definition: 'InterPlanetary File System - Decentralized file storage system.',
      example: 'Like Google Drive, but distributed across multiple computers.'
    },
    {
      term: 'DAO',
      definition: 'Decentralized Autonomous Organization - Organization managed by programmed rules and community votes.',
      example: 'A company without a CEO, run by token holders.'
    },
    {
      term: 'Web3',
      definition: 'Decentralized internet where users control their data and identities.',
      example: 'The evolution of the internet towards more user control.'
    }
  ];

  const filteredTerms = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-white"
        style={{
          background: 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))'
        }}
      >
        📚 {language === 'fr' ? 'Glossaire Web3' : 'Web3 Glossary'}
        <svg 
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-96 rounded-lg shadow-2xl border overflow-hidden"
             style={{
               backgroundColor: 'var(--theme-background)',
               borderColor: 'var(--theme-accent-2)'
             }}>
          <div className="p-4 border-b" style={{ borderBottomColor: 'var(--theme-accent-2)' }}>
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher un terme...' : 'Search a term...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{
                borderColor: 'var(--theme-accent-2)',
                color: 'var(--theme-text)'
              }}
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {filteredTerms.map((term, index) => (
              <div key={index} className="p-3 border-b last:border-b-0" style={{ borderBottomColor: 'var(--theme-accent-2)' }}>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--theme-text)' }}>{term.term}</h4>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text)' }}>{term.definition}</p>
                {term.example && (
                  <p className="text-xs mt-1 italic opacity-70" style={{ color: 'var(--theme-text)' }}>
                    💡 {term.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
