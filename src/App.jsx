import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Map, Camera } from 'lucide-react';
import SearchPage from './components/SearchPage';
import ARPage from './components/ARPage';
import './index.css';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, position: 'relative' }}>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/ar" element={<ARPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
