import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import '@/styles/user-profile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await api.get(`/users/${user.id}`);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${user.id}`, profileData);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return <div>Carregando perfil...</div>;

  return (
    <div className="profile-container">
      <h1>Meu Perfil</h1>
      
      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            value={profileData?.name || ''}
            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={profileData?.email || ''}
            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Telefone:</label>
          <input
            type="tel"
            value={profileData?.phone || ''}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
          />
        </div>
        
        <button type="submit" className="update-btn">
          Atualizar Perfil
        </button>
      </form>
    </div>
  );
};

export default UserProfile;