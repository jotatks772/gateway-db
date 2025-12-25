import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CheckoutPage from './components/CheckoutPage';

function App() {
  return (
    <HashRouter>
      {/* O componente de Navegação foi removido pois não é mais necessário */}
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
