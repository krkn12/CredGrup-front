import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return (
    <Dashboard 
      currentUser={currentUser} 
      onLogin={handleLogin} 
      onLogout={handleLogout} 
    />
  );
}

export default App;