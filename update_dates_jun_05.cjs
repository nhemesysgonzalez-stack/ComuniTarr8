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
    { from: /2 de Junio/ig, to: "5 de Junio" },
    { from: /2 Junio/ig, to: "5 Junio" },
    { from: /2 Jun/ig, to: "5 Jun" },
    { from: /Martes 2/ig, to: "Viernes 5" },
    { from: /MARTES 2/g, to: "VIERNES 5" },
    { from: /Mar 2/ig, to: "Vie 5" },
    { from: /02-jun/ig, to: "05-jun" },

    { from: /Lunes 1/ig, to: "Jueves 4" },
    { from: /LUNES 1/g, to: "JUEVES 4" },
    { from: /Miércoles 3/ig, to: "Sábado 6" },
    { from: /MIÉRCOLES 3/g, to: "SÁBADO 6" },

    { from: /Hoy Martes/ig, to: "Hoy Viernes" },
    { from: /HOY MARTES/g, to: "HOY VIERNES" },
    { from: /Ayer \(Lunes 1\)/ig, to: "Ayer (Jueves 4)" },
    { from: /este martes/ig, to: "este viernes" },
    { from: /buen martes/ig, to: "buen viernes" },

    { from: /2026-06-02/g, to: "2026-06-05" },
    { from: /2026-06-01/g, to: "2026-06-04" },
    { from: /2026-06-03/g, to: "2026-06-06" }
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
