const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'venuevista-frontend');
const masterHtml = path.join(frontendDir, 'index.html');

const routes = [
    'events',
    'events/categories',
    'events/music',
    'events/technology',
    'events/workshops',
    'events/sports',
    'events/conferences',
    'events/theatre',
    'events/all',
    'venues',
    'venues/categories',
    'venues/banquet-halls',
    'venues/auditoriums',
    'venues/conference-centres',
    'venues/convention-halls',
    'venues/outdoor-lawns',
    'venues/party-venues',
    'venues/all'
];

console.log('Generating route entrypoints for static Python HTTP server...');
const content = fs.readFileSync(masterHtml, 'utf-8');

routes.forEach(route => {
    const routeDir = path.join(frontendDir, route);
    if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
    }
    const destFile = path.join(routeDir, 'index.html');
    fs.writeFileSync(destFile, content, 'utf-8');
    console.log(`✅ Synchronized: ${route}/index.html`);
});

console.log('All 18 route entrypoints generated successfully.');
