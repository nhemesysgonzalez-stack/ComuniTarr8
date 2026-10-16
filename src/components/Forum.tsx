import React, { useEffect, useState } from 'react';
import { unlockAudio, sendBuzz } from '../utils/audio';
import { fetchThreadMessages, postMessage } from '../utils/api';
import './Forum.css';

// Simulación de obtener el barrio del usuario
const getUserNeighborhood = () => {
  // En una aplicación real, se obtendría del perfil o geolocalización
  return 'Part Alta';
};

const Forum: React.FC = () => {
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [threads, setThreads] = useState<Record<string, any[]>>({});
  const [currentThread, setCurrentThread] = useState<string>('general');
  const [message, setMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    const nb = getUserNeighborhood();
    setNeighborhood(nb);
    // Cargar mensajes según barrio
    fetchThreadMessages(nb).then(data => setThreads(data));
  }, []);

  const handleBuzz = () => {
    unlockAudio();
    sendBuzz();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    await postMessage(neighborhood, currentThread, message);
    setMessage('');
    // Recargar hilos
    const data = await fetchThreadMessages(neighborhood);
    setThreads(data);
  };

  return (
    <div className="forum-container">
      <h2>{neighborhood} · {currentThread.charAt(0).toUpperCase() + currentThread.slice(1)}</h2>
      <div className="threads">
        {threads[currentThread]?.map((msg, i) => (
          <div key={i} className="message">
            <span className="author">{msg.author}</span>: {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button onClick={handleSend}>Enviar</button>
        <button className="buzz" onClick={handleBuzz}>Zumbido</button>
      </div>
      {showToast && (
        <div className="toast">
          <span className="icon">🔊</span> Zumbido activo
        </div>
      )}
    </div>
  );
};

export default Forum;
