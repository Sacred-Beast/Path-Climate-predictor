import React from 'react';
import { ThemeProvider } from './theme.jsx';
import Layout from './components/Layout';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Home />
      </Layout>
    </ThemeProvider>
  );
}

export default App;