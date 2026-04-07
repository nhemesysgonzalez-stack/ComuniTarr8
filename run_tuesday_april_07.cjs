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
    { from: /Hoy Jueves/g, to: "Hoy Martes" },
    { from: /hoy Jueves/g, to: "hoy Martes" },
    { from: /HOY JUEVES/g, to: "HOY MARTES" },
    { from: /jueves 02/gi, to: "martes 07" },
    { from: /Jueves 02/g, to: "Martes 07" },
    { from: /02 de Abril/g, to: "07 de Abril" },
    { from: /Domingo 29/g, to: "Martes 07" },
    { from: /jueves/gi, to: "martes" },
    { from: /Jueves/g, to: "Martes" },
    { from: /JUEVES/g, to: "MARTES" }
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
        console.log(`Updated dates in: ${filePath}`);
        filesChangedCount++;
    }
}

console.log(`Done. Changed dates in ${filesChangedCount} files. Please verify.`);
