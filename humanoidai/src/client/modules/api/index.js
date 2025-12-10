// This file sets up the API context for the entire Docusaurus application
import React from 'react';
import { ApiProvider } from '../../contexts/ApiContext';

export const ClientModule = ({ children }) => {
  return <ApiProvider>{children}</ApiProvider>;
};