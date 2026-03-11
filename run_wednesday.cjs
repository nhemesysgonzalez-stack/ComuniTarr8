const fs = require('fs');
const path = require('path');

const scanDir = (dir) => {
    let files = [];
    try {
        fs.readdirSync(dir).forEach(file => {
            const filepath = path.join(dir, file);
            if (fs.statSync(filepath).isDirectory()) {
                files = files.concat(scanDir(filepath));
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                files.push(filepath);
            }
        });
    } catch (e) {
        // directory might not exist
    }
    return files;
};

const dirsToScan = [
    'c:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/pages',
    'c:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/components',
    'c:/Users/KANZEN/Downloads/PROYECTOS APPS/copy-of-comunitarr/services'
];
let files = [];
dirsToScan.forEach(d => { files = files.concat(scanDir(d)) });

let reps = 0;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content
        .replace(/Mar 10 Mar/g, 'Mié 11 Mar')
        .replace(/Martes 10 Mar/ig, 'Miércoles 11 Mar')
        .replace(/Martes 10/ig, 'Miércoles 11')
        .replace(/martes 10/ig, 'miércoles 11')
        .replace(/Hoy martes/ig, 'Hoy miércoles')
        .replace(/este martes/ig, 'este miércoles')
        .replace(/del martes/ig, 'del miércoles')
        .replace(/el martes/ig, 'el miércoles')
        .replace(/Martes,/ig, 'Miércoles,')
        .replace(/martes,/ig, 'miércoles,')
        .replace(/martes soleado/ig, 'miércoles primaveral')
        .replace(/ Soleado y 16ºC/ig, ' Soleado y 17ºC')
        .replace(/Día soleado en Tarragona con temperaturas de hasta 18ºC. Ideal para pasear./g, 'Día soleado en Tarragona con temperaturas de hasta 19ºC. Ideal para actividades al aire libre.')
        .replace(/Semana 10 · Mié 11 Mar/g, 'Semana 11 · Mié 11 Mar') // ensure week is right
        .replace(/DOMINGO 8M/g, 'DÍA NORMAL')
        .replace(/Ofertas 8M/g, 'Ofertas Activas')
        // update services
        .replace(/Hoy Miércoles 11 Mar \(8M\)/g, 'Hoy Miércoles 11 Mar')
        .replace(/Hoy Martes 10 Mar \(8M\):\\n\\u2022 12:00h \\u2014 Lectura Manifiesto Pl. de la Font\\n\\u2022 18:00h \\u2014 Manifestación 8M \(Desde Imperial Tarraco\)\\n\\nMañana Lunes:\\n\\u2022 09:00h \\u2014 Talleres Tarragona Impulsa/g, 'Hoy Miércoles 11 Mar:\\n\\u2022 09:00h \\u2014 Talleres Tarragona Impulsa\\n\\u2022 18:00h \\u2014 Taller de Currículum\\n\\nMañana Jueves:\\n\\u2022 10:00h \\u2014 Feria de Empleo Local')

    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        reps++;
    }
});
console.log(`Updated ${reps} files`);
