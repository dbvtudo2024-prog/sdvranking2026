
import React, { useState, useRef } from 'react';
import { UnitName, Member, UserRole, ClubUnit, DEFAULT_UNITS, sortUnitsWithLeadershipLast } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { Users, Shield, Plus, Trash2, X, AlertTriangle, Upload, Link as LinkIcon, Check, Image as ImageIcon, Sparkles, Pencil } from 'lucide-react';
import { calculateWeeklyTotal, calculateGamesTotal } from '@/helpers/scoreHelpers';

interface UnitsProps {
  members: Member[];
  onSelectUnit: (unit: string) => void;
  onGoToBirthdays?: () => void;
  isDarkMode?: boolean;
  role?: UserRole;
  userEmail?: string;
  unitsList?: ClubUnit[];
  onAddUnit?: (newUnit: ClubUnit) => Promise<void> | void;
  onUpdateUnit?: (oldUnit: ClubUnit, updatedUnit: ClubUnit) => Promise<void> | void;
  onDeleteUnit?: (unitId: string, unitName: string) => Promise<void> | void;
}

const PRESET_COLORS = [
  { name: 'Dourado', color: '#FFD700' },
  { name: 'Azul Real', color: '#0061f2' },
  { name: 'Verde Floresta', color: '#16a34a' },
  { name: 'Vermelho', color: '#dc2626' },
  { name: 'Roxo', color: '#7c3aed' },
  { name: 'Laranja', color: '#ea580c' },
  { name: 'Ciano', color: '#0891b2' },
  { name: 'Rosa', color: '#db2777' },
  { name: 'Índigo', color: '#4f46e5' },
  { name: 'Grafite', color: '#1e293b' }
];

const Units: React.FC<UnitsProps> = ({ 
  members, 
  onSelectUnit, 
  onGoToBirthdays, 
  isDarkMode,
  role,
  userEmail,
  unitsList = DEFAULT_UNITS,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit
}) => {
  const safeMembers = Array.isArray(members) ? members : [];
  const isAdmin = role === UserRole.LEADERSHIP || userEmail?.toLowerCase() === 'ronaldosonic@gmail.com';

  // Estados dos modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ClubUnit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<ClubUnit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formulário de unidade (adicionar/editar)
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#0061f2');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lista consolidada de unidades garantindo que a Liderança sempre fique por último
  const activeUnits: ClubUnit[] = sortUnitsWithLeadershipLast((unitsList && unitsList.length > 0) ? unitsList : DEFAULT_UNITS);

  const getUnitStats = (unitName: string) => {
    const normalizedTarget = unitName.trim().toLowerCase();
    const unitMembers = safeMembers.filter(m => (m.unit || '').trim().toLowerCase() === normalizedTarget);
    const weeklyPoints = unitMembers.reduce((acc, member) => acc + calculateWeeklyTotal(member), 0);
    const gamePoints = unitMembers.reduce((acc, member) => acc + calculateGamesTotal(member), 0);
    return { count: unitMembers.length, weeklyPoints, gamePoints };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage('A imagem deve ter no máximo 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormLogoUrl(event.target?.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUnit(null);
    setFormName('');
    setFormColor('#0061f2');
    setFormLogoUrl('');
    setLogoInputType('upload');
    setErrorMessage('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (unit: ClubUnit) => {
    setEditingUnit(unit);
    setFormName(unit.name);
    setFormColor(unit.color || '#0061f2');
    setFormLogoUrl(unit.logoUrl || (UNIT_LOGOS as any)[unit.name] || '');
    setLogoInputType('upload');
    setErrorMessage('');
    setShowAddModal(true);
  };

  const handleSubmitUnitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      setErrorMessage('Por favor, informe o nome da unidade.');
      return;
    }

    if (editingUnit) {
      // Verificação ao editar: não pode conflitar com outro nome já existente
      const hasConflict = activeUnits.some(u => 
        (u.id !== editingUnit.id && u.name.trim().toLowerCase() !== editingUnit.name.trim().toLowerCase()) &&
        u.name.trim().toLowerCase() === cleanName.toLowerCase()
      );
      if (hasConflict) {
        setErrorMessage('Já existe outra unidade com este nome.');
        return;
      }
    } else {
      // Verificação ao criar
      if (activeUnits.some(u => u.name.trim().toLowerCase() === cleanName.toLowerCase())) {
        setErrorMessage('Já existe uma unidade com este nome.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingUnit) {
        const updatedUnit: ClubUnit = {
          ...editingUnit,
          name: cleanName,
          color: formColor,
          logoUrl: formLogoUrl.trim() || undefined
        };

        if (onUpdateUnit) {
          await onUpdateUnit(editingUnit, updatedUnit);
        }
      } else {
        const newUnit: ClubUnit = {
          id: `unit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: cleanName,
          color: formColor,
          logoUrl: formLogoUrl.trim() || undefined,
          isCustom: true,
          created_at: new Date().toISOString()
        };

        if (onAddUnit) {
          await onAddUnit(newUnit);
        }
      }

      setShowAddModal(false);
      setEditingUnit(null);
    } catch (err: any) {
      console.error('[Units] Erro ao salvar unidade:', err);
      setErrorMessage(err.message || 'Erro ao processar unidade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;
    setIsDeleting(true);
    try {
      if (onDeleteUnit) {
        await onDeleteUnit(unitToDelete.id, unitToDelete.name);
      }
      setUnitToDelete(null);
    } catch (err) {
      console.error('[Units] Erro ao excluir unidade:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto pb-24 pt-4 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      <div className="px-6 flex flex-col gap-4 mb-6">
        
        {/* Cabeçalho de Ações do Administrador */}
        {isAdmin && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-3xl border bg-gradient-to-r shadow-lg transition-all duration-300 ${isDarkMode ? 'from-blue-950/40 to-slate-900 border-blue-800/40' : 'from-blue-50 to-white border-blue-100'}">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-600 text-white'} shadow-md`}>
                <Shield size={20} />
              </div>
              <div>
                <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Gestão de Unidades</h3>
                <p className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Adicione, edite ou remova unidades do clube</p>
              </div>
            </div>

            <button
              id="btn-add-unit"
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Nova Unidade</span>
            </button>
          </div>
        )}

        {/* Lista de Unidades */}
        <div className="flex flex-col gap-4">
          {activeUnits.map((unit) => {
            const stats = getUnitStats(unit.name);
            const unitLogo = unit.logoUrl || (UNIT_LOGOS as any)[unit.name];
            const unitColor = unit.color || '#0061f2';

            return (
              <div 
                key={unit.id || unit.name}
                className="relative group"
              >
                <button 
                  onClick={() => onSelectUnit(unit.name)}
                  className={`relative flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-[2.25rem] border-2 transition-all active:scale-[0.98] w-full text-left shadow-xl ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700/80 hover:border-blue-700 shadow-blue-950/20' 
                      : 'bg-white border-slate-100 hover:border-blue-200 shadow-blue-900/5'
                  }`}
                >
                  {/* Logo / Brasão */}
                  <div 
                    className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center p-2 rounded-2xl border-2 transition-transform duration-500 group-hover:scale-105 overflow-hidden shadow-inner ${
                      isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    {unitLogo ? (
                      <img 
                        src={unitLogo} 
                        alt={`Logo ${unit.name}`} 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex flex-col items-center justify-center rounded-xl text-white font-black text-xs"
                        style={{ backgroundColor: unitColor }}
                      >
                        <Shield size={22} className="mb-0.5" />
                        <span className="text-[9px] uppercase leading-none font-black truncate max-w-full px-1">
                          {unit.name.substring(0, 3)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Dados da Unidade */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className={`font-black text-base sm:text-lg uppercase tracking-tight leading-snug mb-1.5 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {unit.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-slate-700/70 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        <Users size={11} />
                        <span className="text-[9px] font-black uppercase tracking-wider">{stats.count} Integrantes</span>
                      </div>
                    </div>
                  </div>

                  {/* Pontos Semanais */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className={`flex flex-col items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 ${
                      isDarkMode ? 'bg-blue-900/20 border-blue-800/40' : 'bg-blue-50/70 border-blue-100'
                    }`}>
                      <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Pontos
                      </span>
                      <span className={`text-lg sm:text-xl font-black leading-none ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        {stats.weeklyPoints}
                      </span>
                    </div>
                  </div>

                  {/* Faixa lateral colorida */}
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-1.5 rounded-l-full" 
                    style={{ backgroundColor: unitColor }}
                  />
                </button>

                {/* Botões de Ação para Administrador (Editar e Excluir) */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                    <button
                      id={`btn-edit-unit-${unit.id || unit.name}`}
                      title={`Editar unidade ${unit.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(unit);
                      }}
                      className={`p-2 rounded-full border transition-all opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 ${
                        isDarkMode 
                          ? 'bg-slate-900/90 hover:bg-blue-950/80 text-slate-400 hover:text-blue-400 border-slate-700 hover:border-blue-700' 
                          : 'bg-white/90 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border-slate-200 hover:border-blue-200 shadow-sm'
                      }`}
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      id={`btn-delete-unit-${unit.id || unit.name}`}
                      title={`Excluir unidade ${unit.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnitToDelete(unit);
                      }}
                      className={`p-2 rounded-full border transition-all opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 ${
                        isDarkMode 
                          ? 'bg-slate-900/90 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border-slate-700 hover:border-red-800' 
                          : 'bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 border-slate-200 hover:border-red-200 shadow-sm'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR / EDITAR UNIDADE */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-md rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}
          >
            {/* Cabeçalho do Modal */}
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${isDarkMode ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40' : 'bg-blue-100 text-blue-600'}`}>
                  {editingUnit ? <Pencil size={22} /> : <Shield size={22} />}
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-tight">
                    {editingUnit ? 'Editar Unidade' : 'Adicionar Unidade'}
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {editingUnit ? `Modifique os dados da unidade ${editingUnit.name}` : 'Cadastre uma nova unidade para o clube'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUnit(null);
                }}
                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo do Formulário */}
            <form onSubmit={handleSubmitUnitForm} className="flex flex-col flex-1 overflow-y-auto p-6 gap-5">
              {errorMessage && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Nome da Unidade */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nome da Unidade *
                </label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Ex: Sentinelas, Órion, Guardiões..."
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>

              {/* Seletor de Cor */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Cor da Unidade
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-6 h-6 rounded-md border-0 cursor-pointer overflow-hidden bg-transparent"
                      title="Escolher cor personalizada"
                    />
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{formColor}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(item => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setFormColor(item.color)}
                      title={item.name}
                      style={{ backgroundColor: item.color }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm ${
                        formColor.toLowerCase() === item.color.toLowerCase() ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      {formColor.toLowerCase() === item.color.toLowerCase() && (
                        <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo / Brasão */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Brasão / Logo
                  </label>
                  <div className={`flex p-0.5 rounded-xl border text-[10px] font-black uppercase ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <button
                      type="button"
                      onClick={() => setLogoInputType('upload')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${logoInputType === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInputType('url')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${logoInputType === 'url' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      Link URL
                    </button>
                  </div>
                </div>

                {logoInputType === 'upload' ? (
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-3 px-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                        isDarkMode 
                          ? 'border-slate-700 hover:border-blue-500 bg-slate-800/40 text-slate-300' 
                          : 'border-slate-200 hover:border-blue-500 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Upload size={16} />
                        <span>{formLogoUrl ? 'Trocar Imagem do Brasão' : 'Selecionar Imagem do Brasão'}</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">Até 3MB (PNG, JPG, SVG, WebP)</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="url" 
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                      className={`w-full pl-9 pr-4 py-3 rounded-2xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}

                {/* Prévia do Brasão */}
                {formLogoUrl && (
                  <div className={`flex items-center gap-3 p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="w-12 h-12 rounded-xl border p-1 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={formLogoUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Prévia do Brasão</p>
                      <p className="text-[10px] text-slate-400">Imagem pronta para exibição</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormLogoUrl('')}
                      className="p-1.5 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Remover imagem"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Prévia do Card */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className={`text-[10px] font-black uppercase tracking-wider text-slate-400`}>
                  Prévia do Card
                </label>
                <div 
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <div 
                    className="w-12 h-12 shrink-0 rounded-xl border p-1 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: formLogoUrl ? '#fff' : formColor }}
                  >
                    {formLogoUrl ? (
                      <img src={formLogoUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <Shield size={20} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-sm uppercase truncate">{formName || 'Nome da Unidade'}</h5>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {editingUnit ? `${getUnitStats(editingUnit.name).count} Integrantes` : '0 Integrantes'}
                    </span>
                  </div>
                  <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: formColor }} />
                </div>
              </div>

              {/* Ações do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUnit(null);
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : (editingUnit ? 'Salvar Alterações' : 'Salvar Unidade')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE UNIDADE */}
      {/* ========================================================================= */}
      {unitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-sm rounded-[2.5rem] border shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-base uppercase tracking-tight">Excluir Unidade</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Confirmação de segurança</p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Tem certeza que deseja excluir a unidade <strong className="text-red-500 uppercase">{unitToDelete.name}</strong>?
            </p>

            {(() => {
              const count = getUnitStats(unitToDelete.name).count;
              if (count > 0) {
                return (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Atenção!</p>
                      <p className="text-[11px] leading-snug">Esta unidade possui <strong>{count}</strong> integrante(s) cadastrado(s).</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUnitToDelete(null)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-red-500/25 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
