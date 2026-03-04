
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface GeminiBibleAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  contextVerse?: string;
  isDarkMode?: boolean;
}

const GeminiBibleAssistant: React.FC<GeminiBibleAssistantProps> = ({ isOpen, onClose, contextVerse, isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextVerse && messages.length === 0) {
      setMessages([
        { role: 'model', text: `Olá! Vi que você está lendo: "${contextVerse}". Como posso te ajudar a entender melhor este versículo?` }
      ]);
    } else if (messages.length === 0) {
      setMessages([
        { role: 'model', text: 'Olá! Sou seu assistente bíblico Sentinela. Como posso te ajudar hoje?' }
      ]);
    }
  }, [contextVerse]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getApiKey = () => {
    try {
      // @ts-ignore
      return (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
             // @ts-ignore
             (typeof window !== 'undefined' && (window as any).process?.env?.GEMINI_API_KEY) ||
             import.meta.env.VITE_GEMINI_API_KEY;
    } catch (e) {
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("API Key não configurada. Verifique as variáveis de ambiente.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      const chat = ai.chats.create({
        model: model,
        config: {
          systemInstruction: "Você é um assistente bíblico para o Clube de Desbravadores 'Sentinelas da Verdade'. Sua missão é ajudar jovens a entender a Bíblia de forma simples, profunda e encorajadora. Use uma linguagem amigável e adequada para adolescentes. Sempre cite referências bíblicas quando possível.",
        },
      });

      const response = await chat.sendMessage({ message: userMsg });
      const text = response.text || "Desculpe, não consegui processar sua pergunta.";
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Erro no Gemini:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Opa, tive um probleminha técnico. Pode tentar de novo?" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={`fixed inset-0 z-[10000] flex flex-col ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900'}`}
    >
      <header className="bg-[#0061f2] text-white p-6 pt-safe flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Sparkles size={20} className="text-amber-300" />
          </div>
          <div>
            <h2 className="font-black uppercase tracking-tight text-sm">Assistente Bíblico</h2>
            <p className="text-[10px] font-bold uppercase opacity-70">IA Sentinela</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 rounded-xl active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X size={20} />
        </button>
      </header>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') : (isDarkMode ? 'bg-slate-800 text-amber-500 shadow-sm' : 'bg-white text-amber-500 shadow-sm')}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#0061f2] text-white rounded-tr-none' : (isDarkMode ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100')}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] flex gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-amber-500 shadow-sm' : 'bg-white text-amber-500 shadow-sm'}`}>
                <Bot size={16} />
              </div>
              <div className={`p-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <Loader2 size={16} className={`animate-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Pensando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-6 border-t shrink-0 pb-safe ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo sobre a Bíblia..."
            className={`w-full border rounded-2xl py-4 pl-6 pr-14 text-sm font-bold outline-none focus:border-blue-300 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3.5 bg-[#0061f2] text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default GeminiBibleAssistant;
