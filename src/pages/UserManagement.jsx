import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(res.data);
      } catch (err) {
        setError('Erro ao carregar usuários');
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Gerenciamento de Usuários</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Lista de Usuários</h2>
        {users.length > 0 ? (
          <ul>
            {users.map((u) => (
              <li key={u.id} className="py-2">
                {u.name} ({u.email}) - {u.isAdmin ? 'Admin' : 'Usuário'}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum usuário encontrado</p>
        )}
      </div>
    </div>
  );
}

export default UserManagement;