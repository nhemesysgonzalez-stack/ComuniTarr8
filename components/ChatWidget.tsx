
import React, { useState, useRef, useEffect } from 'react';
import { getAssistantResponse, getSearchGroundedInfo, getMapsGroundedPlaces } from '../services/geminiService';
import { ChatMessage, GroundingLink } from '../types';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: '¡Hola! Soy tu Mediador Vecinal. 🤝\nTe ayudo con la convivencia, trámites y lo que pasa hoy en el barrio. ¿En qué puedo orientarte?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantResponse: { text: string; links?: GroundingLink[] } = { text: "" };

    // Simple heuristic to decide which AI tool to use
    if (input.toLowerCase().includes('donde') || input.toLowerCase().includes('lugar') || input.toLowerCase().includes('cerca')) {
      assistantResponse = await getMapsGroundedPlaces(input);
    } else if (input.toLowerCase().includes('noticias') || input.toLowerCase().includes('reciente') || input.toLowerCase().includes('evento')) {
      assistantResponse = await getSearchGroundedInfo(input);
    } else {
      assistantResponse = await getAssistantResponse(input);
    }

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: assistantResponse.text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMsg]);

    // If there are grounding links, add them as a separate small message or append
    if (assistantResponse.links && assistantResponse.links.length > 0) {
      const linksText = "Fuentes encontradas:\n" + assistantResponse.links.map(l => `- [${l.title}](${l.uri})`).join('\n');
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        sender: 'assistant',
        text: linksText,
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="hidden lg:flex fixed bottom-6 left-[100px] z-50 flex-col items-start translate-x-1">
      {isOpen && (
        <div className="mb-4 w-72 h-[500px] bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-left-5">
          <header className="bg-emerald-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">handshake</span>
              <span className="font-black text-xs uppercase tracking-widest">Mediador Vecinal</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-text-main dark:text-gray-200 rounded-bl-none'
                  }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-[10px] mt-1 opacity-60 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta algo..."
                className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-primary focus:border-primary dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`size-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-gray-200 dark:bg-gray-700 text-text-main dark:text-white rotate-90' : 'bg-emerald-600 text-white hover:scale-110'
          }`}
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? 'close' : 'handshake'}
        </span>
      </button>
    </div>
  );
};
