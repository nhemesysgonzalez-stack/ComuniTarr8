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
        .replace(/Lun 9 Mar/ig, 'Mar 10 Mar')
        .replace(/Lunes 9 Mar/ig, 'Martes 10 Mar')
        .replace(/Hoy lunes/ig, 'Hoy martes')
        .replace(/este lunes/ig, 'este martes')
        .replace(/del lunes/ig, 'del martes')
        .replace(/el lunes/ig, 'el martes')
        .replace(/lunes lluvioso/ig, 'martes soleado')
        .replace(/Lluvioso y 14ºC/ig, 'Soleado y 16ºC')
        .replace(/☔ Alerta Lluvia Intensa/g, '☀️ Tiempo Primaveral')
        .replace(/Protección Civil avisa de un frente de lluvias fuertes para la tarde de hoy lunes. Precaución en los desplazamientos./g, 'Día soleado en Tarragona con temperaturas de hasta 18ºC. Ideal para pasear.')
        .replace(/Inicio precipitación: 15:00h/g, 'Cielo despejado')
        .replace(/Riesgo inundación: Bajo/g, 'Viento: Flojo')
        .replace(/Recomendación: Evitar Riera/g, 'Recomendación: Disfrutar del día')
        .replace(/8M de ayer/g, '8M del domingo')
        .replace(/manifestación de ayer/ig, 'manifestación del domingo')
        .replace(/Resumen del 8M de ayer/ig, 'Resumen del 8M')
        .replace(/día de ayer/g, 'fin de semana')
        .replace(/Domingo 8 Mar/ig, 'Martes 10 Mar')
        .replace(/Domingo 8,/ig, 'Martes 10,')
        .replace(/Semana 10 · Dom 8 Mar/g, 'Semana 10 · Mar 10 Mar')

    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        reps++;
    }
});
console.log(`Updated ${reps} files`);
