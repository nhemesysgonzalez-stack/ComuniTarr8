const fs = require("fs");
const path = require("path");

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory() && name !== 'node_modules' && name !== '.git') {
            walkSync(filePath, callback);
        }
    });
}

const replacements = [
    { from: /Hoy Martes 07/g, to: "Hoy Jueves 09" },
    { from: /hoy Martes 07/g, to: "hoy Jueves 09" },
    { from: /Martes 07 Abr/g, to: "Jueves 09 Abr" },
    { from: /Martes 07 de Abr/g, to: "Jueves 09 de Abr" },
    { from: /HOY MARTES/g, to: "HOY JUEVES" },
    { from: /Hoy Martes/g, to: "Hoy Jueves" },
    { from: /Hoy martes/g, to: "Hoy jueves" },
    { from: /Martes/g, to: "Jueves" },
    { from: /martes/g, to: "jueves" },
    { from: /MARTES/g, to: "JUEVES" },
    { from: /mar-07/g, to: "jue-09" },
    // Forum specific cache
    { from: /forum_pers_v5_/g, to: "forum_pers_v6_" }
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
        console.log(`Updated to Jueves 09 Abril in: ${filePath}`);
        filesChangedCount++;
    }
}

console.log(`Done. Updated dates in ${filesChangedCount} files. Please verify.`);
