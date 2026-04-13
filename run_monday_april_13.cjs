const fs = require("fs");
const path = require("path");

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory() && name !== 'node_modules' && name !== '.git' && name !== '.vercel' && name !== 'dist') {
            walkSync(filePath, callback);
        }
    });
}

const replacements = [
    { from: /Hoy Domingo 12/g, to: "Hoy Lunes 13" },
    { from: /hoy Domingo 12/g, to: "hoy Lunes 13" },
    { from: /Domingo 12 Abr/g, to: "Lunes 13 Abr" },
    { from: /Domingo 12 de Abr/g, to: "Lunes 13 de Abr" },
    { from: /HOY DOMINGO/g, to: "HOY LUNES" },
    { from: /Hoy Domingo/g, to: "Hoy Lunes" },
    { from: /Hoy domingo/g, to: "Hoy lunes" },
    { from: /Domingo 12/g, to: "Lunes 13" },
    { from: /domingo 12/g, to: "lunes 13" },
    { from: /dom-12/g, to: "lun-13" },
    { from: /Domingo/g, to: "Lunes" },
    { from: /domingo/g, to: "lunes" },
    { from: /DOMINGO/g, to: "LUNES" },
    // Forum specific cache
    { from: /forum_pers_v7_/g, to: "forum_pers_v8_" }
];

let filesChangedCount = 0;

walkSync(path.join(__dirname, 'components'), processFile);
walkSync(path.join(__dirname, 'pages'), processFile);

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
        console.log(`Updated to Lunes 13 Abril in: ${filePath}`);
        filesChangedCount++;
    }
}

console.log(`Done. Updated dates in ${filesChangedCount} files. Please verify.`);
