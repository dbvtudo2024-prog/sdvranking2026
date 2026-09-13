
import React, { useState, useEffect } from 'react';
import { UserRole, AuthUser, UnitName, Member, ClubUnit, DEFAULT_UNITS, sortUnitsWithLeadershipLast, isLeadershipUnit } from '@/types';
import { DatabaseService } from '@/db';
import { getClassByAge, LEADERSHIP_CLASSES, LEADERSHIP_ROLES, PATHFINDER_ROLES } from '@/constants';
import { ChevronDown, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: AuthUser, member?: Member) => void;
  onBack: () => void;
  counselorList?: string[];
  unitsList?: ClubUnit[];
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBack, counselorList = [], unitsList = DEFAULT_UNITS }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: UserRole.PATHFINDER,
    funcao: '',
    unit: '' as any,
    age: '',
    birthday: '',
    className: '',
    email: '',
    password: '',
    counselor: ''
  });

  const isLeadership = formData.role === UserRole.LEADERSHIP;

  const shouldShowUnit = 
    formData.role === UserRole.PATHFINDER || 
    (isLeadership && (formData.funcao === 'Conselheiro (a)' || formData.funcao === 'Conselheiro (a) Associado (a)'));

  const handleBirthdayChange = (birthStr: string) => {
    let calculatedAge = formData.age;
    if (birthStr) {
      const parts = birthStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const birthDate = new Date(year, month, day);
        if (!isNaN(birthDate.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age >= 0 && age <= 120) {
            calculatedAge = age.toString();
          }
        }
      }
    }
    setFormData(prev => ({
      ...prev,
      birthday: birthStr,
      age: calculatedAge
    }));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      funcao: '',
      unit: newRole === UserRole.LEADERSHIP ? UnitName.LIDERANCA : '',
      age: '',
      className: '',
      counselor: ''
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
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.role || !formData.funcao || !formData.age || !formData.email.trim() || !formData.password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      // Verificar se o e-mail já existe
      const existingUser = await DatabaseService.getUserByEmail(formData.email.trim());
      
      if (existingUser) {
        setErrorMsg('Este e-mail já está cadastrado. Tente fazer login.');
        setIsLoading(false);
        return;
      }

      const userId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const finalUnit = isLeadership && !shouldShowUnit ? UnitName.LIDERANCA : (formData.unit as UnitName);

      const newUser: AuthUser = {
        id: userId,
        name: formData.name.trim(),
        role: formData.role,
        funcao: formData.funcao,
        unit: finalUnit,
        age: parseInt(formData.age),
        birthday: formData.birthday,
        className: formData.className,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        counselor: isLeadership ? formData.funcao : formData.counselor,
        badges: [],
        stats: {
          totalMessages: 0,
          totalLogins: 1,
          totalQuizzes: 0,
          totalVerses: 0,
          totalGames: 0,
          totalDevotionals: 0,
          checkInStreak: 0
        }
      };

      const newMember: Member = {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        age: newUser.age || 0,
        birthday: newUser.birthday,
        className: newUser.className,
        joinedAt: new Date().toISOString().split('T')[0],
        counselor: isLeadership ? formData.funcao : (formData.counselor || 'A definir'),
        unit: finalUnit || UnitName.LIDERANCA,
        scores: [],
        badges: [],
        stats: {
          totalMessages: 0,
          totalLogins: 1,
          totalQuizzes: 0,
          totalVerses: 0,
          totalGames: 0,
          totalDevotionals: 0,
          checkInStreak: 0
        }
      };

      await DatabaseService.addUser(newUser);
      await DatabaseService.addMember(newMember);
      
      alert('Cadastro realizado com sucesso!');
      onRegister(newUser, newMember);
    } catch (err: any) {
      setErrorMsg(`Falha Técnica: ${err.message || 'Erro ao salvar dados.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const LOGO_URL = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = "w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-[#0061f2] focus:bg-white placeholder-slate-400 shadow-sm transition-all";
  const labelClasses = "block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1";

  return (
    <div className="h-[100dvh] w-full bg-[#0061f2] flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden select-none no-scrollbar">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl lg:max-w-3xl bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative z-10 border border-white/30 max-h-[96vh] overflow-y-auto no-scrollbar">
        {/* CABEÇALHO DO REGISTRO */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 sm:mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2.5">
            <img 
              src={LOGO_URL} 
              alt="Brasão" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain" 
              referrerPolicy="no-referrer"
            />
            <div className="text-right">
              <h2 className="text-base sm:text-lg font-black text-[#0061f2] tracking-tight uppercase leading-none">
                Novo Registro
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                Sentinelas da Verdade
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 bg-red-500 text-white rounded-xl flex items-center gap-2.5 border border-red-600 shadow-sm animate-in fade-in">
            <AlertCircle className="shrink-0" size={18} />
            <div className="text-xs font-black leading-tight uppercase tracking-wide">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5">
          {/* NOME COMPLETO - SPAN 2 */}
          <div className="md:col-span-2">
            <label className={labelClasses}>Nome Completo</label>
            <input 
              type="text"
              placeholder="Digite seu nome completo"
              className={inputClasses}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* CARGO */}
          <div className="relative">
            <label className={labelClasses}>Cargo</label>
            <select 
              className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
              value={formData.role}
              onChange={e => handleRoleChange(e.target.value as UserRole)}
            >
              <option value={UserRole.PATHFINDER}>Desbravador</option>
              <option value={UserRole.LEADERSHIP}>Liderança</option>
            </select>
            <ChevronDown className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* FUNÇÃO */}
          <div className="relative">
            <label className={labelClasses}>Função</label>
            <select 
              className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
              value={formData.funcao}
              onChange={e => setFormData({...formData, funcao: e.target.value})}
            >
              <option value="" disabled>Selecionar</option>
              {formData.role === UserRole.LEADERSHIP 
                ? LEADERSHIP_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>)
                : PATHFINDER_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>)
              }
            </select>
            <ChevronDown className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* CONSELHEIRO (SE DESBRAVADOR) */}
          {!isLeadership && (
            <div className="relative">
              <label className={labelClasses}>Conselheiro(a)</label>
              <select 
                required
                className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
                value={formData.counselor}
                onChange={e => setFormData({...formData, counselor: e.target.value})}
              >
                <option value="" disabled>Selecione o conselheiro</option>
                {counselorList.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          )}

          {/* UNIDADE (SE APLICÁVEL) */}
          {shouldShowUnit ? (
            <div className="relative">
              <label className={labelClasses}>Unidade</label>
              <select 
                className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                <option value="" disabled>Selecione a unidade</option>
                {sortUnitsWithLeadershipLast(unitsList)
                  .filter(u => isLeadership || !isLeadershipUnit(u.name))
                  .map(u => (
                    <option key={u.id || u.name} value={u.name}>{u.name}</option>
                  ))
                }
              </select>
              <ChevronDown className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          ) : (
            isLeadership && (
              <div className="relative">
                <label className={labelClasses}>Classe de Liderança</label>
                <select 
                  className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
                  value={formData.className}
                  onChange={e => setFormData({...formData, className: e.target.value})}
                >
                  <option value="">Selecionar Classe</option>
                  {LEADERSHIP_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <ChevronDown className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none" size={16} />
              </div>
            )
          )}

          {/* NASCIMENTO & IDADE (INVERTIDOS) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClasses}>Nascimento</label>
              <input 
                type="date"
                className={inputClasses}
                value={formData.birthday}
                onChange={e => handleBirthdayChange(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClasses}>Idade</label>
              <input 
                type="number"
                placeholder="Ex: 14"
                className={inputClasses}
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
          </div>

          {/* CLASSE SE DESBRAVADOR (OU SE JÁ TIVER UNIDADE NA LIDERANÇA) */}
          {!isLeadership ? (
            <div>
              <label className={labelClasses}>Classe Sugerida</label>
              <input 
                readOnly 
                className={`${inputClasses} bg-slate-100 text-slate-500 cursor-not-allowed`} 
                value={formData.className || 'Recruta'} 
              />
            </div>
          ) : (
            shouldShowUnit && (
              <div className="relative">
                <label className={labelClasses}>Classe de Liderança</label>
                <select 
                  className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
                  value={formData.className}
                  onChange={e => setFormData({...formData, className: e.target.value})}
                >
                  <option value="">Selecionar Classe</option>
                  {LEADERSHIP_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <ChevronDown className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none" size={16} />
              </div>
            )
          )}

          {/* E-MAIL */}
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

          {/* SENHA */}
          <div className="relative">
            <label className={labelClasses}>Senha</label>
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              className={`${inputClasses} pr-10`}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
            >
              {showPassword ? <span className="text-[10px] font-black uppercase">Ocultar</span> : <span className="text-[10px] font-black uppercase">Ver</span>}
            </button>
          </div>

          {/* BOTÃO SUBMIT - SPAN 2 */}
          <div className="md:col-span-2 pt-1">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FFD700] text-[#0061f2] font-black py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all shadow-md uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Cadastrar no Clube'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
