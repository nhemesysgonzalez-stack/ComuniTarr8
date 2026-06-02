const fs = require('fs');
const path = require('path');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath);
        } else if (stat.isDirectory() && name !== 'node_modules' && name !== '.git' && name !== '.vercel' && name !== 'dist') {
            walkSync(filePath, callback);
        }
    });
}

const replacements = [
    { from: /25 de Mayo/ig, to: "2 de Junio" },
    { from: /25 Mayo/ig, to: "2 Junio" },
    { from: /25 May/ig, to: "2 Jun" },
    { from: /Lunes 25/ig, to: "Martes 2" },
    { from: /LUNES 25/g, to: "MARTES 2" },
    { from: /Lun 25/ig, to: "Mar 2" },
    { from: /25-may/ig, to: "02-jun" },

    { from: /Domingo 24/ig, to: "Lunes 1" },
    { from: /DOMINGO 24/g, to: "LUNES 1" },
    { from: /Martes 26/ig, to: "Miércoles 3" },
    { from: /MARTES 26/g, to: "MIÉRCOLES 3" },

    { from: /Hoy Lunes/g, to: "Hoy Martes" },
    { from: /HOY LUNES/g, to: "HOY MARTES" },
    { from: /Ayer \(Domingo 24\)/ig, to: "Ayer (Lunes 1)" },

    { from: /2026-05-25/g, to: "2026-06-02" },
    { from: /2026-05-24/g, to: "2026-06-01" },
    { from: /2026-05-26/g, to: "2026-06-03" }
];

let filesChangedCount = 0;

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    replacements.forEach(r => {
        if (content.match(r.from)) {
            content = content.replace(r.from, r.to);
            hasChanges = true;
        }
    });

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated dates in: ${filePath}`);
        filesChangedCount++;
    }
}

walkSync(path.join(__dirname, 'components'), processFile);
walkSync(path.join(__dirname, 'pages'), processFile);

console.log(`Done. Updated dates in ${filesChangedCount} files.`);
