
import React, { useState, useEffect } from 'react';
import { UserRole, AuthUser, UnitName, Member } from '../types';
import { DatabaseService } from '../db';
import { getClassByAge, LEADERSHIP_CLASSES, LEADERSHIP_ROLES, PATHFINDER_ROLES } from '../constants';
<<<<<<< HEAD
import { ChevronDown, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
=======
<<<<<<< HEAD
import { ChevronDown, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
=======
<<<<<<< HEAD
import { ChevronDown, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
=======
<<<<<<< HEAD
import { ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
=======
import { ChevronDown, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46

interface RegisterProps {
  onRegister: (user: AuthUser, member?: Member) => void;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
=======
<<<<<<< HEAD
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
=======
<<<<<<< HEAD
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
=======
<<<<<<< HEAD
=======
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
  const [formData, setFormData] = useState({
    name: '',
    role: UserRole.PATHFINDER,
    funcao: '',
    unit: '' as any,
    age: '',
    className: '',
    email: '',
    password: ''
  });

  const isLeadership = formData.role === UserRole.LEADERSHIP;

  const shouldShowUnit = 
    formData.role === UserRole.PATHFINDER || 
    (isLeadership && (formData.funcao === 'Conselheiro (a)' || formData.funcao === 'Conselheiro (a) Associado (a)'));

  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      funcao: '',
      unit: newRole === UserRole.LEADERSHIP ? UnitName.LIDERANCA : '',
      age: '',
      className: ''
    }));
  };

  useEffect(() => {
    if (formData.role === UserRole.PATHFINDER) {
      const ageNum = parseInt(formData.age);
      if (!isNaN(ageNum) && ageNum >= 10 && ageNum <= 16) {
        setFormData(prev => ({ ...prev, className: getClassByAge(ageNum) }));
      } else {
        setFormData(prev => ({ ...prev, className: 'Recruta' }));
      }
    }
  }, [formData.age, formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.role || !formData.funcao || !formData.age || !formData.email.trim() || !formData.password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
    if (!formData.name.trim() || !formData.role || !formData.funcao || !formData.age || !formData.email.trim() || !formData.password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
=======
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.role || !formData.funcao || !formData.age || !formData.email.trim() || !formData.password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
<<<<<<< HEAD
=======
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
      return;
    }

    setIsLoading(true);
    try {
      const userId = Math.random().toString(36).substr(2, 9);
      const finalUnit = isLeadership && !shouldShowUnit ? UnitName.LIDERANCA : (formData.unit as UnitName);

      const newUser: AuthUser = {
        id: userId,
        name: formData.name.trim(),
        role: formData.role,
        funcao: formData.funcao,
        unit: finalUnit,
        age: parseInt(formData.age),
        className: formData.className,
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const newMember: Member = {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        age: newUser.age || 0,
        className: newUser.className,
        joinedAt: new Date().toISOString().split('T')[0],
        counselor: isLeadership ? formData.funcao : 'A definir',
        unit: finalUnit || UnitName.LIDERANCA,
        scores: []
      };

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
      // Tenta salvar no banco
      console.log('Tentando cadastrar usuário...');
      await DatabaseService.addUser(newUser);
      console.log('Usuário cadastrado. Tentando cadastrar membro...');
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
      // Salva no Supabase via DatabaseService
      await DatabaseService.addUser(newUser);
=======
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
      // Tenta salvar no banco
      console.log('Tentando cadastrar usuário...');
      await DatabaseService.addUser(newUser);
      console.log('Usuário cadastrado. Tentando cadastrar membro...');
<<<<<<< HEAD
=======
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
      await DatabaseService.addMember(newMember);
      
      alert('Cadastro realizado com sucesso!');
      onRegister(newUser, newMember);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
    } catch (err) {
      alert('Erro ao realizar cadastro no banco de dados. Verifique sua conexão.');
      console.error(err);
=======
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
    } catch (err: any) {
      console.error('Erro completo capturado:', err);
      const message = err.message || '';
      
      if (message.includes('fetch') || message.includes('Network')) {
        setErrorMsg('Erro de Conexão: O site não conseguiu falar com o Supabase. Verifique sua internet.');
      } else if (message.includes('JWT') || message.includes('apikey')) {
        setErrorMsg('Erro de Chave API: A chave no arquivo db.ts parece incorreta ou expirada.');
      } else if (message.includes('relation')) {
        setErrorMsg('Erro de Tabela: O banco de dados não tem as tabelas necessárias. Execute o SQL no Supabase.');
      } else {
        setErrorMsg(`Falha Técnica: ${message || 'Erro desconhecido ao salvar dados.'}`);
      }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-white text-gray-700 border border-gray-100 rounded-xl p-3 focus:outline-none focus:border-[#0061f2] placeholder-gray-400 appearance-none shadow-sm transition-all font-bold text-sm";
  const labelClasses = "block text-white text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-[#0061f2] flex flex-col items-center p-6 pb-20 overflow-y-auto">
      <div className="w-full max-w-md">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 mb-6 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </button>

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
        <h2 className="text-2xl font-black text-white mb-8 tracking-tight uppercase">Novo Registro</h2>
=======
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
        <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Novo Registro</h2>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border-2 border-white/20">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div className="text-xs font-black leading-tight uppercase tracking-wider">{errorMsg}</div>
          </div>
        )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
>>>>>>> 3ad30faef705ff4d6a5e185e4490185073d4becc
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClasses}>Nome Completo</label>
            <input 
              type="text"
              placeholder="Seu nome"
              className={inputClasses}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className={labelClasses}>Cargo</label>
              <select 
                className={inputClasses}
                value={formData.role}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
              >
                <option value={UserRole.PATHFINDER}>Desbravador</option>
                <option value={UserRole.LEADERSHIP}>Liderança</option>
              </select>
              <ChevronDown className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <label className={labelClasses}>Função</label>
              <select 
                className={inputClasses}
                value={formData.funcao}
                onChange={e => setFormData({...formData, funcao: e.target.value})}
              >
                <option value="" disabled>Selecionar</option>
                {formData.role === UserRole.LEADERSHIP 
                  ? LEADERSHIP_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>)
                  : PATHFINDER_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>)
                }
              </select>
              <ChevronDown className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {shouldShowUnit && (
            <div className="relative">
              <label className={labelClasses}>Unidade</label>
              <select 
                className={inputClasses}
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value as UnitName})}
              >
                <option value="" disabled>Selecione a unidade</option>
                <option value={UnitName.AGUIA_DOURADA}>Águia Dourada</option>
                <option value={UnitName.GUERREIROS}>Guerreiros</option>
                {isLeadership && <option value={UnitName.LIDERANCA}>Liderança</option>}
              </select>
              <ChevronDown className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className={labelClasses}>Idade</label>
              <input 
                type="number"
                placeholder="Idade"
                className={inputClasses}
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div className="relative">
              <label className={labelClasses}>Classe</label>
              {isLeadership ? (
                <div className="relative">
                  <select 
                    className={inputClasses}
                    value={formData.className}
                    onChange={e => setFormData({...formData, className: e.target.value})}
                  >
                    <option value="">Selecionar Classe</option>
                    {LEADERSHIP_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
                </div>
              ) : (
                <input 
                  readOnly 
                  className={`${inputClasses} bg-white/80 opacity-70`} 
                  value={formData.className || 'Recruta'} 
                />
              )}
            </div>
          </div>

          <div>
            <label className={labelClasses}>E-mail</label>
            <input 
              type="email"
              placeholder="seu@email.com"
              className={inputClasses}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className={labelClasses}>Senha</label>
            <input 
              type="password"
              placeholder="••••••"
              className={inputClasses}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FFD700] text-[#0061f2] font-black py-4 rounded-xl mt-4 hover:brightness-110 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Cadastrar no Clube'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
