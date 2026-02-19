import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const CommunityStories: React.FC = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stories, setStories] = useState<any[]>([]);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .order('created_at', { ascending: false });

        const mockStories = [
            { id: 'ms1', user_name: 'Ana T.', content: 'Increíble la calma en la Plaça de la Font hoy. Ya no queda ni rastro del Carnaval. 🧹✨', image_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a9ba332f', likes: 124, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: 'ms2', user_name: 'Marc G.', content: 'Amanecer en el Balcón del Mediterráneo. Jueves de rutina. 🌅💼', image_url: 'https://images.unsplash.com/photo-1493238792000-8113da705763', likes: 89, created_at: new Date().toISOString() },
            { id: 'ms3', user_name: 'Pilar S.', content: 'Probando los primeros buñuelos de viento de la temporada. ¡Están de muerte! 🍩😋', image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', likes: 156, created_at: new Date().toISOString() },
            { id: 'ms4', user_name: 'Joan R.', content: 'Ayer fue impresionante la ceremonia de la Ceniza en la Catedral. 🙏', image_url: 'https://images.unsplash.com/photo-1548543604-a87c9909abec', likes: 78, created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }
        ];

        if (data && data.length > 0) {
            setStories(data);
        } else {
            setStories(mockStories);
        }
    };

    const [likedStories, setLikedStories] = useState<string[]>([]);

    const handleLike = async (storyId: string, currentLikes: number) => {
        // Optimistic UI toggle
        const isLiked = likedStories.includes(storyId);
        const newLikes = isLiked ? Math.max(0, currentLikes - 1) : (currentLikes || 0) + 1;

        // Update local state immediately
        setStories(prev => prev.map(s => s.id === storyId ? { ...s, likes: newLikes } : s));
        setLikedStories(prev => isLiked ? prev.filter(id => id !== storyId) : [...prev, storyId]);

        // Don't update DB if it's a mock story
        if (storyId.startsWith('ms')) return;

        try {
            const { error } = await supabase
                .from('stories')
                .update({ likes: newLikes })
                .eq('id', storyId);

            if (error) throw error;
        } catch (error) {
            console.error('Error liking story:', error);
            // Rollback if error
            setStories(prev => prev.map(s => s.id === storyId ? { ...s, likes: currentLikes } : s));
            setLikedStories(prev => isLiked ? [...prev, storyId] : prev.filter(id => id !== storyId));
        }
    };

    const [commentingOn, setCommentingOn] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');

    const handleComment = (storyId: string) => {
        const comment = prompt('Escribe tu comentario:');
        if (comment) {
            alert('¡Comentario enviado! (Próximamente se guardará en la base de datos)');
        }
    };

    const [newStory, setNewStory] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddStory = async () => {
        if (!newStory && !selectedImage) return;
        if (!user) {
            alert('Debes iniciar sesión para publicar.');
            return;
        }

        // Limit file size to 50MB
        if (imageFile && imageFile.size > 50 * 1024 * 1024) {
            alert('⚠️ El archivo es demasiado grande (Máx 50MB). Intenta con un vídeo más corto o de menor calidad.');
            return;
        }

        try {
            let publicUrl = null;

            // 1. Upload Image/Video if exists
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;

                // Show uploading indicator (simple alert for now, could be state)
                // setIsUploading(true); 

                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Supabase Storage Error:', uploadError);
                    throw new Error(`Error subiendo archivo: ${uploadError.message}`);
                }

                const { data } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(fileName);

                publicUrl = data.publicUrl;
            }

            // 2. Insert into DB
            const { error: dbError } = await supabase
                .from('stories')
                .insert({
                    user_id: user.id,
                    user_name: user.user_metadata?.full_name || 'Vecino',
                    content: newStory,
                    image_url: publicUrl,
                    icon: imageFile?.type.startsWith('video') ? 'videocam' : 'camera'
                });

            if (dbError) throw dbError;

            // 3. Reset and Refresh
            setNewStory('');
            setSelectedImage(null);
            setImageFile(null);
            fetchStories();
            alert('¡Publicado en la Nube del Barrio! ☁️🎉');

        } catch (error: any) {
            console.error('Error sharing story:', error);
            alert(`Hubo un error: ${error.message || 'Inténtalo de nuevo.'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            <div className="bg-gradient-to-br from-orange-400 to-rose-500 text-white py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <span className="material-symbols-outlined text-[300px] absolute -top-20 -left-20 rotate-12">auto_awesome_motion</span>
                </div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <span className="material-symbols-outlined text-7xl mb-6 bg-white/20 p-6 rounded-full backdrop-blur-md">camera_roll</span>
                    <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase leading-none">Galería Vecinal</h1>
                    <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-wide">
                        Inmortaliza la vida en Tarragona. Fotos del barrio, retos cumplidos y momentos de comunidad.
                    </p>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 md:p-12 -mt-16 relative z-20">
                {/* Input Area */}
                <div className="bg-white dark:bg-surface-dark rounded-[50px] p-8 md:p-12 shadow-2xl mb-16 border border-white dark:border-gray-800">
                    <h3 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tight">Compartir un momento</h3>

                    <div className="grid md:grid-cols-[1fr_250px] gap-8">
                        <div className="space-y-4">
                            <textarea
                                value={newStory}
                                onChange={e => setNewStory(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[30px] p-8 text-xl font-medium dark:text-white h-44 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none resize-none"
                                placeholder="Escribe algo sobre esta foto o momento..."
                            ></textarea>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    <span className="material-symbols-outlined">add_a_photo</span>
                                    {selectedImage ? 'Cambiar' : 'Añadir Foto/Vídeo'}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={handleImageChange}
                                />
                                {selectedImage && (
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="text-red-500 font-black text-[10px] uppercase tracking-widest"
                                    >
                                        Quitar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="relative group">
                            {selectedImage ? (
                                <div className="aspect-square rounded-[30px] overflow-hidden shadow-xl border-4 border-white dark:border-gray-800 bg-black">
                                    {selectedImage.startsWith('data:video') ? (
                                        <video src={selectedImage} className="w-full h-full object-cover" controls />
                                    ) : (
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-[30px] bg-gray-50 dark:bg-gray-800 border-4 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-orange-500 hover:text-orange-500 transition-all group"
                                >
                                    <span className="material-symbols-outlined text-5xl mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center">Foto o Vídeo<br />(Max 2 min)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end mt-10">
                        <button
                            onClick={handleAddStory}
                            disabled={!newStory && !selectedImage}
                            className={`px-12 py-5 rounded-[25px] font-black text-xl transition-all shadow-2xl uppercase tracking-widest ${(!newStory && !selectedImage) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:scale-105 active:scale-95 shadow-orange-500/20'}`}
                        >
                            SUBIR A LA GALERÍA
                        </button>
                    </div>
                    <p className="text-center text-[9px] font-bold text-gray-400 mt-6 uppercase tracking-[0.2em]">Nota: Las imágenes se eliminarán automáticamente tras 60 días para optimizar espacio.</p>
                </div>

                {/* Gallery Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {stories.map(story => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={story.id}
                            className="break-inside-avoid bg-white dark:bg-surface-dark rounded-[40px] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all group"
                        >
                            {story.image_url && (
                                <div
                                    className="relative overflow-hidden aspect-[4/5] bg-black cursor-pointer"
                                    onDoubleClick={() => handleLike(story.id, story.likes)}
                                >
                                    {story.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                                        <video src={story.image_url} className="w-full h-full object-cover" controls />
                                    ) : (
                                        <>
                                            <img src={story.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                                <p className="text-white text-xs font-bold italic">"{story.content}"</p>
                                            </div>

                                            {/* Like Animation Overlay */}
                                            <AnimatePresence>
                                                {likedStories.includes(story.id) && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                    >
                                                        <span className="material-symbols-outlined text-white text-9xl drop-shadow-2xl fill-1">favorite</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 font-black text-xs">
                                        {story.user_name?.charAt(0) || 'V'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm dark:text-white leading-none mb-1">{story.user_name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(story.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {!story.image_url && (
                                    <p className="text-lg dark:text-gray-200 leading-relaxed font-medium italic mb-4">
                                        "{story.content}"
                                    </p>
                                )}
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <button
                                        onClick={() => handleLike(story.id, story.likes)}
                                        className={`flex items-center gap-1.5 transition-all active:scale-125 ${likedStories.includes(story.id) ? 'text-rose-500' : 'text-gray-400'}`}
                                    >
                                        <motion.span
                                            animate={likedStories.includes(story.id) ? { scale: [1, 1.4, 1] } : {}}
                                            className={`material-symbols-outlined text-lg ${likedStories.includes(story.id) ? 'fill-1' : ''}`}
                                        >
                                            {likedStories.includes(story.id) ? 'favorite' : 'favorite'}
                                        </motion.span>
                                        <span className="text-[10px] font-black">{story.likes || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => handleComment(story.id)}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                        <span className="text-[10px] font-black">Comentar</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CommunityStories;
