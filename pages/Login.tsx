
import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { DatabaseService } from '../db';
import { Lock, Mail, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const users = await DatabaseService.getUsers();
      
      const user = users.find((u: AuthUser) => 
        u.email?.toLowerCase() === cleanEmail && u.password === cleanPass
      );

      if (user) {
        onLogin(user);
      } else {
        alert('E-mail ou senha incorretos.');
      }
    } catch (err) {
      alert('Erro ao processar login no Supabase.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const brasaoUrl = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  return (
    <div className="min-h-screen bg-[#0061f2] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 mx-auto drop-shadow-xl flex items-center justify-center">
              <img src={brasaoUrl} alt="Brasão" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-xl font-black text-[#0061f2] tracking-tight uppercase">Sentinelas da Verdade</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Sincronizado via Supabase</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0061f2] transition-colors" size={18} />
              <input 
                type="email"
                className="w-full pl-11 p-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#0061f2] outline-none font-bold text-gray-700 text-sm"
                placeholder="admin@clube.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0061f2] transition-colors" size={18} />
              <input 
                type="password"
                className="w-full pl-11 p-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#0061f2] outline-none font-bold text-gray-700 text-sm"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#0061f2] text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#0052cc] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Clube'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <button onClick={onGoToRegister} className="text-[#0061f2] font-black text-[10px] uppercase tracking-widest hover:text-[#FFD700] transition-colors">Criar Novo Registro</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
