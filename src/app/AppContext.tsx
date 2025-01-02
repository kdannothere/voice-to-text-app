import React, { createContext, useState } from 'react';

export const AppContext = createContext({
  credits: 0,
  setCredits: (credits: number) => {}
});

export const AppContextProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);

  return (
    <AppContext.Provider value={{ credits, setCredits }}>
      {children}
    </AppContext.Provider>
  );
};