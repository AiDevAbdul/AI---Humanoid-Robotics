import React from 'react';
import { ApiProvider } from './contexts/ApiContext';

// ClientRoot is used to wrap the entire Docusaurus application
const ClientRoot = ({ children }) => {
  return (
    <ApiProvider>
      {children}
    </ApiProvider>
  );
};

export default ClientRoot;