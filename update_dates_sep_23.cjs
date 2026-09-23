const fs = require('fs');
const path = require('path');

const directoriesToUpdate = ['./pages', './components', './services'];

const dateReplacements = [
  // Exact ISO dates
  { from: /2026-09-08/g, to: '2026-09-21' },
  { from: /2026-09-09/g, to: '2026-09-22' },
  { from: /2026-09-10/g, to: '2026-09-23' },
  
  // Textual dates in Spanish
  { from: /8 de Septiembre/g, to: '21 de Septiembre' },
  { from: /8 de septiembre/gi, to: '21 de septiembre' },
  { from: /8 Septiembre/g, to: '21 Septiembre' },
  { from: /8 Sep/g, to: '21 Sep' },
  
  { from: /9 de Septiembre/g, to: '22 de Septiembre' },
  { from: /9 de septiembre/gi, to: '22 de septiembre' },
  { from: /9 Septiembre/g, to: '22 Septiembre' },
  { from: /9 Sep/g, to: '22 Sep' },

  { from: /10 de Septiembre/g, to: '23 de Septiembre' },
  { from: /10 de septiembre/gi, to: '23 de septiembre' },
  { from: /10 Septiembre/g, to: '23 Septiembre' },
  { from: /10 Sep/g, to: '23 Sep' },
  
  // Weekdays
  { from: /Martes 8/g, to: 'Lunes 21' },
  { from: /MARTES 8/g, to: 'LUNES 21' },
  { from: /Mar 8/g, to: 'Lun 21' },
  
  { from: /Miércoles 9/g, to: 'Martes 22' },
  { from: /MIÉRCOLES 9/g, to: 'MARTES 22' },
  { from: /Mié 9/g, to: 'Mar 22' },

  { from: /Jueves 10/g, to: 'Miércoles 23' },
  { from: /JUEVES 10/g, to: 'MIÉRCOLES 23' },
  { from: /Jue 10/g, to: 'Mié 23' },
  
  // Fixes for some typos like "Jueves 10 Jun 2026" and "Lun 9 Sep"
  { from: /Jueves 10 Jun 2026/g, to: 'Miércoles 23 Sep 2026' },
  { from: /Lun 9 Sep/g, to: 'Mar 22 Sep' },
  { from: /Semana 26/g, to: 'Semana 38' },
  
  { from: /Hoy Miércoles/g, to: 'Hoy Lunes' },
  { from: /Hoy Jueves/g, to: 'Hoy Miércoles' },
  { from: /Mañana Jueves/g, to: 'Mañana Miércoles' },
  
  { from: /hasSeenCautionSep09/g, to: 'hasSeenCautionSep23' },
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
