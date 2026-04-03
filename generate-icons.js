import fs from 'fs';
import sharp from 'sharp';

const input = 'src/assets/logo.svg';

async function generate() {
    try {
        await sharp(input).resize({width: 192, height: 192, background: {r:0,g:0,b:0,alpha:0}}).toFile('public/pwa-192x192.png');
        await sharp(input).resize({width: 512, height: 512, background: {r:0,g:0,b:0,alpha:0}}).toFile('public/pwa-512x512.png');
        await sharp(input).resize({width: 180, height: 180, background: {r:0,g:0,b:0,alpha:0}}).toFile('public/apple-touch-icon.png');
        console.log('Icons generated successfully.');
    } catch (e) {
        console.error(e);
    }
}

generate();
