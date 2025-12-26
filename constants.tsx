
import React from 'react';
import { UserProfile, Challenge, CommunityEvent, MarketplaceItem } from './types';

export const CURRENT_USER: UserProfile = {
  id: 'u1',
  name: 'María García',
  neighborhood: 'El Serrallo, Tarragona',
  avatar: 'https://picsum.photos/seed/maria/200',
  joinedDate: '2021',
  score: 85,
  tags: ['Voluntaria Activa']
};

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Reto Calles Limpias',
    description: 'Ayuda a mantener las calles del Serrallo libres de basura.',
    progress: 150,
    total: 200,
    image: 'https://picsum.photos/seed/cleanup/600/400',
    category: 'Ecológico'
  },
  {
    id: 'c2',
    title: 'Limpieza Playa del Milagro',
    description: 'Jornada comunitaria de limpieza de plásticos.',
    progress: 45,
    total: 100,
    image: 'https://picsum.photos/seed/beach/600/400',
    category: 'Marítimo'
  },
  {
    id: 'c3',
    title: 'Huerto Comunitario',
    description: 'Participa en el mantenimiento del huerto de la Part Alta.',
    progress: 80,
    total: 100,
    image: 'https://picsum.photos/seed/garden/600/400',
    category: 'Agrícola'
  }
];

export const EVENTS: CommunityEvent[] = [
  {
    id: 'e1',
    title: 'Ensayo de Castellers',
    date: 'Vie 24',
    time: '19:00',
    location: 'Plaça de la Font',
    description: 'Ensayo abierto para la próxima Diada.',
    image: 'https://picsum.photos/seed/castellers/600/400'
  },
  {
    id: 'e2',
    title: 'Festa Major de Santa Tecla',
    date: 'Lun 23',
    time: '12:00',
    location: 'Part Alta',
    description: 'Eventos principales de las fiestas.',
    image: 'https://picsum.photos/seed/fiesta/600/400'
  }
];

export const MARKET_ITEMS: MarketplaceItem[] = [
  {
    id: 'm1',
    title: 'Sofá 2 plazas',
    neighborhood: 'Barrio del Puerto',
    time: 'Hace 2h',
    image: 'https://picsum.photos/seed/sofa/600/400',
    category: 'Muebles'
  },
  {
    id: 'm2',
    title: 'Bicicleta Montaña',
    neighborhood: 'Eixample',
    time: 'Hace 5h',
    image: 'https://picsum.photos/seed/bike/600/400',
    category: 'Deportes'
  }
];
