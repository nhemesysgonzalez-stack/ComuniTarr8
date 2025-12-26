import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    time: string;
}

const Assistant: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: '¡Hola! Soy tu Asistente Vecinal IA. 🤖\nPuedo ayudarte con información sobre horarios de basura, teléfonos de emergencia, o normas de la comunidad. ¿En qué te ayudo hoy?', isUser: false, time: 'Ahora' }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: input,
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI Response
        setTimeout(() => {
            let replyText = "Entendido. Como soy una demo, aún aprendo, pero pronto podré responderte con precisión sobre eso.";
            if (input.toLowerCase().includes('basura') || input.toLowerCase().includes('reciclaje')) {
                replyText = "🗑️ La recogida de basura orgánica es diaria a partir de las 20:00h. El punto limpio móvil viene los jueves a la Plaza del Mercado.";
            } else if (input.toLowerCase().includes('policia') || input.toLowerCase().includes('emergencia')) {
                replyText = "🚨 Para emergencias llama al 112. Policía Local de Tarragona: 092. Si es algo vecinal, puedes usar el botón de SOS en la app.";
            } else if (input.toLowerCase().includes('fiesta') || input.toLowerCase().includes('ruido')) {
                replyText = "🤫 Las normas de convivencia establecen silencio a partir de las 23:00h entre semana y 00:00h fines de semana.";
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: replyText,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-50 dark:bg-background-dark">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`size-10 rounded-full shrink-0 flex items-center justify-center ${msg.isUser ? 'bg-gray-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'}`}>
                                {msg.isUser ? (
                                    <span className="material-symbols-outlined text-gray-500">person</span>
                                ) : (
                                    <span className="material-symbols-outlined text-xl">smart_toy</span>
                                )}
                            </div>
                            <div className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-2xl text-sm md:text-base whitespace-pre-line leading-relaxed shadow-sm ${msg.isUser
                                        ? 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-tr-none'
                                        : 'bg-indigo-600 text-white rounded-tl-none shadow-indigo-500/10'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-4xl mx-auto flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 pr-2">
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm md:text-base dark:text-white"
                        placeholder="Pregúntame algo sobre el barrio..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
                    >
                        <span className="material-symbols-outlined block">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
