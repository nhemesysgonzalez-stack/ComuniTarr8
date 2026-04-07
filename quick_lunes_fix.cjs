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
    { from: /Hoy Lunes 06/g, to: "Hoy Martes 07" },
    { from: /hoy Lunes 06/g, to: "hoy Martes 07" },
    { from: /Lunes 06 Abr/g, to: "Martes 07 Abr" },
    { from: /HOY LUNES/g, to: "HOY MARTES" },
    { from: /Hoy Lunes/g, to: "Hoy Martes" },
    { from: /Hoy lunes/g, to: "Hoy martes" },
    { from: /Lunes/g, to: "Martes" },
    { from: /lunes/g, to: "martes" },
    { from: /LUNES/g, to: "MARTES" },
    { from: /lun-23/g, to: "mar-07" }
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
        console.log(`Updated Lunes to Martes in: ${filePath}`);
        filesChangedCount++;
    }
}

console.log(`Done. Changed Lunes to Martes in ${filesChangedCount} files. Please verify.`);
