import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CheckoutPage from './components/CheckoutPage';
// Importe a nova página de admin do seu diretório isolado
import AdminPage from './admin/AdminPage';

function App() {
  return (
    <HashRouter>
      {/* Nenhum link de navegação visível para o admin */}
      <Routes>
        {/* A rota principal continua sendo a página de checkout */}
        <Route path="/" element={<CheckoutPage />} />
        
        {/* A rota /admin agora renderiza o componente AdminPage */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
