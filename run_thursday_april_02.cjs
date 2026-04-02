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
    { from: /Domingo 29 de Marzo/g, to: "Jueves 02 de Abril" },
    { from: /domingo 29 de marzo/g, to: "jueves 02 de abril" },
    { from: /Domingo 29 Mar/g, to: "Jueves 02 Abr" },
    { from: /Domingo 29/g, to: "Jueves 02" },
    { from: /domingo 29/g, to: "jueves 02" },
    { from: /Dom 29/g, to: "Jue 02" },
    { from: /dom 29/g, to: "jue 02" },
    { from: /29 de Marzo/ig, to: "02 de Abril" },
    { from: /29\/03\/2026/g, to: "02/04/2026" },
    { from: /HOY DOMINGO/ig, to: "HOY JUEVES" },
    { from: /Hoy domingo/g, to: "Hoy jueves" },
    { from: /Hoy Domingo/g, to: "Hoy Jueves" },
    { from: /hoy domingo/g, to: "hoy jueves" },
    { from: /este domingo/g, to: "este jueves" },
    { from: /del domingo/g, to: "del jueves" },
    { from: /el domingo/g, to: "el jueves" },
    { from: /Domingo,/ig, to: 'Jueves,' },
    { from: /domingo,/ig, to: 'jueves,' },
    { from: /Mañana Lunes/g, to: "Mañana Viernes" }
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
