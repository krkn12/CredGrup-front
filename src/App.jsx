import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminConfig from './pages/AdminConfig';
import UserManagement from './pages/UserManagement';
import Deposits from './pages/Deposits';
import Payments from './pages/Payments';
import Transactions from './pages/Transactions';
import Loans from './pages/Loans';
import Investments from './pages/Investments';
import Uploads from './pages/Uploads';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/deposits" 
            element={
              <PrivateRoute>
                <Deposits />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <PrivateRoute>
                <Payments />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/loans" 
            element={
              <PrivateRoute>
                <Loans />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/investments" 
            element={
              <PrivateRoute>
                <Investments />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/uploads" 
            element={
              <PrivateRoute>
                <Uploads />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/config" 
            element={
              <PrivateRoute requiresAdmin>
                <AdminConfig />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;