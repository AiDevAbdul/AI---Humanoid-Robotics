import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'ur', name: 'اردو' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ]);

  const location = useLocation();

  useEffect(() => {
    // In a real implementation, this would detect the current language
    // For now, we'll just use a default
    const lang = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(lang);
  }, []);

  const handleLanguageChange = (langCode) => {
    // In a real implementation, this would:
    // 1. Update the user's preference in the backend
    // 2. Reload the content in the new language
    // 3. Update the UI language

    localStorage.setItem('preferred-language', langCode);
    setCurrentLanguage(langCode);

    // Show a message to the user
    alert(`Language switched to ${availableLanguages.find(lang => lang.code === langCode)?.name}. In a real implementation, the content would reload in the new language.`);
  };

  return (
    <div className="language-switcher">
      <label htmlFor="language-select">Language: </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="language-select"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;