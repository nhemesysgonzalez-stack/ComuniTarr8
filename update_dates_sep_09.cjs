const fs = require('fs');
const path = require('path');

const directoriesToUpdate = ['./pages', './components', './services'];

const dateReplacements = [
  // Exact ISO dates
  { from: /2026-08-28/g, to: '2026-09-08' },
  { from: /2026-08-29/g, to: '2026-09-09' },
  { from: /2026-08-30/g, to: '2026-09-10' },
  
  // Textual dates in Spanish
  { from: /28 de Agosto/g, to: '8 de Septiembre' },
  { from: /28 de agosto/gi, to: '8 de septiembre' },
  { from: /28 Agosto/g, to: '8 Septiembre' },
  { from: /28 Ago/g, to: '8 Sep' },
  
  { from: /29 de Agosto/g, to: '9 de Septiembre' },
  { from: /29 de agosto/gi, to: '9 de septiembre' },
  { from: /29 Agosto/g, to: '9 Septiembre' },
  { from: /29 Ago/g, to: '9 Sep' },

  { from: /30 de Agosto/g, to: '10 de Septiembre' },
  { from: /30 de agosto/gi, to: '10 de septiembre' },
  { from: /30 Agosto/g, to: '10 Septiembre' },
  { from: /30 Ago/g, to: '10 Sep' },
  
  // Generic months
  { from: /Agosto/g, to: 'Septiembre' },
  { from: /agosto/g, to: 'septiembre' },
  { from: /AGOSTO/g, to: 'SEPTIEMBRE' },

  // Weekdays (28 Aug = Vie, 29 Aug = Sáb, 30 Aug = Dom) -> (8 Sep = Mar, 9 Sep = Mié, 10 Sep = Jue)
  { from: /Viernes 28/g, to: 'Martes 8' },
  { from: /VIERNES 28/g, to: 'MARTES 8' },
  { from: /Vie 28/g, to: 'Mar 8' },
  
  { from: /Sábado 29/g, to: 'Miércoles 9' },
  { from: /SÁBADO 29/g, to: 'MIÉRCOLES 9' },
  { from: /Sáb 29/g, to: 'Mié 9' },

  { from: /Domingo 30/g, to: 'Jueves 10' },
  { from: /DOMINGO 30/g, to: 'JUEVES 10' },
  { from: /Dom 30/g, to: 'Jue 10' },
  
  { from: /Hoy Sábado/g, to: 'Hoy Miércoles' },
  { from: /Hoy Domingo/g, to: 'Hoy Jueves' },
  { from: /Mañana Domingo/g, to: 'Mañana Jueves' },
  
  { from: /hasSeenCautionAug29/g, to: 'hasSeenCautionSep09' },
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
