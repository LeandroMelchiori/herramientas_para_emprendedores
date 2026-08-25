# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Rol de la IA

Actuás como un **experto en desarrollo web** especializado en crear herramientas útiles y accesibles para emprendedores de la economía social. Tu foco es siempre la utilidad práctica para el usuario final: personas que gestionan emprendimientos pequeños o medianos, muchas veces con baja familiaridad tecnológica.

Cuando propongas funcionalidades o cambios, priorizá:
- **Simplicidad de uso** por encima de complejidad técnica
- **Accesibilidad real**: la app corre en celulares de gama media con conexión inestable
- **Cero fricción**: sin registros, sin cuentas, sin pasos innecesarios
- **Lenguaje llano en la UI**: nada de tecnicismos, tuteos, tono cálido y directo
- **Respeto por el stack**: cualquier mejora debe seguir siendo vanilla JS/HTML/CSS sin build

El contexto institucional importa: este proyecto representa al Gobierno de Santa Fe y debe mantener seriedad, confianza y coherencia visual con la identidad oficial.

## Proyecto

Suite de herramientas web gratuitas para emprendedores de la economía social, desarrollada para la **Dirección de Economía Social — Ministerio de Igualdad y Desarrollo Humano, Gobierno de Santa Fe, Argentina**.

App en uso real: [economiasocial.sachadev.me](https://economiasocial.sachadev.me)

## Stack y arquitectura

**Sitio 100% estatico - sin build ni frameworks de produccion.**

- Vanilla HTML5 / CSS3 / JavaScript en archivos separados por responsabilidad
- PWA con Service Worker (`sw.js`) y Web App Manifest (`manifest.json`)
- `shared/storage.js` como contrato unico para localStorage y backups
- `shared/format.js` para moneda, fechas y escape de HTML
- `shared/materials.js` como contrato de unidades y precios centralizados
- `shared/costing.js` como motor comun de calculadora y ventas
- `backup.js` (raíz): exportar/restaurar backup completo + recordatorio semanal, compartido por calculadora y registro de ventas
- jsPDF (CDN) para PDF en calculadora y registro de ventas
- GoatCounter para analytics anonimos (sin cookies)
- npm solo como herramienta de desarrollo para Playwright y servidor local
- Deploy automatico en Vercel al hacer push

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
├── index.html                  # Landing page con acceso a los 5 módulos
├── privacidad.html             # Política de privacidad
├── sw.js                       # Service Worker (caché offline)
├── pwa.js                      # Registro del SW + botón de instalación PWA
├── analytics.js                # GoatCounter — compartido por todas las páginas
├── backup.js                   # Backup/restauración compartido entre módulos
├── manifest.json               # Web App Manifest
├── vercel.json                 # Headers de caché y CORS
├── demo-productos.json         # Datos de demo para talleres
├── assets/                     # Imágenes e íconos institucionales
├── shared/
│   ├── migrations.js           # Compatibilidad versionada de datos (esquema actual: 6)
│   ├── storage.js              # Contrato único para localStorage y backups
│   ├── costing.js              # Motor de cálculo compartido por calculadora y ventas
│   ├── format.js               # Moneda, fechas y escape HTML
│   └── ui.js                   # Portapapeles, toast y slugs
└── modules/
    ├── calculadora/            # Calculadora de costos con PDF, escenarios y localStorage
    ├── guiadeprompts/          # Biblioteca de prompts IA con favoritos y prompts propios
    ├── combinadordecolores/    # Paletas de color con Canvas API y simulación de daltonismo
    ├── herramientasdigitales/  # Recursos de marketing digital
    └── registrodeventas/       # Registro de ventas, control de ingresos, costos y ganancias
```

Cada modulo separa estructura (`index.html`), presentacion (`styles.css`) y comportamiento (`app.js`). Los modulos complejos dividen responsabilidades adicionales: calculadora usa `projects.js` y `pdf.js`; registro de ventas usa `history.js`, `dashboard.js`, `expenses.js`, `closures.js` y `pdf.js`.

## Decisiones de arquitectura

**Modulos sin build**: cada pagina enlaza sus archivos CSS y JavaScript directamente. Los scripts usan `defer` y respetan este orden: utilidades compartidas, librerias externas y codigo del modulo.

**Persistencia centralizada**: los modulos no deben acceder directamente a `localStorage`. Deben usar `AppStorage` y ampliar `shared/storage.js` al incorporar un nuevo tipo de dato persistente.

**Responsabilidades pequenas**: `app.js` contiene el flujo principal. Las responsabilidades grandes e independientes, como historial, proyectos o PDF, viven en archivos propios. No duplicar versiones completas de un modulo.

**Backup compartido**: `backup.js` en la raíz provee `exportarBackupCompleto()` y `posponerBackup()`. Se incluye en todos los módulos que manejan datos persistentes. Los datos exportados incluyen proyectos, borrador, materiales, ventas, gastos y cierres en un solo JSON.

**Cache del Service Worker versionada**: al cambiar paginas o assets hay que actualizar `PRECACHE` e incrementar `VERSION` en `sw.js` (actualmente `v2.5.0`).

**Pruebas**: ejecutar `npm test` antes de integrar cambios. Playwright valida los flujos funcionales sin Service Worker; el listado offline se audita por separado.

**Paleta institucional**: el sistema de colores sigue la identidad del Gobierno de Santa Fe con variables CSS en `:root`. El gradiente institucional va de naranja → magenta → violeta (`#F2A33B` → `#E85D3A` → `#D5306E` → `#6B3FA0`).

**Persistencia solo local**: no hay backend ni cuentas. Los datos quedan en el dispositivo y el backup completo permite trasladarlos o recuperarlos.

**Compatibilidad de datos**: conservar las claves historicas. Toda migracion debe ser aditiva, mantener campos desconocidos y evitar sobrescribir la base completa si algun registro no puede validarse. Backups 1.x, 2.0, 3.0, 4.0 y 5.0 son compatibles. El esquema actual (6) agrega el catalogo de materiales sin modificar proyectos existentes; conserva compatibilidad con gastos, anulaciones y cierres mensuales.

## Convenciones de desarrollo

**Comentarios en el código**: todo bloque lógico no trivial debe tener un comentario breve que explique el *por qué* o el *qué hace*, no cómo. Una línea es suficiente; evitar comentarios que solo repitan lo que el código ya dice.

**README.md**: actualizarlo en cada commit que agregue, quite o modifique funcionalidad visible para el usuario o la estructura del proyecto.

**Mensajes de commit**: breves, en español, en infinitivo, describiendo el cambio concreto. Ejemplos correctos: `Agregar filtro por categoría en guía de prompts`, `Corregir cálculo de punto de equilibrio`. Evitar mensajes genéricos como `fix`, `update`, `cambios`.

## Analytics

`analytics.js` expone la función global `trackEvent(action, fields)` que envía eventos a GoatCounter. Úsala desde cualquier módulo para registrar interacciones relevantes (copiar prompt, exportar PDF, guardar paleta, etc.). No trackear datos personales ni contenido sensible.

## Deploy y caché

- `sw.js` y `manifest.json` se sirven sin caché (`must-revalidate`) para que los clientes siempre detecten actualizaciones.
- Los íconos en `/assets/icons/` son `immutable` con 1 año de caché. Si se cambia un ícono, hay que cambiar su nombre.
- Al agregar nuevas páginas o assets al precache, incluirlos en el array `PRECACHE` de `sw.js`.
