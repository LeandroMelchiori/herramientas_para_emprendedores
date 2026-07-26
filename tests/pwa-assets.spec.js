const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('el precache incluye todos los recursos locales declarados por los HTML', async () => {
  const root = path.resolve(__dirname, '..');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const htmlFiles = [
    'index.html',
    'privacidad.html',
    ...fs.readdirSync(path.join(root, 'modules'))
      .map((module) => `modules/${module}/index.html`)
      .filter((file) => fs.existsSync(path.join(root, file))),
  ];
  const missing = new Set();

  htmlFiles.forEach((file) => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)) {
      const asset = match[1];
      if (asset === '/' || asset.startsWith('/modules/') && asset.endsWith('/')) continue;
      if (!sw.includes(`'${asset}'`)) missing.add(asset);
    }
  });

  expect([...missing], `Faltan recursos en PRECACHE: ${[...missing].join(', ')}`).toEqual([]);
});
