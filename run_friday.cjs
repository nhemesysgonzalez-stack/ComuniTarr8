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
        .replace(/Jue 12 Mar/g, 'Vie 13 Mar')
        .replace(/Jueves 12 Mar/ig, 'Viernes 13 Mar')
        .replace(/Jueves 12/ig, 'Viernes 13')
        .replace(/jueves 12/ig, 'viernes 13')
        .replace(/Hoy jueves/ig, 'Hoy viernes')
        .replace(/este jueves/ig, 'este viernes')
        .replace(/del jueves/ig, 'del viernes')
        .replace(/el jueves/ig, 'el viernes')
        .replace(/Jueves,/ig, 'Viernes,')
        .replace(/jueves,/ig, 'viernes,')
        .replace(/Semana 11 · Jue 12 Mar/g, 'Semana 11 · Vie 13 Mar')
        .replace(/Hoy Jueves 12 Mar:\\n\\u2022 10:00h \\u2014 Feria de Empleo Local\\n\\u2022 17:00h \\u2014 Taller de Entrevistas\\n\\nMañana Viernes:\\n\\u2022 09:00h \\u2014 Orientación Laboral TGN/g, 'Hoy Viernes 13 Mar:\\n\\u2022 09:00h \\u2014 Orientación Laboral TGN\\n\\u2022 18:00h \\u2014 Tarde de puertas abiertas\\n\\nMañana Sábado:\\n\\u2022 10:00h \\u2014 Mercadillo Barrio')
        .replace(/jueves despejado/g, 'viernes soleado')
        .replace(/jueves/g, 'viernes')
        .replace(/Jueves/g, 'Viernes')
        .replace(/JUEVES/g, 'VIERNES')

    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        reps++;
    }
});
console.log(`Updated ${reps} files`);
