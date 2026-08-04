const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'pages');
const componentsPath = path.join(__dirname, 'components');

const replacements = [
    { from: /2026-07-21/g, to: "2026-08-04" },
    { from: /2026-07-20/g, to: "2026-08-03" },
    { from: /2026-07-22/g, to: "2026-08-05" },
    { from: /21 de Julio/ig, to: "4 de Agosto" },
    { from: /20 de Julio/ig, to: "3 de Agosto" },
    { from: /22 de Julio/ig, to: "5 de Agosto" },
    { from: /21 Julio/ig, to: "4 Agosto" },
    { from: /20 Julio/ig, to: "3 Agosto" },
    { from: /22 Julio/ig, to: "5 Agosto" },
    { from: /Lunes 21/ig, to: "Martes 4" },
    { from: /Domingo 20/ig, to: "Lunes 3" },
    { from: /Martes 22/ig, to: "Miércoles 5" },
    { from: /Lun 21/ig, to: "Mar 4" },
    { from: /Dom 20/ig, to: "Lun 3" },
    { from: /Mar 22/ig, to: "Mié 5" },
    { from: /Lunes 30/ig, to: "Martes 4" },
    { from: /30 de junio/ig, to: "4 de agosto" },
    { from: /30 Junio/ig, to: "4 Agosto" },
    { from: /julio/g, to: "agosto" },
    { from: /Julio/g, to: "Agosto" },
    { from: /JULIO/g, to: "AGOSTO" },
    { from: /junio/g, to: "agosto" },
    { from: /Junio/g, to: "Agosto" },
    { from: /JUNIO/g, to: "AGOSTO" }
];

function processDirectory(dirPath) {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                processDirectory(filePath);
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let modified = false;

                replacements.forEach(replacement => {
                    if (content.match(replacement.from)) {
                        content = content.replace(replacement.from, replacement.to);
                        modified = true;
                    }
                });

                // Fix corrupted dates in EmergencyBroadcast if any remain
                if (file === 'EmergencyBroadcast.tsx') {
                    if (content.includes('Domingo 205 Mar') || content.includes('Domingo 205 Lun 21026')) {
                        content = content.replace(/Domingo 205 Mar/g, 'Martes 4');
                        content = content.replace(/Domingo 205 Lun 21026/g, 'Martes 4 de Agosto de 2026');
                        modified = true;
                    }
                }

                if (modified) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Updated dates in: ${file}`);
                }
            }
        });
    });
}

processDirectory(directoryPath);
processDirectory(componentsPath);
console.log('Date update script execution started.');
