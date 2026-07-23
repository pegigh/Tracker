import React from 'react';
import ReactDOM from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import App from './App';
import { ThemeProvider, useTheme } from './ThemeContext';
import './index.css';

function ThemedApp() {
  const { appearance } = useTheme();
  return (
    <Theme
      appearance={appearance}
      accentColor="violet"
      grayColor="mauve"
      radius="large"
      scaling="100%"
    >
      <App />
    </Theme>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>
);
