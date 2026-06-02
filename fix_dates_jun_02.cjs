const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'components'),
    path.join(__dirname, 'pages')
];

const patterns = [
    { from: /Lunes 2 Junio/gi, to: 'Martes 2 Junio' },
    { from: /hoy lunes/gi, to: 'hoy martes' },
    { from: /el lunes que viene/gi, to: 'la semana que viene' },
    { from: /este lunes/gi, to: 'este martes' },
    { from: /buen lunes/gi, to: 'buen martes' },
    { from: /Lun 2/g, to: 'Mar 2' }
];

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            patterns.forEach(p => {
                if (p.from.test(content)) {
                    content = content.replace(p.from, p.to);
                    changed = true;
                }
            });
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    });
}

dirs.forEach(processDir);
