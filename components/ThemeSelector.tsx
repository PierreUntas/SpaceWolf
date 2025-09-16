"use client";

import React, { useState, useEffect } from 'react';

type Theme = 'spacewolf' | 'minimal';

interface ThemeSelectorProps {
  className?: string;
}

export default function ThemeSelector({ className = "" }: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('spacewolf');
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'spacewolf' as Theme,
      name: 'SpaceWolf',
      description: 'Thème original',
      colors: {
        primary: '#d8d0f3',
        secondary: '#59507b',
        accent: '#fcd6c5',
        background: '#fbf8f2'
      }
    },
    {
      id: 'minimal' as Theme,
      name: 'Minimaliste',
      description: 'Design épuré',
      colors: {
        primary: '#111827',
        secondary: '#6b7280',
        accent: '#3b82f6',
        background: '#ffffff'
      }
    }
  ];

  useEffect(() => {
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('spacewolf-theme') as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    switch (theme) {
      case 'spacewolf':
        root.style.setProperty('--theme-primary', 'var(--primary-purple)');
        root.style.setProperty('--theme-secondary', 'var(--secondary-purple)');
        root.style.setProperty('--theme-accent', 'var(--accent-coral)');
        root.style.setProperty('--theme-accent-2', 'var(--accent-pink)');
        root.style.setProperty('--theme-background', 'var(--background-cream)');
        root.style.setProperty('--theme-text', 'var(--secondary-purple)');
        break;
        
      case 'minimal':
        root.style.setProperty('--theme-primary', 'var(--primary-black)');
        root.style.setProperty('--theme-secondary', 'var(--secondary-gray-min)');
        root.style.setProperty('--theme-accent', 'var(--accent-blue-min)');
        root.style.setProperty('--theme-accent-2', 'var(--border-gray)');
        root.style.setProperty('--theme-background', 'var(--background-white-min)');
        root.style.setProperty('--theme-text', 'var(--secondary-gray-min)');
        break;
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('spacewolf-theme', theme);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        title="Changer le thème"
      >
        <div className="flex gap-1">
          <div 
            className="w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: currentThemeData?.colors.primary }}
          />
          <div 
            className="w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: currentThemeData?.colors.accent }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {currentThemeData?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Choisir un thème</h3>
            <p className="text-xs text-gray-600 mt-1">Personnalisez l'apparence de SpaceWolf</p>
          </div>
          
          <div className="p-2 space-y-1">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentTheme === theme.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-800">{theme.name}</div>
                  <div className="text-xs text-gray-600">{theme.description}</div>
                </div>
                {currentTheme === theme.id && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
