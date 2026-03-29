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
    { from: /Jueves 26 de/g, to: "Domingo 29 de" },
    { from: /jueves 26 de/g, to: "domingo 29 de" },
    { from: /Jueves 26/g, to: "Domingo 29" },
    { from: /jueves 26/g, to: "domingo 29" },
    { from: /Jue 26/g, to: "Dom 29" },
    { from: /jue 26/g, to: "dom 29" },
    { from: /26 de Marzo/ig, to: "29 de Marzo" },
    { from: /26\/03\/2026/g, to: "29/03/2026" },
    { from: /HOY JUEVES/ig, to: "HOY DOMINGO" },
    { from: /Hoy jueves/g, to: "Hoy domingo" },
    { from: /Hoy Jueves/g, to: "Hoy Domingo" },
    { from: /hoy jueves/g, to: "hoy domingo" },
    { from: /este jueves/g, to: "este domingo" },
    { from: /del jueves/g, to: "del domingo" },
    { from: /el jueves/g, to: "el domingo" },
    { from: /Jueves,/ig, to: 'Domingo,' },
    { from: /jueves,/ig, to: 'domingo,' },
    { from: /Mañana Viernes/g, to: "Mañana Lunes" }
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
