import React from 'react';
import { AppContextProvider } from './context';
import { ChatApp } from './components';
import './index.css';

/**
 * Main application component that combines all providers and components
 */
const App: React.FC = () => {
  return (
    <AppContextProvider>
      <ChatApp />
    </AppContextProvider>
  );
};

export default App;
