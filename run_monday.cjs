const fs = require('fs');
const path = require('path');

const scanDir = (dir) => {
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            files = files.concat(scanDir(filepath));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            files.push(filepath);
        }
    });
    return files;
};

const files = [...scanDir('pages'), ...scanDir('components')];
let reps = 0;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content
        .replace(/Dom 8 Mar/ig, 'Lun 9 Mar')
        .replace(/Domingo 8 Mar/ig, 'Lunes 9 Mar')
        .replace(/Hoy domingo/ig, 'Hoy lunes')
        .replace(/este domingo/ig, 'este lunes')
        .replace(/del domingo/ig, 'del lunes')
        .replace(/el domingo/ig, 'el lunes')
        .replace(/💜 Ayudante 8M/g, '🛵 Repartidor/a Paquetería')
        .replace(/Lunes 9, 18:30/g, 'Hoy lunes, 18:30')
        .replace(/domingo nublado/ig, 'lunes lluvioso')
        .replace(/💜 ¡HOY! Día Internacional de la Mujer/g, '📝 Resumen del 8M y Manifestación')
        .replace(/8M de este domingo/g, '8M de ayer')
        .replace(/Hoy domingo, por el 8M/g, 'Después del 8M de ayer')
        .replace(/manifestación de hoy/ig, 'manifestación de ayer')
        .replace(/Domingo 8, /ig, 'Domingo 8, ')

    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        reps++;
    }
});
console.log(`Updated ${reps} files`);
