import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('site');
const destPublic = path.resolve('public');
const destApiPublic = path.resolve('api/public');

console.log('📦 Preparando arquivos estáticos para o deploy na Vercel...');

[destPublic, destApiPublic].forEach(dest => {
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
    }
    fs.cpSync(srcDir, dest, { recursive: true });
});

console.log('✅ Pastas public/ e api/public/ geradas com sucesso a partir de site/!');
