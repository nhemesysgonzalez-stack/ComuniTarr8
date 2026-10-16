import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Forum from './components/Forum';
import FirstDate from './components/FirstDate';
import TrainChat from './components/TrainChat';

function Home() {
  return (
    <section id="center">
      <div className="hero">
        <h1>Bienvenido a ComuniTarr</h1>
        <p>Explora los módulos del barrio.</p>
      </div>
    </section>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/forum">Foro</Link>
        <Link to="/firstdate">First Date</Link>
        <Link to="/trainchat">Vagón RENFE</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/firstdate" element={<FirstDate />} />
          <Route path="/trainchat" element={<TrainChat />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
