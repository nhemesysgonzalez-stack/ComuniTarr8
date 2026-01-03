
export const NEIGHBORHOODS = [
    'PART ALTA',
    'EL SERRALLO',
    'LA CANONJA',
    'BONAVISTA',
    'SANT PERE I SANT PAU',
    'SANT SALVADOR',
    'EIXAMPLE',
    'MARINA',
    'BARRIS MARÍTIMS',
    'BARRIS DE LLEVANT',
    'BARRIS DE PONENT',
    'GENERAL'
];

export const CURRENT_USER = {
    name: 'Juan Pérez',
    address: 'Carrer Major, 15, Tarragona',
    score: 1250,
    joinedDate: 'Marzo 2024',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=0D8ABC&color=fff',
};

export const CHALLENGES = [
    {
        id: '1',
        title: 'Recogida de plásticos en el Serrallo',
        description: 'Quedada matutina para limpiar la zona del puerto y concienciar sobre el medio ambiente.',
        progress: 45,
        total: 100,
        image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
        participants: 12,
    },
    {
        id: '2',
        title: 'Donación de alimentos - Banco Local',
        description: 'Campaña de recogida de alimentos no perecederos para las familias más necesitadas del barrio.',
        progress: 750,
        total: 1000,
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
        participants: 45,
    },
    {
        id: '3',
        title: 'Plantar árboles en la Anilla Verde',
        description: 'Ayúdanos a reforestar los pulmones de nuestra ciudad este domingo.',
        progress: 20,
        total: 50,
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&w=800&q=80',
        participants: 8,
    },
];

export const EVENTS = [
    {
        id: '1',
        title: 'Fiesta Mayor de Tarragona: Santa Tecla',
        date: 'SEP 23',
        time: '12:00 PM',
        location: 'Part Alta',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '2',
        title: 'Mercadillo de Segunda Mano',
        date: 'OCT 05',
        time: '09:00 AM',
        location: 'El Serrallo',
        image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
    },
];

export const MARKET_ITEMS = [
    {
        id: '1',
        title: 'Bicicleta de montaña casi nueva',
        price: 120,
        seller: 'Marta G.',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        category: 'Deportes',
    },
    {
        id: '2',
        title: 'Cámara Reflex Canon EOS',
        price: 350,
        seller: 'Carlos R.',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        category: 'Electrónica',
    },
    {
        id: '3',
        title: 'Silla de escritorio ergonómica',
        price: 45,
        seller: 'Ana L.',
        image: 'https://images.unsplash.com/photo-1505797149-35ebcb05a6fd?auto=format&fit=crop&w=800&q=80',
        category: 'Hogar',
    },
];
