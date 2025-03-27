import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/UI/ProtectedRoute';
import Navbar from '@/components/UI/Navbar';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

// Páginas (Lazy Loading)
const Home = React.lazy(() => import('@/pages/Home'));
const Login = React.lazy(() => import('@/pages/Auth/Login'));
const Register = React.lazy(() => import('@/pages/Auth/Register'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const AdminPanel = React.lazy(() => import('@/pages/Admin/AdminPanel'));
const UserProfile = React.lazy(() => import('@/pages/UserProfile'));

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Rota principal sempre redireciona para Home */}
            <Route path="/" element={<Home />} />
            
            {/* Rotas públicas */}
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            
            {/* Rotas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            {/* Redirecionamento para Home se rota não existir */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </React.Suspense>
      </div>
    </Router>
  );
}

export default App;