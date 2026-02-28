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

const dirs = ["C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/pages", "C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/components", "C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr"];

const replacements = [
    { from: /Viernes 27/g, to: "Sábado 28" },
    { from: /viernes 27/g, to: "sábado 28" },
    { from: /Viernes 27 de/g, to: "Sábado 28 de" },
    { from: /viernes 27 de/g, to: "sábado 28 de" },
    { from: /27 de Febrero/g, to: "28 de Febrero" },
    { from: /27 de febrero/g, to: "28 de febrero" },
    { from: /27\/02\/2026/g, to: "28/02/2026" },
    { from: /viernes, 27/g, to: "sábado, 28" },
    { from: /Viernes, 27/g, to: "Sábado, 28" },
    { from: /22 días/g, to: "21 días" },
    { from: /HOY VIERNES/g, to: "HOY SÁBADO" },
    { from: /Hoy viernes/g, to: "Hoy sábado" },
    { from: /hoy viernes/g, to: "hoy sábado" },
    { from: /27 Feb/g, to: "28 Feb" },
    { from: /27 de feb/gi, to: "28 de feb" },
    { from: /viernes/g, to: "sábado" },
    { from: /Viernes/g, to: "Sábado" },
    { from: /VIERNES/g, to: "SÁBADO" }
];

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
        }
    });
});
