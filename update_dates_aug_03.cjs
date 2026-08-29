const fs = require('fs');
const path = require('path');

const directoriesToUpdate = ['./pages', './components', './services'];

const dateReplacements = [
  // Exact ISO dates
  { from: /2026-07-21/g, to: '2026-08-03' },
  { from: /2026-07-20/g, to: '2026-08-02' },
  { from: /2026-07-22/g, to: '2026-08-04' },
  
  // Textual dates in Spanish
  { from: /21 de Julio/g, to: '3 de Agosto' },
  { from: /21 Julio/g, to: '3 Agosto' },
  { from: /21 Jul/g, to: '3 Ago' },
  { from: /21-jul/g, to: '3-ago' },
  
  { from: /20 de Julio/g, to: '2 de Agosto' },
  { from: /20 Julio/g, to: '2 Agosto' },
  { from: /20 Jul/g, to: '2 Ago' },
  
  { from: /22 de Julio/g, to: '4 de Agosto' },
  { from: /22 Julio/g, to: '4 Agosto' },
  { from: /22 Jul/g, to: '4 Ago' },

  { from: /30 de Junio/g, to: '3 de Agosto' },
  { from: /30 de junio/gi, to: '3 de agosto' },
  { from: /30 Junio/g, to: '3 Agosto' },
  { from: /30 Jun/g, to: '3 Ago' },

  { from: /28 de Junio/g, to: '3 de Agosto' },

  // Weekdays + Numbers
  { from: /Lunes 21/g, to: 'Lunes 3' },
  { from: /LUNES 21/g, to: 'LUNES 3' },
  { from: /Lun 21/g, to: 'Lun 3' },
  
  { from: /Domingo 20/g, to: 'Domingo 2' },
  { from: /DOMINGO 20/g, to: 'DOMINGO 2' },
  { from: /Dom 20/g, to: 'Dom 2' },
  
  { from: /Martes 22/g, to: 'Martes 4' },
  { from: /MARTES 22/g, to: 'MARTES 4' },
  { from: /Mar 22/g, to: 'Mar 4' },

  // Special typos found in files
  { from: /Viernes 21 Julil/g, to: 'Lunes 3 de Agosto' },
  { from: /Lunes 21 Julil/g, to: 'Lunes 3 de Agosto' },
  { from: /Lun 211 Jul/g, to: 'Lunes 3 de Agosto' },
  { from: /211 Abr/g, to: '3 Ago' },
  { from: /Domingo 205 Mar/g, to: 'Lunes 3 de Agosto' },
  { from: /Domingo 205 Lun 21026/g, to: 'Lunes 3 Agosto 2026' },
  
  { from: /hasSeenCautionMar03/g, to: 'hasSeenCautionAug03' },
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
