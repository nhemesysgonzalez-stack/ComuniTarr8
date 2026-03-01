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
    { from: /Hoy Mié:/g, to: "Hoy Dom:" },
    { from: /HOY JUEVES/g, to: "HOY DOMINGO" },
    { from: /Hoy Jueves/g, to: "Hoy Domingo" },
    { from: /hoy jueves/g, to: "hoy domingo" },
    { from: /ABIERTO \(JUEVES\)/g, to: "CERRADO (DOMINGO)" },
    { from: /ABIERTO \(VIERNES\)/g, to: "CERRADO (DOMINGO)" },
    { from: /ABIERTO \(SÁBADO\)/g, to: "ABIERTO (DOMINGO)" },
    { from: /martes/g, to: "domingo" },
    { from: /Martes/g, to: "Domingo" },
    { from: /MARTES/g, to: "DOMINGO" },
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
            console.log("Final adjustments in: " + filePath);
        }
    });
});
