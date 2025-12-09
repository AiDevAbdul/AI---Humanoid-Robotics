import React, { useState, useEffect } from 'react';

const MultilingualContent = ({ content, translations, defaultLanguage = 'en' }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);

  useEffect(() => {
    // In a real implementation, this would get the user's preferred language
    // from their profile or local storage
    const preferredLanguage = localStorage.getItem('preferred-language') || defaultLanguage;
    setCurrentLanguage(preferredLanguage);
  }, [defaultLanguage]);

  // Determine which content to display
  const displayContent = translations && translations[currentLanguage]
    ? translations[currentLanguage]
    : content;

  // Function to switch language
  const switchLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('preferred-language', langCode);
  };

  // Get available languages from translations object
  const availableLanguages = [
    { code: defaultLanguage, name: 'English' },
    ...(translations ? Object.keys(translations).map(code => ({
      code,
      name: code === 'ur' ? 'اردو' :
           code === 'es' ? 'Español' :
           code === 'fr' ? 'Français' :
           code === 'de' ? 'Deutsch' :
           code.toUpperCase()
    })) : [])
  ];

  return (
    <div className="multilingual-content">
      {/* Language switcher */}
      <div className="language-controls">
        <label htmlFor="content-language-select">Content Language: </label>
        <select
          id="content-language-select"
          value={currentLanguage}
          onChange={(e) => switchLanguage(e.target.value)}
          className="language-select"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content display */}
      <div className="content-display">
        {/* In a real implementation, we would properly render the content based on its format */}
        <div dangerouslySetInnerHTML={{ __html: displayContent }} />
      </div>

      {/* Language info */}
      <div className="language-info">
        Showing content in: <strong>{availableLanguages.find(l => l.code === currentLanguage)?.name || currentLanguage}</strong>
        {currentLanguage !== defaultLanguage && (
          <span> (translated from {availableLanguages.find(l => l.code === defaultLanguage)?.name || defaultLanguage})</span>
        )}
      </div>
    </div>
  );
};

export default MultilingualContent;