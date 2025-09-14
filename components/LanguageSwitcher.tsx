"use client";

import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Language } from '../lib/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex bg-[#eeddde] rounded-lg p-1">
        <button
          onClick={() => handleLanguageChange('fr')}
          className={`px-2 py-1 rounded-md text-lg transition-all duration-200 ${
            language === 'fr'
              ? 'bg-[#fcd6c5] shadow-sm'
              : 'hover:bg-[#fcd6c5]/50'
          }`}
        >
          🇫🇷
        </button>
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-2 py-1 rounded-md text-lg transition-all duration-200 ${
            language === 'en'
              ? 'bg-[#fcd6c5] shadow-sm'
              : 'hover:bg-[#fcd6c5]/50'
          }`}
        >
          🇺🇸
        </button>
      </div>
    </div>
  );
}
