// src/components/UI/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;