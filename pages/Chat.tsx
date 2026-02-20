
import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, ChatMessage, UnitName } from '../types';
import { DatabaseService } from '../db';
import { Send, Users, Shield, MessageSquare, Loader2 } from 'lucide-react';

interface ChatProps {
  user: AuthUser;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Geral' | UnitName>('Geral');
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<any>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    
    // Carregar mensagens iniciais
    DatabaseService.getMessages(activeTab)
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar chat:", err);
        setLoading(false);
      });

    // Fix: Using subscribeAllMessages instead of subscribeMessages and filtering by activeTab
    const sub = DatabaseService.subscribeAllMessages((newMsg) => {
      console.log("Chat received new message:", newMsg);
      if (newMsg.unit === activeTab) {
        setMessages(prev => {
          // Check if message already exists by ID
          if (newMsg.id && prev.some(m => m.id === newMsg.id)) return prev;
          
          // Try to find a matching optimistic message to replace
          const optimisticIdx = prev.findIndex(m => 
            String(m.id).startsWith('temp-') && 
            m.text === newMsg.text && 
            String(m.sender_id) === String(newMsg.sender_id)
          );

          if (optimisticIdx !== -1) {
            const newArr = [...prev];
            newArr[optimisticIdx] = newMsg;
            return newArr;
          }

          return [...prev, newMsg];
        });
      }
    });

    // Typing indicator subscription
    const typingSub = DatabaseService.subscribeTyping(activeTab, (users) => {
      setTypingUsers(users.filter(u => u.id !== user.id));
    });
    typingChannelRef.current = typingSub;

    return () => {
      sub.unsubscribe();
      typingSub.unsubscribe();
    };
  }, [activeTab, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Update typing status
    if (typingChannelRef.current) {
      DatabaseService.setTypingStatus(typingChannelRef.current, user, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        DatabaseService.setTypingStatus(typingChannelRef.current, user, false);
      }, 3000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Stop typing status immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (typingChannelRef.current) {
      DatabaseService.setTypingStatus(typingChannelRef.current, user, false);
    }

    const newMsg: ChatMessage = {
      sender_id: user.id,
      sender_name: user.name,
      sender_photo: user.photoUrl,
      text: inputText.trim(),
      unit: activeTab,
      created_at: new Date().toISOString()
    };

    const tempId = 'temp-' + Date.now();
    setInputText('');
    
    // Otimista: Adicionar à lista local imediatamente
    setMessages(prev => [...prev, { ...newMsg, id: tempId }]);

    try {
      await DatabaseService.sendMessage(newMsg);
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      // Remove a mensagem otimista se falhar
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("ERRO SUPABASE: " + (err.message || "Falha ao enviar para a tabela 'messages'."));
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] animate-in fade-in duration-500">
      {/* TABS SELECTOR */}
      <div className="bg-white border-b border-slate-100 flex p-1.5 gap-1.5 shrink-0">
        <button 
          onClick={() => setActiveTab('Geral')}
          className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'Geral' ? 'bg-[#0061f2] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400'}`}
        >
          <Users size={14} /> Global
        </button>
        {user.unit && (
          <button 
            onClick={() => setActiveTab(user.unit!)}
            className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === user.unit ? 'bg-[#0061f2] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400'}`}
          >
            <Shield size={14} /> Minha Unidade
          </button>
        )}
      </div>

      {/* CHAT AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col custom-scrollbar"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px', backgroundRepeat: 'repeat', backgroundOpacity: 0.1 }}
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-30">
            <Loader2 className="animate-spin text-[#0061f2]" size={32} />
            <p className="font-black uppercase text-[10px] tracking-widest">Conectando ao Chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-10">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl text-slate-300">
              <MessageSquare size={40} className="mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Comece a conversa!<br/>Diga oi para o clube.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div 
                key={msg.id || idx} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 mr-2 border-2 border-white shadow-sm shrink-0 mt-1">
                    <img src={msg.sender_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">
                      {msg.sender_name.split(' ')[0]}
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-[1.5rem] shadow-md relative ${isMe ? 'bg-[#0061f2] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                    <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className={`text-[8px] font-black mt-1 uppercase ${isMe ? 'text-white/60 text-right' : 'text-slate-300 text-right'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* TYPING INDICATOR */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-bottom-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {typingUsers.length === 1 
                ? `${typingUsers[0].name.split(' ')[0]} está digitando...` 
                : `${typingUsers.length} pessoas estão digitando...`}
            </span>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <form onSubmit={handleSend} className="bg-white p-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
        <div className="flex-1 bg-slate-50 rounded-[1.5rem] border border-slate-100 px-4 py-1 flex items-center">
          <input 
            type="text" 
            placeholder="Mensagem..."
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 bg-transparent py-2.5 outline-none font-bold text-slate-700 text-sm"
          />
        </div>
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className="w-12 h-12 bg-[#0061f2] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale"
        >
          <Send size={20} className="ml-1" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
