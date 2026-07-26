<div align="center">

# 🧰 Herramientas para Emprendedores

### Suite web gratuita para la gestión cotidiana de emprendimientos

[![Demo](https://img.shields.io/badge/Demo-economiasocial.sachadev.me-0B6E4F?style=for-the-badge)](https://economiasocial.sachadev.me)
![PWA](https://img.shields.io/badge/PWA-Offline-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

</div>

**Herramientas para Emprendedores** es una aplicación web progresiva creada para acompañar a emprendedores de la economía social en tareas concretas de gestión, comercialización y comunicación.

El proyecto se utiliza en actividades vinculadas con la **Dirección de Economía Social del Gobierno de Santa Fe** y prioriza tres criterios: acceso gratuito, funcionamiento desde el celular y privacidad de la información.

🔗 **Aplicación publicada:** [economiasocial.sachadev.me](https://economiasocial.sachadev.me)

---

## 🎯 Problema que resuelve

Muchos emprendimientos gestionan costos, precios, ventas y comunicación utilizando anotaciones dispersas o herramientas que requieren conocimientos previos. Esta suite reúne funciones frecuentes en una experiencia sencilla y sin necesidad de crear una cuenta.

- Los cálculos y registros se realizan en el navegador.
- Los datos permanecen en el dispositivo del usuario.
- La aplicación puede instalarse y utilizarse sin conexión después de la primera visita.
- Cada módulo puede utilizarse de manera independiente.

- **Calculadora de costos:** insumos, servicios, margen, punto de equilibrio, proyectos, autoguardado y PDF.
- **Guia de prompts IA:** biblioteca, busqueda, filtros, favoritos y prompts propios.
- **Combinador de colores:** armonias, contraste WCAG, simulacion de daltonismo, extraccion desde fotos y exportacion.
- **Herramientas digitales:** catalogo gratuito con busqueda, favoritos y recomendaciones.
- **Registro de ventas:** carrito, descuentos, medios de pago, ventas pendientes, snapshots contables, historial y resumen mensual en PDF.

## 🧩 Módulos

### 🧮 Calculadora de costos

Permite construir el costo de un producto y estimar un precio de venta sostenible.

- Insumos, materiales, mano de obra y producción por tanda.
- Costo unitario y precio sugerido.
- Margen de ganancia editable mediante slider e input numérico.
- Cálculo inverso del margen.
- Punto de equilibrio mensual y diario.
- Comparación de escenarios de precio.
- Guardado y autoguardado de proyectos.
- Búsqueda y paginación de proyectos guardados.
- Duplicación, exportación, importación y backup en JSON.
- Estado compartible mediante URL.
- Resumen descargable en PDF.
- Soporte para ARS, UYU, CLP, MXN y USD.

### 🛒 Registro de ventas

Utiliza los productos guardados en la calculadora para registrar operaciones reales.

- Carrito con uno o varios productos.
- Cantidades y precio final editable.
- Snapshot del costo, ingreso y ganancia al momento de la venta.
- Etiquetas para identificar clientes, ferias o canales.
- Medios de pago: efectivo, transferencia y tarjeta.
- Registro de ventas fiadas y total pendiente de cobro.
- Historial con filtros por hoy, semana, mes o período completo.
- Resumen por medio de pago, ingresos, costos y ganancias.
- Restauración de ventas eliminadas.
- Backup y restauración de la información.
- Exportación de resumen mensual en PDF.

### 🤖 Guía de prompts para IA

Biblioteca práctica para utilizar ChatGPT y otras herramientas de IA en tareas del emprendimiento.

- Más de 40 prompts organizados por categoría.
- Búsqueda y filtros en tiempo real.
- Favoritos guardados localmente.
- Copiado al portapapeles.
- Creación, edición y eliminación de prompts propios.
- Exportación e importación de prompts personalizados.
- Categorías para redes sociales, atención, finanzas, ventas y organización.

### 🎨 Combinador de colores

Ayuda a construir y evaluar paletas para una identidad visual.

- Rueda HSL interactiva mediante Canvas.
- Paletas complementarias, análogas, triádicas, split, cuadradas y monocromáticas.
- Verificación de contraste WCAG AA y AAA.
- Simulación de protanopía, deuteranopía y tritanopía.
- Extracción de colores desde una imagen.
- Guardado de paletas en el navegador.
- Compartir paletas mediante URL.
- Copiar valores HEX o variables CSS.
- Exportación de la paleta como imagen PNG.

### 📱 Herramientas de marketing digital

Directorio curado de recursos gratuitos para mejorar presencia digital y comercialización.

- Organización por categorías.
- Buscador y filtros persistentes.
- Recursos para diseño, contenido, redes sociales, comercio electrónico y productividad.
- Enlaces externos acompañados por una explicación de uso.

Prompts y herramientas usan datos editoriales estructurados y renderizadores en `catalog.js`, separados del comportamiento de `app.js`. Los modulos de calculadora y colores se dividen ademas por dominio y responsabilidad.

## 📲 Progressive Web App

La suite está preparada como PWA:

- instalación en Android, iOS y escritorio;
- shell disponible offline;
- estrategia `stale-while-revalidate` para archivos actualizables;
- caché versionada para evitar mantener versiones antiguas;
- aviso cuando existe una actualización;
- recursos principales precargados por el Service Worker `v2.2.0`.

No requiere tienda de aplicaciones ni un backend para funcionar.

No hay sincronizacion entre dispositivos. Para trasladar o proteger los datos se debe descargar y restaurar el archivo de backup.

## 🔐 Privacidad

La aplicación está diseñada con un enfoque local-first:

- no solicita registro ni inicio de sesión;
- no almacena información de usuarios en una base de datos remota;
- proyectos, ventas, prompts y paletas permanecen en `localStorage`;
- los backups se generan en el dispositivo;
- las estadísticas se recopilan con GoatCounter sin cookies publicitarias;
- no se crean perfiles de seguimiento entre sitios.

La política completa está disponible en [economiasocial.sachadev.me/privacidad.html](https://economiasocial.sachadev.me/privacidad.html).


## Arquitectura del codigo

El sitio es estatico, sin backend, framework ni proceso de build. Los scripts se cargan con `defer` respetando este orden: contratos compartidos, dominio del modulo y coordinadores de interfaz.

### Contratos compartidos

- `AppStorage`: unica puerta de acceso a localStorage y backups.
- `AppMigrations`: normalizacion versionada y no destructiva de datos historicos.
- `AppFormat`: moneda, fechas y texto seguro para HTML.
- `AppUI`: portapapeles, mensajes breves y slugs.
- `AppCosting`: costos, precios, margen y punto de equilibrio usados por calculadora y ventas.
- `AppColor`: conversiones, armonias, contraste y simulacion visual.
- `AppSales`: carrito, descuentos, snapshots y pagos parciales sin depender del DOM.

El registro de ventas reutiliza proyectos mediante `AppStorage` y calcula sus snapshots con `AppCosting`, evitando formulas duplicadas.
## 🛠️ Stack

| Área | Tecnología |
|---|---|
| Interfaz | HTML5, CSS3 y JavaScript vanilla |
| Persistencia | `localStorage` y archivos JSON |
| Gráficos y exportación | Canvas API, jsPDF |
| PWA | Service Worker y Web App Manifest |
| Accesibilidad visual | Cálculos de contraste WCAG y simulación de daltonismo |
| Analytics | GoatCounter |
| Testing | Playwright |
| Deploy | Vercel |

El proyecto no utiliza framework frontend ni proceso de build para la aplicación principal.

---

## Estructura principal

```text
/
|-- index.html
|-- styles.css
|-- privacidad.html
|-- shared/
|   |-- base.css
|   |-- migrations.js
|   |-- storage.js
|   |-- format.js
|   |-- ui.js
|   `-- costing.js
|-- sw.js
|-- pwa.js
|-- backup.js
|-- analytics.js
|-- modules/
|   |-- calculadora/
|   |   |-- state.js
|   |   |-- app.js
|   |   |-- projects.js
|   |   `-- pdf.js
|   |-- registrodeventas/
|   |   |-- app.js
|   |   |-- history.js
|   |   `-- pdf.js
|   |-- combinadordecolores/
|   |   |-- color-domain.js
|   |   |-- picker.js
|   |   |-- image-tools.js
|   |   |-- exports.js
|   |   `-- app.js
|   |-- guiadeprompts/
|   |   |-- catalog.js
|   |   `-- app.js
|   `-- herramientasdigitales/
|       |-- catalog.js
|       `-- app.js
`-- tests/
    |-- calculadora.spec.js
    |-- registrodeventas.spec.js
    |-- storage.spec.js
    |-- domain.spec.js
    `-- smoke.spec.js
```

Cada modulo mantiene su `index.html` y `styles.css`. Los archivos `catalog.js` contienen marcado editorial, no reglas de negocio.
## Ejecucion local

```bash
git clone https://github.com/LeandroMelchiori/herramientas_para_emprendedores.git
cd herramientas_para_emprendedores
npm install
npm run serve
```

Abrir `http://localhost:3000`. Se requiere HTTP para que funcionen Service Worker y rutas.
## Pruebas

```bash
npm test
```

Playwright cubre 16 casos sobre:

- carga sin errores de los cinco modulos;
- autoguardado y proyectos de la calculadora;
- costos, margen, punto de equilibrio y precio manual;
- carrito, snapshots y ventas pendientes;
- backup actual y compatibilidad con formatos antiguos;
- conversiones, armonias y contraste de colores;
- montaje de los catalogos editoriales.

Las pruebas funcionales bloquean el Service Worker. El precache y la apertura offline se validan por separado.
## ☁️ Deploy

La aplicación se publica como sitio estático en Vercel. `vercel.json` controla los headers de caché y evita que el navegador conserve versiones antiguas del Service Worker o del manifest.

Cada despliegue actualiza la versión de caché para que la PWA reciba los cambios sin perder la información almacenada localmente.

---

## Criterios para proximas mejoras

- Mantener reglas puras fuera del DOM.
- Usar `AppStorage`, `AppCosting`, `AppFormat` y `AppUI` antes de duplicar funciones.
- Editar prompts y herramientas en sus archivos `catalog.js`.
- Agregar comentarios breves solo cuando expliquen una decision no evidente.
- Actualizar `PRECACHE` y `VERSION` al agregar archivos propios.
- Ejecutar `npm test` antes de integrar una rama.
## Autor

Desarrollado por **Leandro Sacha Melchiori**.

- [GitHub](https://github.com/LeandroMelchiori)
- [LinkedIn](https://www.linkedin.com/in/leandromelchiori-developer/)


## Compatibilidad de datos

La version 3 del contrato mantiene las claves historicas de localStorage. Las migraciones completan campos opcionales, conservan propiedades desconocidas y no sobrescriben la base si detectan registros irreconocibles. Los backups 1.x y 2.0 siguen siendo restaurables; los nuevos backups se exportan como version 3.0.

Los eventos de interfaz se enlazan desde JavaScript mediante listeners y delegacion. Los modulos grandes separan estilos por dominio (proyectos e historial) sin proceso de build. La prueba `tests/pwa-assets.spec.js` impide agregar recursos locales sin incluirlos en el precache offline.
