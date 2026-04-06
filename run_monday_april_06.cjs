const fs = require("fs");
const path = require("path");

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        if (fs.existsSync(filePath)) {
            var stat = fs.statSync(filePath);
            if (stat.isFile() && (filePath.endsWith(".tsx") || filePath.endsWith(".ts"))) {
                callback(filePath, stat);
            } else if (stat.isDirectory() && name !== "node_modules" && name !== "dist") {
                walkSync(filePath, callback);
            }
        }
    });
}

const dirs = ["C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/pages", "C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/components"];

const replacements = [
    { from: /Jueves 02 de Abril/g, to: "Lunes 06 de Abril" },
    { from: /jueves 02 de abril/g, to: "lunes 06 de abril" },
    { from: /Jueves 02 Abr/g, to: "Lunes 06 Abr" },
    { from: /Jueves 02/g, to: "Lunes 06" },
    { from: /jueves 02/g, to: "lunes 06" },
    { from: /Jue 02/g, to: "Lun 06" },
    { from: /jue 02/g, to: "lun 06" },
    { from: /02 de Abril/ig, to: "06 de Abril" },
    { from: /02\/04\/2026/g, to: "06/04/2026" },
    { from: /HOY JUEVES/ig, to: "HOY LUNES" },
    { from: /Hoy jueves/g, to: "Hoy lunes" },
    { from: /Hoy Jueves/g, to: "Hoy Lunes" },
    { from: /hoy jueves/g, to: "hoy lunes" },
    { from: /este jueves/g, to: "este lunes" },
    { from: /del jueves/g, to: "del lunes" },
    { from: /el jueves/g, to: "el lunes" },
    { from: /Jueves,/ig, to: 'Lunes,' },
    { from: /jueves,/ig, to: 'lunes,' },
    { from: /Mañana Viernes/g, to: "Mañana Martes" }
];

let updatedFiles = 0;

dirs.forEach(dir => {
    walkSync(dir, function (filePath) {
        let content = fs.readFileSync(filePath, "utf8");
        let modified = content;
        replacements.forEach(r => {
            modified = modified.replace(r.from, r.to);
        });
        if (content !== modified) {
            fs.writeFileSync(filePath, modified, "utf8");
            console.log("Updated dates in: " + filePath);
            updatedFiles++;
        }
    });
});

console.log("Updated " + updatedFiles + " files with general date replacements.");
