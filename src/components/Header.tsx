import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="cintillo">
      <div className="cintillo-content">
        ¡Bienvenido a ComuniTarr! Conecta con tu barrio, descubre eventos y charla en el vagón RENFE.
      </div>
    </header>
  );
};

export default Header;
