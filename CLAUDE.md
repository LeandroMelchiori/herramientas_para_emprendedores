# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Suite de herramientas web gratuitas para emprendedores de la economía social, desarrollada para la **Dirección de Economía Social — Ministerio de Igualdad y Desarrollo Humano, Gobierno de Santa Fe, Argentina**.

App en uso real: [economiasocial.sachadev.me](https://economiasocial.sachadev.me)

## Stack y arquitectura

**Sitio 100% estático — sin build, sin frameworks, sin dependencias npm.**

- Vanilla HTML5 / CSS3 / JavaScript (todo inline dentro de cada `index.html`)
- PWA con Service Worker (`sw.js`) y Web App Manifest (`manifest.json`)
- localStorage para persistencia de datos del usuario (no hay backend ni base de datos)
- jsPDF (CDN) para exportar PDF en el cliente — solo en `modules/calculadora/`
- GoatCounter para analytics anónimos (sin cookies)
- Deploy automático en Vercel al hacer push

## Comandos de desarrollo

No hay build ni servidor de desarrollo requerido. Para previsualizar localmente:

```bash
# Cualquier servidor HTTP estático sirve (el Service Worker necesita HTTP, no file://)
npx serve .
# o
python3 -m http.server 8080
```

Para desplegar: hacer push al repositorio. Vercel detecta el cambio y despliega automáticamente.

## Estructura de módulos

```
/
├── index.html                  # Landing page con acceso a los 4 módulos
├── privacidad.html             # Política de privacidad
├── sw.js                       # Service Worker (caché offline)
├── pwa.js                      # Registro del SW + botón de instalación PWA
├── analytics.js                # GoatCounter — compartido por todas las páginas
├── manifest.json               # Web App Manifest
├── vercel.json                 # Headers de caché y CORS
├── assets/                     # Imágenes e íconos institucionales
└── modules/
    ├── calculadora/            # Calculadora de costos con PDF, escenarios y localStorage
    ├── guiadeprompts/          # Biblioteca de prompts IA con favoritos y prompts propios
    ├── combinadordecolores/    # Paletas de color con Canvas API y simulación de daltonismo
    └── herramientasdigitales/  # Recursos de marketing digital
```

Cada módulo es **autocontenido**: CSS y JS están inline en su `index.html`. Algunos módulos tienen un archivo de datos separado (ej. `guiadeprompts.html`, `combinadordecolores.html`) que contiene la biblioteca de contenidos.

## Decisiones de diseño clave

**Todo inline, sin archivos externos propios**: CSS y JS viven dentro del `<style>` y `<script>` de cada `index.html` del módulo. Esto simplifica el deploy y elimina dependencias entre archivos, a costa de no compartir estilos entre módulos.

**Caché del Service Worker versionada**: al hacer un deploy con cambios, hay que incrementar `VERSION` en `sw.js` (actualmente `v1.0.1`). Esto invalida las caches `app-${VERSION}` y `runtime-${VERSION}` y fuerza la descarga de assets actualizados en todos los clientes.

**Datos en archivos `.html` separados**: los módulos `guiadeprompts`, `combinadordecolores` y `herramientasdigitales` cargan su contenido (prompts, paletas, recursos) desde un archivo `.html` hermano mediante `fetch()`. Esto permite editar el contenido sin tocar la lógica del módulo.

**Paleta institucional**: el sistema de colores sigue la identidad del Gobierno de Santa Fe con variables CSS en `:root`. El gradiente institucional va de naranja → magenta → violeta (`#F2A33B` → `#E85D3A` → `#D5306E` → `#6B3FA0`).

**Persistencia solo local**: localStorage es la única forma de guardar datos del usuario (proyectos de calculadora, prompts favoritos, paletas guardadas). No existe sincronización entre dispositivos ni autenticación.

## Analytics

`analytics.js` expone la función global `trackEvent(action, fields)` que envía eventos a GoatCounter. Úsala desde cualquier módulo para registrar interacciones relevantes (copiar prompt, exportar PDF, guardar paleta, etc.). No trackear datos personales ni contenido sensible.

## Deploy y caché

- `sw.js` y `manifest.json` se sirven sin caché (`must-revalidate`) para que los clientes siempre detecten actualizaciones.
- Los íconos en `/assets/icons/` son `immutable` con 1 año de caché. Si se cambia un ícono, hay que cambiar su nombre.
- Al agregar nuevas páginas o assets al precache, incluirlos en el array `PRECACHE` de `sw.js`.
