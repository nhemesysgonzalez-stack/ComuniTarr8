import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const DynamicThemeEffects: React.FC = React.memo(() => {
    const location = useLocation();

    // Solo mostrar en la Home (Welcome screen)
    const isHome = location.pathname === '/';

    return null;
});

DynamicThemeEffects.displayName = 'DynamicThemeEffects';

export default DynamicThemeEffects;
