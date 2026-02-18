import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// El componente se mantiene para futuros efectos temporales, pero actualmente está desactivado
const DynamicThemeEffects: React.FC = React.memo(() => {
    const location = useLocation();

    // Solo mostrar en la Home (Welcome screen)
    const isHome = location.pathname === '/';

    if (!isHome) return null;

    // ELIMINADO: Confeti y overlay festivo tras el fin de Carnaval
    return null;
});

DynamicThemeEffects.displayName = 'DynamicThemeEffects';

export default DynamicThemeEffects;
