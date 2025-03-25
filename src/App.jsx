import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          console.log("Usuário carregado do localStorage:", parsedUser);
        } catch (e) {
          console.error("Erro ao parsear currentUser:", e);
          localStorage.clear();
          sessionStorage.clear();
        }
      } else {
        console.log("Nenhum usuário ou token encontrado");
      }
      setIsLoading(false);
    };
    initializeUser();
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('token', userData.token); // Certifique-se de que o token vem do login
    console.log("Login realizado:", userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.clear();
    sessionStorage.clear();
    console.log("Logout realizado");
  };

  if (isLoading) {
    return <div>Carregando...</div>;
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