import React, { useState, useRef, useEffect } from 'react';
import { getAssistantResponse } from '../services/geminiService';

interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    time: string;
}

const Assistant: React.FC = () => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: '¡Hola! Soy tu Mediador Vecinal. 🤝\nEstoy aquí para ayudarte con dudas sobre convivencia, servicios del barrio o lo que está pasando hoy en Tarragona. ¿Cómo puedo ayudarte?', isUser: false, time: 'Ahora' }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input;
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: userText,
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Call Real Gemini API
            const response = await getAssistantResponse(userText);

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Error al obtener respuesta de IA", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "Lo siento, tuve un problema al conectar con mi cerebro digital. Inténtalo de nuevo.",
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-50 dark:bg-background-dark overflow-hidden">
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                <div className="max-w-3xl mx-auto w-full p-4 md:p-8 space-y-6">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`size-10 rounded-full shrink-0 flex items-center justify-center ${msg.isUser ? 'bg-gray-200' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'}`}>
                                    {msg.isUser ? (
                                        <span className="material-symbols-outlined text-gray-500">person</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-xl">handshake</span>
                                    )}
                                </div>
                                <div className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl text-sm md:text-base whitespace-pre-line leading-relaxed shadow-sm ${msg.isUser
                                        ? 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-tr-none'
                                        : 'bg-emerald-600 text-white rounded-tl-none shadow-emerald-500/10'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-3xl mx-auto w-full flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 pr-2">
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm md:text-base dark:text-white outline-none"
                        placeholder="Pregúntame algo sobre el barrio..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className={`p-3 text-white rounded-xl transition shadow-lg shadow-emerald-600/20 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                        <span className="material-symbols-outlined block">{isLoading ? 'hourglass_empty' : 'send'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
