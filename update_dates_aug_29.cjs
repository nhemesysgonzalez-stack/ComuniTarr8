const fs = require('fs');
const path = require('path');

const directoriesToUpdate = ['./pages', './components', './services'];

const dateReplacements = [
  // Exact ISO dates
  { from: /2026-08-03/g, to: '2026-08-29' },
  { from: /2026-08-04/g, to: '2026-08-30' },
  { from: /2026-08-02/g, to: '2026-08-28' },
  
  // Textual dates in Spanish
  { from: /3 de Agosto/g, to: '29 de Agosto' },
  { from: /3 de agosto/gi, to: '29 de agosto' },
  { from: /3 Agosto/g, to: '29 Agosto' },
  { from: /3 Ago/g, to: '29 Ago' },
  
  { from: /4 de Agosto/g, to: '30 de Agosto' },
  { from: /4 de agosto/gi, to: '30 de agosto' },
  { from: /4 Agosto/g, to: '30 Agosto' },
  { from: /4 Ago/g, to: '30 Ago' },

  { from: /2 de Agosto/g, to: '28 de Agosto' },
  { from: /2 de agosto/gi, to: '28 de agosto' },
  { from: /2 Agosto/g, to: '28 Agosto' },
  
  // Weekdays
  { from: /Lunes 3/g, to: 'Sábado 29' },
  { from: /LUNES 3/g, to: 'SÁBADO 29' },
  { from: /Lun 3/g, to: 'Sáb 29' },
  
  { from: /Martes 4/g, to: 'Domingo 30' },
  { from: /MARTES 4/g, to: 'DOMINGO 30' },
  { from: /Mar 4/g, to: 'Dom 30' },

  { from: /Domingo 2/g, to: 'Viernes 28' },
  { from: /DOMINGO 2/g, to: 'VIERNES 28' },
  { from: /Dom 2/g, to: 'Vie 28' },
  
  { from: /Lunes/g, to: 'Sábado' }, // Need to be careful here, only replacing exact ones
  { from: /Martes/g, to: 'Domingo' },
  // Let's replace 'Hoy Lunes' to 'Hoy Sábado'
  { from: /Hoy Lunes/g, to: 'Hoy Sábado' },
  { from: /Hoy Martes/g, to: 'Hoy Domingo' },
  { from: /Mañana Martes/g, to: 'Mañana Domingo' },
  
  { from: /hasSeenCautionAug03/g, to: 'hasSeenCautionAug29' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  dateReplacements.forEach(replacement => {
    content = content.replace(replacement.from, replacement.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated dates in: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      processFile(fullPath);
    }
  }
}

directoriesToUpdate.forEach(dir => {
  traverseDirectory(path.join(__dirname, dir));
});

console.log('Date update script finished.');
