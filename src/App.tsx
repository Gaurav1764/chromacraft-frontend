import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Extractor from './pages/Extractor';
import SavedPalettes from './pages/SavedPalettes';
import Toast from './components/Toast';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<Generator />} />
            <Route path="/extract" element={<Extractor />} />
            <Route path="/saved" element={<SavedPalettes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </Router>
  );
}

export default App;
