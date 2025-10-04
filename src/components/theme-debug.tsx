'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';

export function ThemeDebug() {
  const { theme, resolvedTheme, isLoading } = useTheme();
  const [htmlClass, setHtmlClass] = useState('');

  useEffect(() => {
    const updateHtmlClass = () => {
      const htmlElement = document.documentElement;
      setHtmlClass(htmlElement.className);
    };

    updateHtmlClass();
    
    // Watch for class changes
    const observer = new MutationObserver(updateHtmlClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
      <div>🔍 THEME DEBUG</div>
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>HTML Class: {htmlClass}</div>
    </div>
  );
}
