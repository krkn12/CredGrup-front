import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
      console.log("Usuário carregado do localStorage:", JSON.parse(storedUser));
    } else {
      console.log("Nenhum usuário ou token encontrado no localStorage");
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log("Usuário logado:", userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    console.log("Logout realizado");
  };

  if (isLoading) {
    return <div>Carregando...</div>; // Evita renderizar antes de verificar o estado
  }

  return (
    <Dashboard 
      currentUser={currentUser} 
      onLogin={handleLogin} 
      onLogout={handleLogout} 
    />
  );
}

export default App;