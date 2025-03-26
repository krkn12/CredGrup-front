import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [pendingActions, setPendingActions] = useState({ deposits: [], payments: [], loans: [], investments: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const [depRes, payRes, loanRes, invRes] = await Promise.all([
          axios.get('https://credgrup.click/api/deposits', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('https://credgrup.click/api/payments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('https://credgrup.click/api/loans', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('https://credgrup.click/api/investments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        ]);
        setPendingActions({
          deposits: depRes.data.filter(d => d.status === 'pending'),
          payments: payRes.data.filter(p => p.status === 'pending'),
          loans: loanRes.data.filter(l => l.status === 'pending'),
          investments: invRes.data.filter(i => i.status === 'pending'),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar ações pendentes');
      }
    };
    fetchPending();
  }, []);

  const handleAction = async (type, id, action) => {
    try {
      await axios.put(
        `https://credgrup.click/api/${type}/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPendingActions(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item._id !== id),
      }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || `Erro ao ${action} ${type}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Dashboard Admin</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-6">
        <Section title="Depósitos Pendentes" items={pendingActions.deposits} type="deposits" handleAction={handleAction} />
        <Section title="Pagamentos Pendentes" items={pendingActions.payments} type="payments" handleAction={handleAction} />
        <Section title="Empréstimos Pendentes" items={pendingActions.loans} type="loans" handleAction={handleAction} />
        <Section title="Investimentos Pendentes" items={pendingActions.investments} type="investments" handleAction={handleAction} />
      </div>
    </div>
  );
}

function Section({ title, items, type, handleAction }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl mb-2">{title}</h2>
      {items.length > 0 ? (
        <ul>
          {items.map(item => (
            <li key={item._id} className="flex justify-between items-center py-2">
              <span>Valor: {item.amount} - {item.description || ''} - Data: {new Date(item.createdAt).toLocaleString()}</span>
              <div>
                <button onClick={() => handleAction(type, item._id, 'approve')} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Aprovar</button>
                <button onClick={() => handleAction(type, item._id, 'reject')} className="bg-red-500 text-white px-2 py-1 rounded">Rejeitar</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum item pendente</p>
      )}
    </div>
  );
}

export default AdminDashboard;