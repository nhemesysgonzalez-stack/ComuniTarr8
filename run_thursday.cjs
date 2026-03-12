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
        .replace(/Mié 11 Mar/g, 'Jue 12 Mar')
        .replace(/Miércoles 11 Mar/ig, 'Jueves 12 Mar')
        .replace(/Miércoles 11/ig, 'Jueves 12')
        .replace(/miércoles 11/ig, 'jueves 12')
        .replace(/Hoy miércoles/ig, 'Hoy jueves')
        .replace(/este miércoles/ig, 'este jueves')
        .replace(/del miércoles/ig, 'del jueves')
        .replace(/el miércoles/ig, 'el jueves')
        .replace(/Miércoles,/ig, 'Jueves,')
        .replace(/miércoles,/ig, 'jueves,')
        .replace(/Semana 11 · Mié 11 Mar/g, 'Semana 11 · Jue 12 Mar')
        .replace(/miércoles primaveral/ig, 'jueves despejado')
        // update services
        .replace(/Hoy Miércoles 11 Mar:\\n\\u2022 09:00h \\u2014 Talleres Tarragona Impulsa\\n\\u2022 18:00h \\u2014 Taller de Currículum\\n\\nMañana Jueves:\\n\\u2022 10:00h \\u2014 Feria de Empleo Local/g, 'Hoy Jueves 12 Mar:\\n\\u2022 10:00h \\u2014 Feria de Empleo Local\\n\\u2022 17:00h \\u2014 Taller de Entrevistas\\n\\nMañana Viernes:\\n\\u2022 09:00h \\u2014 Orientación Laboral TGN')

    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        reps++;
    }
});
console.log(`Updated ${reps} files`);
