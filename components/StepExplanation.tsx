"use client";

import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

interface StepExplanationProps {
  stepNumber: number;
  isCompleted?: boolean;
}

export default function StepExplanation({ stepNumber, isCompleted = false }: StepExplanationProps) {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  const getStepData = () => {
    switch (stepNumber) {
      case 1:
        return {
          title: t.step1Title,
          description: t.step1Description,
          detailedDescription: t.step1DetailedDescription,
          tips: t.step1Tips,
        };
      case 2:
        return {
          title: t.step2Title,
          description: t.step2Description,
          detailedDescription: t.step2DetailedDescription,
          tips: t.step2Tips,
        };
      case 3:
        return {
          title: t.step3Title,
          description: t.step3Description,
          detailedDescription: t.step3DetailedDescription,
          tips: t.step3Tips,
        };
      case 4:
        return {
          title: t.step4Title,
          description: t.step4Description,
          detailedDescription: t.step4DetailedDescription,
          tips: t.step4Tips,
        };
      case 5:
        return {
          title: t.step5Title,
          description: t.step5Description,
          detailedDescription: t.step5DetailedDescription,
          tips: t.step5Tips,
        };
      case 6:
        return {
          title: t.step6Title,
          description: t.step6Description,
          detailedDescription: t.step6DetailedDescription,
          tips: t.step6Tips,
        };
      default:
        return null;
    }
  };

  const stepData = getStepData();
  if (!stepData) return null;

  return (
    <div className="bg-gradient-to-br from-[#d8d0f3] to-[#fcd6c5] rounded-xl p-4 mb-4 border border-[#eeddde]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : 'bg-[#59507b] text-white'
          }`}>
            {isCompleted ? '✓' : stepNumber}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#59507b]">{stepData.title}</h3>
            <p className="text-sm text-[#59507b] opacity-80">{stepData.description}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[#59507b] hover:text-[#59507b] opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          <div className="bg-white/50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-[#59507b] mb-2">📚 Explication détaillée</h4>
            <p className="text-sm text-[#59507b] leading-relaxed">
              {stepData.detailedDescription}
            </p>
          </div>
          
          <div className="bg-white/50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-[#59507b] mb-2">💡 Conseils pratiques</h4>
            <p className="text-sm text-[#59507b] leading-relaxed">
              {stepData.tips}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
