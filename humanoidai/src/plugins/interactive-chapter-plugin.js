// Docusaurus plugin to provide interactive chapter components
import { normalizeUrl } from '@docusaurus/utils';

const Plugin = (context, options) => {
  return {
    name: 'interactive-chapter-plugin',

    getThemePath() {
      return './theme';
    },

    async contentLoaded({ actions }) {
      const { setGlobalData } = actions;

      // Set global data that can be used across the site
      setGlobalData({
        apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:8000',
        isDevelopment: process.env.NODE_ENV === 'development',
      });
    },
  };
};

export default Plugin;