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
    { from: /Lunes 23 de/g, to: "Martes 24 de" },
    { from: /lunes 23 de/g, to: "martes 24 de" },
    { from: /Lunes 23/g, to: "Martes 24" },
    { from: /lunes 23/g, to: "martes 24" },
    { from: /Lun 23/g, to: "Mar 24" },
    { from: /lun 23/g, to: "mar 24" },
    { from: /23 de Marzo/ig, to: "24 de Marzo" },
    { from: /23\/03\/2026/g, to: "24/03/2026" },
    { from: /HOY LUNES/ig, to: "HOY MARTES" },
    { from: /Hoy lunes/g, to: "Hoy martes" },
    { from: /hoy lunes/g, to: "hoy martes" },
    { from: /este lunes/g, to: "este martes" },
    { from: /Domingo 22 Mar/g, to: "Martes 24 Mar" }, // Fixing missed date in Services.tsx
    { from: /Domingo 22/g, to: "Martes 24" }, // Just in case
    { from: /Lunes 16 Mar/g, to: "Martes 24 Mar" }, // From Services.tsx "Lunes 16 Mar"
    { from: /Mañana Martes/g, to: "Hoy Martes" }
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
