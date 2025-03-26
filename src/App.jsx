import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Deposits from './pages/Deposits';
import Payments from './pages/Payments';
import Transactions from './pages/Transactions';
import Loans from './pages/Loans';
import Investments from './pages/Investments';
import AdminDashboard from './pages/AdminDashboard';
import AdminConfig from './pages/AdminConfig';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/deposits" element={<PrivateRoute><Deposits /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
          <Route path="/loans" element={<PrivateRoute><Loans /></PrivateRoute>} />
          <Route path="/investments" element={<PrivateRoute><Investments /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requiresAdmin><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/config" element={<PrivateRoute requiresAdmin><AdminConfig /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;