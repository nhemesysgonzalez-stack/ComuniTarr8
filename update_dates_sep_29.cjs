const fs = require('fs');
const path = require('path');

const directoriesToUpdate = ['./pages', './components', './services'];

const dateReplacements = [
  // Exact ISO dates
  { from: /2026-09-21/g, to: '2026-09-27' },
  { from: /2026-09-22/g, to: '2026-09-28' },
  { from: /2026-09-23/g, to: '2026-09-29' },
  
  // Textual dates in Spanish
  { from: /21 de Septiembre/gi, to: '27 de Septiembre' },
  { from: /21 Septiembre/gi, to: '27 Septiembre' },
  { from: /21 Sep/gi, to: '27 Sep' },
  
  { from: /22 de Septiembre/gi, to: '28 de Septiembre' },
  { from: /22 Septiembre/gi, to: '28 Septiembre' },
  { from: /22 Sep/gi, to: '28 Sep' },

  { from: /23 de Septiembre/gi, to: '29 de Septiembre' },
  { from: /23 Septiembre/gi, to: '29 Septiembre' },
  { from: /23 Sep/gi, to: '29 Sep' },
  
  // Weekdays
  { from: /Lunes 21/gi, to: 'Domingo 27' },
  { from: /Lun 21/gi, to: 'Dom 27' },
  
  { from: /Martes 22/gi, to: 'Lunes 28' },
  { from: /Mar 22/gi, to: 'Lun 28' },

  { from: /Miércoles 23/gi, to: 'Martes 29' },
  { from: /Mié 23/gi, to: 'Mar 29' },
  
  // Specific fixes
  { from: /Miércoles 23 Sep 2026/gi, to: 'Martes 29 Sep 2026' },
  { from: /Mar 22 Sep/gi, to: 'Lun 28 Sep' },
  { from: /Semana 38/gi, to: 'Semana 39' },
  
  { from: /Hoy Lunes/gi, to: 'Hoy Domingo' },
  { from: /Hoy Miércoles/gi, to: 'Hoy Martes' },
  { from: /Mañana Miércoles/gi, to: 'Mañana Martes' },
  
  { from: /hasSeenCautionSep23/g, to: 'hasSeenCautionSep29' },
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
