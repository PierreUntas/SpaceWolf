"use client";

import React from 'react';

interface StyledStepProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
  theme?: 'spacewolf' | 'minimal';
  isCompleted?: boolean;
}

export default function StyledStep({ 
  stepNumber, 
  title, 
  children, 
  theme = 'spacewolf',
  isCompleted = false 
}: StyledStepProps) {
  
  const getThemeStyles = () => {
    if (theme === 'minimal') {
      return {
        container: {
          borderColor: 'var(--theme-primary)',
          background: 'var(--theme-background)',
          color: 'var(--theme-text)',
          border: '2px solid'
        },
        stepNumber: {
          backgroundColor: 'var(--theme-secondary)',
          color: 'var(--theme-background)'
        },
        contentBox: {
          backgroundColor: 'var(--theme-background)',
          borderColor: 'var(--theme-accent)',
          border: '1px solid',
          opacity: 1
        }
      };
    } else {
      // SpaceWolf theme (default)
      return {
        container: {
          borderColor: 'var(--theme-primary)',
          background: 'linear-gradient(to bottom right, var(--theme-primary), var(--theme-accent))',
          color: 'var(--theme-text)'
        },
        stepNumber: {
          backgroundColor: 'var(--theme-secondary)',
          color: 'white'
        },
        contentBox: {
          backgroundColor: 'var(--theme-background)',
          opacity: 0.8,
          borderColor: 'var(--theme-accent-2)'
        }
      };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="mt-4 p-4 sm:p-6 border rounded-xl text-center shadow-lg"
         style={styles.container}>
      <div className="flex items-center justify-center mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-3"
             style={styles.stepNumber}>
          {isCompleted ? '✓' : stepNumber}
        </div>
        <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
          {title}
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 rounded-xl border shadow-sm"
             style={styles.contentBox}>
          {children}
        </div>
      </div>
    </div>
  );
}
