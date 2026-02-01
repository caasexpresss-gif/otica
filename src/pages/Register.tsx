
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Glasses, Lock, Mail, User, Building, Loader2 } from 'lucide-react';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');


    try {
      const result = await register(name, email, password, storeName);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Erro ao criar conta.');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 pb-4">
          <div className="flex justify-center mb-6">
             <div className="p-3 bg-purple-50 rounded-full">
               <Building className="w-10 h-10 text-purple-600" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">Criar Nova Ótica</h1>
          <p className="text-center text-gray-500 mt-2">Comece a gerenciar sua loja hoje</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Ótica</label>
             <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Ex: Ótica Visão Real"
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Seu nome completo"
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Conta Grátis'}
          </button>
        </form>

        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-purple-600 font-bold hover:underline">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
