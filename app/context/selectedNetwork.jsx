// context/SelectedNetwork.js
'use client';

import React, { createContext, useContext, useState } from 'react';

const SelectedNetworkContext = createContext();

export const SelectedNetworkProvider = ({ children }) => {
  const [isEthereum, setIsEthereum] = useState(true);

  return (
    <SelectedNetworkContext.Provider value={{ isEthereum, setIsEthereum }}>
      {children}
    </SelectedNetworkContext.Provider>
  );
};

export const useSelectedNetwork = () => {
  const context = useContext(SelectedNetworkContext);
  if (!context) {
    throw new Error('useSelectedNetwork must be used within an SelectedNetworkProfider');
  }
  return context;
};
