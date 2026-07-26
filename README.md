# Herramientas para Emprendedores

Suite gratuita de herramientas web para emprendedores de la economia social, desarrollada para la **Direccion de Economia Social - Ministerio de Igualdad y Desarrollo Humano, Gobierno de Santa Fe, Argentina**.

**Sitio:** [economiasocial.sachadev.me](https://economiasocial.sachadev.me)

## Modulos

- **Calculadora de costos:** insumos, servicios, margen, punto de equilibrio, proyectos, autoguardado y PDF.
- **Guia de prompts IA:** biblioteca, busqueda, filtros, favoritos y prompts propios.
- **Combinador de colores:** armonias, contraste WCAG, simulacion de daltonismo, extraccion desde fotos y exportacion.
- **Herramientas digitales:** catalogo gratuito con busqueda, favoritos y recomendaciones.
- **Registro de ventas:** carrito, descuentos, medios de pago, ventas pendientes, snapshots contables, historial y resumen mensual en PDF.

La calculadora y el registro de ventas comparten los proyectos guardados. Cada venta conserva un snapshot del costo y el precio del momento para que el historial no cambie al editar un producto.

## Arquitectura

El sitio sigue siendo estatico, sin backend, framework ni proceso de build. La modularizacion separa estructura, presentacion y comportamiento:

```text
/
|-- index.html
|-- styles.css
|-- privacidad.html
|-- privacidad.css
|-- shared/
|   |-- base.css          # Accesibilidad y elementos comunes
|   |-- storage.js        # Contrato unico de localStorage y backups
|   `-- format.js         # Moneda, fechas y escape de HTML
|-- backup.js             # Backup completo y recordatorio semanal
|-- pwa.js                # Registro e instalacion PWA
|-- analytics.js          # GoatCounter
|-- sw.js                 # Cache offline versionada
`-- modules/
    |-- calculadora/
    |   |-- index.html
    |   |-- styles.css
    |   |-- app.js        # Estado, calculos e interfaz
    |   |-- projects.js   # Proyectos, restauracion y vaciado
    |   `-- pdf.js        # Exportacion PDF
    |-- registrodeventas/
    |   |-- index.html
    |   |-- styles.css
    |   |-- app.js        # Productos, carrito y venta actual
    |   |-- history.js    # Historial, filtros, pagos y restauracion
    |   `-- pdf.js        # Resumen mensual PDF
    |-- guiadeprompts/
    |-- combinadordecolores/
    `-- herramientasdigitales/
```

Los tres ultimos modulos usan el mismo esquema simple: `index.html`, `styles.css` y `app.js`.

## Persistencia y backup

Los datos se guardan solo en el navegador del usuario mediante `localStorage`. `shared/storage.js` centraliza las claves y evita que cada modulo implemente su propio formato.

El backup completo incluye:

- proyectos y borrador de la calculadora;
- historial de ventas;
- favoritos y prompts propios;
- estado y paletas de colores;
- favoritos y filtros de herramientas digitales.

No hay sincronizacion entre dispositivos. Para trasladar o proteger los datos se debe descargar y restaurar el archivo de backup.

## PWA y privacidad

- Instalable en celular y escritorio.
- Navegacion offline despues de la primera carga.
- Assets propios precargados y cacheados por version.
- GoatCounter para estadisticas anonimas sin cookies.
- Sin cuentas ni recoleccion de contenido ingresado por el usuario.

## Desarrollo

Requiere Node.js solo para el servidor local y las pruebas; la aplicacion desplegada no usa npm.

```bash
npm install
npm run serve
npm test
```

Las pruebas Playwright cubren carga sin errores de los modulos, autoguardado de insumos, recuperacion de proyectos, carrito, snapshot contable y ventas con sena.

## Deploy

Vercel publica el sitio directamente desde los archivos estaticos. Al cambiar paginas o assets:

1. Agregarlos a `PRECACHE` en `sw.js` si deben funcionar offline.
2. Incrementar `VERSION` en `sw.js`.
3. Ejecutar `npm test`.
4. Hacer push de la rama aprobada.

## Autor

**Leandro Sacha Melchiori**

- [LinkedIn](https://www.linkedin.com/in/leandromelchiori-developer/)
- [Instagram](https://www.instagram.com/sacha.melchiori/)
