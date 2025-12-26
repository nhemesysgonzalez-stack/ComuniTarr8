import React, { useState } from 'react';

const CommunityStories: React.FC = () => {
    const [stories, setStories] = useState([
        { id: '1', user: 'Laura P.', content: 'Ayudé a mi vecina del 3º a subir un sofá ayer. ¡Casi no llegamos pero lo logramos! Al final me invitó a un té.', icon: 'handshake', date: 'Hace 2 horas' },
        { id: '2', user: 'Carlos M.', content: 'Compartí mi almuerzo con una persona que duerme cerca de la Rambla. Tuvimos una charla súper interesante sobre historia de Tarragona.', icon: 'restaurant', date: 'Ayer' },
        { id: '3', user: 'Ana G.', content: 'He plantado mi primer árbol en el jardín comunitario del barrio. Se llama "Broto" y espero que crezca fuerte.', icon: 'forest', date: 'Hace 3 días' },
        { id: '4', user: 'Marc S.', content: 'Acompañé a un anciano con sus bolsas desde el mercado central hasta su casa. Me contó historias de cómo era la plaza hace 50 años.', icon: 'elderly', date: 'Lunes' },
        { id: '5', user: 'Elena B.', content: 'Hoy compartí mis conocimientos de inglés con dos vecinos que quieren mejorar para su trabajo. ¡Fue genial!', icon: 'translate', date: 'Hoy' },
    ]);

    const [newStory, setNewStory] = useState('');

    const handleAddStory = () => {
        if (!newStory) return;
        const story = {
            id: Date.now().toString(),
            user: 'Yo',
            content: newStory,
            icon: 'volunteer_activism',
            date: 'Ahora mismo'
        };
        setStories([story, ...stories]);
        setNewStory('');
        alert('¡Gracias por compartir tu historia de bienestar!');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            <div className="bg-orange-500 text-white py-20 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <span className="material-symbols-outlined text-7xl mb-6 opacity-80">sentiment_satisfied</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Historias de Bienestar</h1>
                    <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed">Celebramos lo bueno que pasa en Tarragona. Comparte tus pequeños actos de bondad e inspira a otros vecinos.</p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 md:p-12 -mt-12">
                {/* Input Area */}
                <div className="bg-white dark:bg-surface-dark rounded-[40px] p-8 shadow-2xl mb-12 border border-orange-200 dark:border-orange-900/30">
                    <h3 className="text-xl font-black mb-4 dark:text-white">¿Qué has hecho hoy por el barrio?</h3>
                    <textarea
                        value={newStory}
                        onChange={e => setNewStory(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-6 text-lg font-medium dark:text-white h-32 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                        placeholder="Ej: Ayudé a un vecino con las bolsas, planté una flor..."
                    ></textarea>
                    <div className="flex justify-end mt-4">
                        <button onClick={handleAddStory} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                            PUBLICAR HISTORIA
                        </button>
                    </div>
                </div>

                {/* Stories Feed */}
                <div className="space-y-8">
                    {stories.map(story => (
                        <div key={story.id} className="bg-white dark:bg-surface-dark rounded-[40px] p-10 shadow-xl border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-8xl text-orange-500">{story.icon}</span>
                            </div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="size-14 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 font-black text-xl">
                                    {story.user.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black text-xl dark:text-white">{story.user}</h4>
                                    <p className="text-xs text-gray-400 font-bold">{story.date}</p>
                                </div>
                            </div>
                            <p className="text-xl dark:text-gray-200 leading-relaxed font-medium relative z-10 italic">
                                "{story.content}"
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CommunityStories;
