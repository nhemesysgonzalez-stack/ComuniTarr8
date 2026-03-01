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

const dirs = ["C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/pages", "C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/components", "C:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/services"];

const replacements = [
    { from: /Sábado 28 de/g, to: "Domingo 1 de" },
    { from: /sábado 28 de/g, to: "domingo 1 de" },
    { from: /Sábado 28/g, to: "Domingo 1" },
    { from: /sábado 28/g, to: "domingo 1" },
    { from: /28 de Febrero/g, to: "1 de Marzo" },
    { from: /28 de febrero/g, to: "1 de marzo" },
    { from: /28\/02\/2026/g, to: "01/03/2026" },
    { from: /sábado, 28/g, to: "domingo, 1" },
    { from: /Sábado, 28/g, to: "Domingo, 1" },
    { from: /21 días/g, to: "20 días" },
    { from: /HOY SÁBADO/g, to: "HOY DOMINGO" },
    { from: /Hoy sábado/g, to: "Hoy domingo" },
    { from: /hoy sábado/g, to: "hoy domingo" },
    { from: /28 Feb/g, to: "1 Mar" },
    { from: /28 de feb/gi, to: "1 de mar" },
    { from: /sábado/g, to: "domingo" },
    { from: /Sábado/g, to: "Domingo" },
    { from: /SÁBADO/g, to: "DOMINGO" }
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
