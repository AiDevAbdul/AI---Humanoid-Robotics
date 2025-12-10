import React from 'react';
import { ApiProvider } from '../contexts/ApiContext';

// This wrapper ensures the API context is available throughout the app
const LayoutWrapper = ({ children }) => {
  return (
    <ApiProvider>
      {children}
    </ApiProvider>
  );
};

export default LayoutWrapper;