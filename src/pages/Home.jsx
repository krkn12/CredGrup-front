import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Bem-vindo à CredGrup Fintech</h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-2xl">
        Pague suas contas, solicite empréstimos, invista seu dinheiro e ganhe recompensas em Bitcoin com facilidade e segurança.
      </p>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          Login
        </Link>
        <Link to="/register" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}

export default Home;