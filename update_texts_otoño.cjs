const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /\bverano\b/g, to: 'otoño' },
  { from: /\bVerano\b/g, to: 'Otoño' },
  { from: /\bVERANO\b/g, to: 'OTOÑO' },
  { from: /Temporada de otoño a pleno rendimiento/g, to: 'Temporada de otoño en marcha' },
  { from: /Las playas de Tarragona registran llenos históricos/g, to: 'Los parques y montes de Tarragona registran gran afluencia' },
  { from: /La hostelería, el turismo y los servicios de playa generan/g, to: 'La logística, el comercio y la educación generan' },
  { from: /julio-septiembre/g, to: 'octubre-diciembre' },
  { from: /¿Cuál es tu playa favorita de Tarragona para este otoño\?/g, to: '¿Cuál es tu lugar favorito para pasear este otoño?' },
  { from: /'L\\'Arrabassada', 'El Miracle', 'Playa Larga', 'La Savinosa'/g, to: "'El Pont del Diable', 'L\\'Anella Mediterrània', 'Bosque de la Marquesa', 'Loreto'" },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated texts in: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) traverseDirectory(fullPath);
    else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) processFile(fullPath);
  }
}

['./pages', './components', './services'].forEach(dir => traverseDirectory(path.join(__dirname, dir)));
