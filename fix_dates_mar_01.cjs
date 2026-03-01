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
    // Global Date Fixes for Sunday Mar 1
    { from: /Sábado 28 de Febrero/g, to: "Domingo 1 de Marzo" },
    { from: /sábado 28 de febrero/g, to: "domingo 1 de marzo" },
    { from: /Sábado 28 Feb/g, to: "Domingo 1 Mar" },
    { from: /sábado 28 feb/gi, to: "domingo 1 mar" },
    { from: /Domingo 1 Feb/g, to: "Domingo 1 Mar" },
    { from: /domingo 1 feb/gi, to: "domingo 1 mar" },
    { from: /28 de Febrero/g, to: "1 de Marzo" },
    { from: /28\/02\/2026/g, to: "01/03/2026" },
    { from: /HOY SÁBADO/g, to: "HOY DOMINGO" },
    { from: /Hoy sábado/g, to: "Hoy domingo" },

    // Specific Fixes for inconsistent hardcoded dates
    { from: /JUEVES 25 FEBRERO/g, to: "DOMINGO 1 MARZO" },
    { from: /Jueves 25 Feb/gi, to: "Domingo 1 Mar" },
    { from: /Miércoles 25/gi, to: "Domingo 1" },
    { from: /Martes 24 Feb/g, to: "Martes 3 Mar" },
    { from: /Martes 17 Feb/g, to: "Domingo 1 Mar" }, // Old Carnival stuff
    { from: /Viernes de Ceniza/g, to: "Domingo de Cuaresma" },
    { from: /Quedan 20 días/g, to: "Quedan 18 días" },
    { from: /Viernes 12 Feb/g, to: "Domingo 1 Mar" }, // Used in Gemini simulated responses

    // Ensure all weekdays are Sunday today
    { from: /Viernes 27/gi, to: "Domingo 1" },
    { from: /viernes 27/gi, to: "domingo 1" },

    // Chat Simulation Tags/Comments
    { from: /Wednesday 1 Mar/g, to: "Sunday 1 Mar" },
    { from: /Mid-week energy/g, to: "Weekend morning vibe" },
    { from: /ecaudor de la semana/g, to: "final del fin de semana" },
    { from: /ecuador de la semana/g, to: "domingo de descanso" }
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
            console.log("Fixed dates in: " + filePath);
        }
    });
});
