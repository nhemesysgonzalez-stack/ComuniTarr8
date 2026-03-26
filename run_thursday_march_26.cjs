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
    { from: /Miércoles 25 de/g, to: "Jueves 26 de" },
    { from: /miércoles 25 de/g, to: "jueves 26 de" },
    { from: /Miércoles 25/g, to: "Jueves 26" },
    { from: /miércoles 25/g, to: "jueves 26" },
    { from: /Mié 25/g, to: "Jue 26" },
    { from: /mié 25/g, to: "jue 26" },
    { from: /25 de Marzo/ig, to: "26 de Marzo" },
    { from: /25\/03\/2026/g, to: "26/03/2026" },
    { from: /HOY MIÉRCOLES/ig, to: "HOY JUEVES" },
    { from: /Hoy miércoles/g, to: "Hoy jueves" },
    { from: /Hoy Miércoles/g, to: "Hoy Jueves" },
    { from: /hoy miércoles/g, to: "hoy jueves" },
    { from: /este miércoles/g, to: "este jueves" },
    { from: /del miércoles/g, to: "del jueves" },
    { from: /el miércoles/g, to: "el jueves" },
    { from: /Miércoles,/ig, to: 'Jueves,' },
    { from: /miércoles,/ig, to: 'jueves,' },
    { from: /Mañana Jueves/g, to: "Hoy Jueves" }
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
