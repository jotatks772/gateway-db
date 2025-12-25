import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CheckoutPage from './components/CheckoutPage';
// Adicione a extensão .tsx ao final do caminho do arquivo
import AdminPage from './admin/AdminPage.tsx'; 

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
