import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Success from './pages/Success';
import Verify from './pages/Verify';
import Scan from './pages/Scan';

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/registration" replace />} />
          <Route path="registration" element={<Home />} />
          <Route path="success/:id" element={<Success />} />
          <Route path="verify/:id" element={<Verify />} />
          <Route path="scan" element={<Scan />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
