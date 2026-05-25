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
    // Forum & Stories dates
    { from: /Hoy Viernes 25/ig, to: "Hoy Lunes 25" },
    { from: /Ayer \(Jueves 23 - Post Sant Jordi\)/ig, to: "Ayer (Domingo 24)" },
    { from: /Jueves 23/ig, to: "Domingo 24" },
    { from: /JUEVES 23/g, to: "MARTES 26" },
    { from: /MIÉRCOLES 22/g, to: "LUNES 25" },
    { from: /MARTES 21/g, to: "DOMINGO 24" },
    { from: /Lunes 20/ig, to: "Viernes 22" },
    { from: /Lunes 4 May/ig, to: "Lunes 25 May" },
    { from: /Lunes 4 Mayo/ig, to: "Lunes 25 Mayo" },
    { from: /04-may/g, to: "25-may" },

    // Services / Dates
    { from: /1 de Mayo/ig, to: "25 de Mayo" },
    { from: /1 May/ig, to: "25 May" },
    { from: /Viernes 1/ig, to: "Lunes 25" },
    { from: /Vie 1/ig, to: "Lun 25" },
    { from: /HOY VIERNES/g, to: "HOY LUNES" },
    { from: /Hoy Viernes/g, to: "Hoy Lunes" },

    // Workshops
    { from: /Dom 26 Abr/g, to: "Lun 25 May" },
    { from: /Domingo 26 Abr/g, to: "Lunes 25 May" },

    // Other cases
    { from: /2026-04-\d{2}/g, to: "2026-05-25" },
    { from: /2026-05-04/g, to: "2026-05-25" },

    // Content fixes for coherence (Empleos only real jobs)
    // Removed specific content deletion since we will manually review Jobs later
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
