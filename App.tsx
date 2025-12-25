
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import CheckoutPage from './components/CheckoutPage';
import AdminPanel from './components/AdminPanel';

const Nav: React.FC = () => (
  <nav className="bg-gray-800 p-2 text-white fixed top-0 right-0 z-50 text-xs rounded-bl-lg">
    <Link to="/" className="hover:underline p-2">Target View</Link>
    <Link to="/admin" className="hover:underline p-2">Admin View</Link>
  </nav>
);

function App() {
  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
