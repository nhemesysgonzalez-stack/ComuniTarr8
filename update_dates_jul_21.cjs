const fs = require('fs');
const path = require('path');

// ============================================================
//  COMUNITARR - Actualización de fechas a: LUNES 21 de Julio 2026
//  Generado: 2026-07-21
// ============================================================

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath);
        } else if (stat.isDirectory() && name !== 'node_modules' && name !== '.git' && name !== '.vercel' && name !== 'dist') {
            walkSync(filePath, callback);
        }
    });
}

const replacements = [
    // --- FECHAS NUMÉRICAS ISO ---
    { from: /2026-06-05/g, to: "2026-07-21" },
    { from: /2026-06-04/g, to: "2026-07-20" },  // ayer (domingo)
    { from: /2026-06-06/g, to: "2026-07-22" },  // mañana (martes)
    { from: /2026-06-30/g, to: "2026-07-21" },  // anuncios del 30 jun → hoy
    { from: /2026-06-03/g, to: "2026-07-21" },
    { from: /2026-06-01/g, to: "2026-07-21" },
    { from: /2026-06-02/g, to: "2026-07-21" },
    { from: /2026-05-11/g, to: "2026-07-21" },
    { from: /2026-05-16/g, to: "2026-07-21" },

    // --- DÍA DEL MES con número ---
    { from: /5 de Junio/ig, to: "21 de Julio" },
    { from: /5 Junio/ig, to: "21 Julio" },
    { from: /5 Jun/ig, to: "21 Jul" },
    { from: /05-jun/ig, to: "21-jul" },
    { from: /4 de Junio/ig, to: "20 de Julio" },
    { from: /6 de Junio/ig, to: "22 de Julio" },

    // --- DÍA DE LA SEMANA + número ---
    { from: /Viernes 5/ig, to: "Lunes 21" },
    { from: /VIERNES 5/g, to: "LUNES 21" },
    { from: /Jueves 4/ig, to: "Domingo 20" },
    { from: /JUEVES 4/g, to: "DOMINGO 20" },
    { from: /Sábado 6/ig, to: "Martes 22" },
    { from: /SÁBADO 6/g, to: "MARTES 22" },

    // --- HOY / AYER referencias de día ---
    { from: /Hoy Viernes/ig, to: "Hoy Lunes" },
    { from: /HOY VIERNES/g, to: "HOY LUNES" },
    { from: /Hoy Domingo/ig, to: "Hoy Lunes" },
    { from: /HOY DOMINGO/g, to: "HOY LUNES" },
    { from: /hoy domingo/ig, to: "hoy lunes" },
    { from: /Hoy Martes/ig, to: "Hoy Lunes" },
    { from: /HOY MARTES/g, to: "HOY LUNES" },

    { from: /Ayer \(Jueves 4\)/ig, to: "Ayer (Domingo 20)" },
    { from: /Ayer \(Lunes 1\)/ig, to: "Ayer (Domingo 20)" },
    { from: /Ayer \(Domingo\)/ig, to: "Ayer (Domingo 20)" },

    // --- DÍA DE LA SEMANA solo ---
    { from: /este viernes/ig, to: "este lunes" },
    { from: /buen viernes/ig, to: "buen lunes" },
    { from: /este domingo/ig, to: "este lunes" },
    { from: /este martes/ig, to: "este lunes" },

    // --- HOY + fecha literal en texto ---
    { from: /Hoy 5 de Junio/ig, to: "Hoy 21 de Julio" },
    { from: /HOY 5 DE JUNIO/ig, to: "HOY 21 DE JULIO" },

    // --- Mañana / Próximo día ---
    { from: /[Mm]añana [Ss]ábado/g, to: "Mañana Martes" },
    { from: /[Mm]añana [Ll]unes/g, to: "Mañana Martes" },

    // --- domingo → lunes para referencias de "hoy domingo" en clubs ---
    { from: /este domingo espectacular/ig, to: "este lunes espectacular" },
    { from: /tarde de [Dd]omingo/ig, to: "tarde de Lunes" },

    // --- Tiempo "Viernes" en tickers/alertas del Header ---
    { from: /Vie 5/ig, to: "Lun 21" },
    { from: /Mar 2/ig, to: "Lun 21" },
];

let filesChangedCount = 0;
let totalReplacements = 0;

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let fileReplacements = 0;

    replacements.forEach(r => {
        const matches = content.match(r.from);
        if (matches) {
            content = content.replace(r.from, r.to);
            hasChanges = true;
            fileReplacements += matches.length;
        }
    });

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ [${fileReplacements} cambios] ${path.basename(filePath)}`);
        filesChangedCount++;
        totalReplacements += fileReplacements;
    }
}

console.log('🗓️  COMUNITARR - Actualizando fechas a: LUNES 21 de JULIO 2026');
console.log('━'.repeat(60));

const dirs = ['components', 'pages'];
dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        walkSync(fullPath, processFile);
    }
});

// También procesar la raíz (App.tsx, constants.ts, etc.)
const rootFiles = fs.readdirSync(__dirname).filter(f => (f.endsWith('.tsx') || f.endsWith('.ts')) && !fs.statSync(path.join(__dirname, f)).isDirectory());
rootFiles.forEach(f => processFile(path.join(__dirname, f)));

console.log('━'.repeat(60));
console.log(`\n✅ Completado: ${filesChangedCount} archivos actualizados, ${totalReplacements} reemplazos en total.`);
console.log(`📅 Todos los módulos ahora reflejan: LUNES 21 de JULIO de 2026`);
