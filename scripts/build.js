import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('site');
const destDir = path.resolve('public');

console.log('📦 Preparando arquivos estáticos para o deploy na Vercel...');

if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
}

fs.cpSync(srcDir, destDir, { recursive: true });

console.log('✅ Pasta public/ gerada com sucesso a partir de site/!');

