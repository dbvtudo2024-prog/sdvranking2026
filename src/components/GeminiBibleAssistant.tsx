
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, X, Loader2, Bot, User } from 'lucide-react';

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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model: model,
        contents: userMsg,
        config: {
          systemInstruction: "Você é um assistente bíblico para o Clube de Desbravadores 'Sentinelas da Verdade'. Sua missão é ajudar jovens a entender a Bíblia de forma simples, profunda e encorajadora. Use uma linguagem amigável e adequada para adolescentes. Sempre cite referências bíblicas quando possível.",
        },
      });
      
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
    <div className={`fixed inset-0 z-[1000] flex flex-col ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} md:inset-auto md:right-4 md:bottom-4 md:w-96 md:h-[500px] md:rounded-2xl md:shadow-2xl md:border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
      <header className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-100 bg-slate-50'} md:rounded-t-2xl`}>
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-500" />
          <h2 className="font-bold text-sm">Assistente Bíblico</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800')}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-xl bg-slate-100 text-slate-500 flex items-center gap-2`}>
              <Loader2 className="animate-spin" size={16} />
              <span className="text-xs">Pensando...</span>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre a Bíblia..."
            className={`flex-1 border rounded-xl py-2 px-4 text-sm outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GeminiBibleAssistant;
