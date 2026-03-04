
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
}

const GeminiBibleAssistant: React.FC<GeminiBibleAssistantProps> = ({ isOpen, onClose, contextVerse }) => {
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
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
      className="fixed inset-0 z-[10000] bg-white flex flex-col"
    >
      <header className="bg-[#0061f2] text-white p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Sparkles size={20} className="text-amber-300" />
          </div>
          <div>
            <h2 className="font-black uppercase tracking-tight text-sm">Assistente Bíblico</h2>
            <p className="text-[10px] font-bold uppercase opacity-70">IA Sentinela</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-xl active:scale-90 transition-all">
          <X size={20} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white text-amber-500 shadow-sm'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#0061f2] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-amber-500 shadow-sm flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-white rounded-[1.5rem] rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pensando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo sobre a Bíblia..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-6 pr-14 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#0061f2] text-white rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-90 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GeminiBibleAssistant;
