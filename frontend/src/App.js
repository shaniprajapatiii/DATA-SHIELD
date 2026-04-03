import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Monitor from './pages/Monitor';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import Chatbot from './components/chatbot/Chatbot';
import ScanLine from './components/ui/ScanLine';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-shield-900 relative">
          <ScanLine />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Footer />
          <Chatbot />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0a0f1e',
                color: '#e2e8f0',
                border: '1px solid rgba(0,245,255,0.3)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
