import React from 'react';
import './TrainChat.css';

const TrainChat: React.FC = () => {
  return (
    <section className="trainchat">
      <h1>Vagón RENFE</h1>
      <p>Chat en tiempo real para viajeros del tren.</p>
      <div className="chat-window">
        <p><em>Chat placeholder...</em></p>
      </div>
    </section>
  );
};

export default TrainChat;
