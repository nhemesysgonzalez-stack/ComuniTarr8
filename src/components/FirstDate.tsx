import React from 'react';
import './FirstDate.css';

const FirstDate: React.FC = () => {
  return (
    <section className="firstdate">
      <h1>First Date Tarragona</h1>
      <p>Descubre lugares románticos y actividades para tu primera cita en Tarragona.</p>
      <ul>
        <li>Parque del Francolí – Paseo junto al río.</li>
        <li>Rambla Nova – Cafés y tiendas.</li>
        <li>Marina – Cena con vista al mar.</li>
      </ul>
    </section>
  );
};

export default FirstDate;
