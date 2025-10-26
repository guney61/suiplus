import React from 'react';
import { ConnectButton } from './components/ConnectButton';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <ConnectButton />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;