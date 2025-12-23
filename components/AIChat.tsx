
import React, { useState } from 'react';
import { getAIChatResponse } from '../services/gemini';

const AIChat: React.FC<{ context: any }> = ({ context }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const response = await getAIChatResponse(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: response || '' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Извините, произошла ошибка.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] glass rounded-3xl overflow-hidden border border-slate-100">
      <div className="p-4 bg-emerald-600 text-white font-bold text-center">ИИ-Консультант Janamen</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 italic">Печатает...</div>}
      </div>
      <div className="p-4 bg-white border-t flex gap-2">
        <input 
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Спроси о тренировке..."
          className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="bg-emerald-600 text-white p-2 rounded-xl">🚀</button>
      </div>
    </div>
  );
};

export default AIChat;
