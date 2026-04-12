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
    { from: /Hoy Jueves 09/g, to: "Hoy Domingo 12" },
    { from: /hoy Jueves 09/g, to: "hoy Domingo 12" },
    { from: /Jueves 09 Abr/g, to: "Domingo 12 Abr" },
    { from: /Jueves 09 de Abr/g, to: "Domingo 12 de Abr" },
    { from: /HOY JUEVES/g, to: "HOY DOMINGO" },
    { from: /Hoy Jueves/g, to: "Hoy Domingo" },
    { from: /Hoy jueves/g, to: "Hoy domingo" },
    { from: /Jueves 09/g, to: "Domingo 12" },
    { from: /jueves 09/g, to: "domingo 12" },
    { from: /jue-09/g, to: "dom-12" },
    { from: /Jueves/g, to: "Domingo" },
    { from: /jueves/g, to: "domingo" },
    { from: /JUEVES/g, to: "DOMINGO" },
    // Forum specific cache
    { from: /forum_pers_v6_/g, to: "forum_pers_v7_" },
    { from: /forum_pers_v5_/g, to: "forum_pers_v7_" }
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
        console.log(`Updated to Domingo 12 Abril in: ${filePath}`);
        filesChangedCount++;
    }
}

console.log(`Done. Updated dates in ${filesChangedCount} files. Please verify.`);
