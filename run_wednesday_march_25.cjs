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
    { from: /Martes 24 de/g, to: "Miércoles 25 de" },
    { from: /martes 24 de/g, to: "miércoles 25 de" },
    { from: /Martes 24/g, to: "Miércoles 25" },
    { from: /martes 24/g, to: "miércoles 25" },
    { from: /Mar 24/g, to: "Mié 25" },
    { from: /mar 24/g, to: "mié 25" },
    { from: /24 de Marzo/ig, to: "25 de Marzo" },
    { from: /24\/03\/2026/g, to: "25/03/2026" },
    { from: /HOY MARTES/ig, to: "HOY MIÉRCOLES" },
    { from: /Hoy martes/g, to: "Hoy miércoles" },
    { from: /Hoy Martes/g, to: "Hoy Miércoles" },
    { from: /hoy martes/g, to: "hoy miércoles" },
    { from: /este martes/g, to: "este miércoles" },
    { from: /del martes/g, to: "del miércoles" },
    { from: /el martes/g, to: "el miércoles" },
    { from: /Mañana Miércoles/g, to: "Hoy Miércoles" }
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
