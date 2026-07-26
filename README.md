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

---

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

---

## 📲 Progressive Web App

La suite está preparada como PWA:

- instalación en Android, iOS y escritorio;
- shell disponible offline;
- estrategia `stale-while-revalidate` para archivos actualizables;
- caché versionada para evitar mantener versiones antiguas;
- aviso cuando existe una actualización;
- recursos principales precargados por el Service Worker.

No requiere tienda de aplicaciones ni un backend para funcionar.

---

## 🔐 Privacidad

La aplicación está diseñada con un enfoque local-first:

- no solicita registro ni inicio de sesión;
- no almacena información de usuarios en una base de datos remota;
- proyectos, ventas, prompts y paletas permanecen en `localStorage`;
- los backups se generan en el dispositivo;
- las estadísticas se recopilan con GoatCounter sin cookies publicitarias;
- no se crean perfiles de seguimiento entre sitios.

La política completa está disponible en [economiasocial.sachadev.me/privacidad.html](https://economiasocial.sachadev.me/privacidad.html).

---

## 🧱 Arquitectura

```text
index.html
   │
   ├── Calculadora ──────────────┐
   ├── Registro de ventas ◄──────┤ localStorage compartido
   ├── Guía de prompts           │
   ├── Combinador de colores     │
   └── Herramientas digitales ───┘

Service Worker ─► caché offline y actualización de recursos
GoatCounter    ─► analítica anónima y eventos de uso
Vercel         ─► publicación estática y headers de caché
```

El registro de ventas lee los proyectos creados en la calculadora, lo que permite reutilizar costos y precios sin volver a cargar los productos.

---

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

## 📂 Estructura

```text
/
├── index.html
├── privacidad.html
├── manifest.json
├── sw.js
├── pwa.js
├── analytics.js
├── vercel.json
├── assets/
├── modules/
│   ├── calculadora/
│   ├── registrodeventas/
│   ├── guiadeprompts/
│   ├── combinadordecolores/
│   └── herramientasdigitales/
└── tests/
    └── registrodeventas.spec.js
```

---

## 🚀 Ejecución local

Al ser un sitio estático, puede abrirse mediante cualquier servidor HTTP local.

```bash
git clone https://github.com/LeandroMelchiori/herramientas_para_emprendedores.git
cd herramientas_para_emprendedores
python -m http.server 8000
```

Abrir `http://localhost:8000`.

> Se recomienda un servidor HTTP en lugar de abrir `index.html` directamente para que el Service Worker y las rutas funcionen correctamente.

---

## ✅ Pruebas

El repositorio incluye pruebas end-to-end con Playwright para los flujos principales del registro de ventas, entre ellos:

- reutilización de productos guardados por la calculadora;
- armado del carrito;
- registro por medio de pago;
- ventas fiadas;
- historial y resumen por período;
- visualización de ingresos pendientes de cobro.

Las pruebas se mantienen alineadas con la estructura real del DOM para detectar regresiones en los flujos de uso.

---

## ☁️ Deploy

La aplicación se publica como sitio estático en Vercel. `vercel.json` controla los headers de caché y evita que el navegador conserve versiones antiguas del Service Worker o del manifest.

Cada despliegue actualiza la versión de caché para que la PWA reciba los cambios sin perder la información almacenada localmente.

---

## Próximas mejoras

- Ampliar la cobertura end-to-end a la calculadora, prompts y combinador de colores.
- Incorporar exportaciones tabulares del historial de ventas.
- Mejorar herramientas de análisis mensual y comparación entre períodos.
- Agregar importación guiada y validación más detallada de backups.
- Continuar las pruebas de accesibilidad y uso en dispositivos de gama baja.

---

## Autor

Desarrollado por **Leandro Sacha Melchiori**.

- [GitHub](https://github.com/LeandroMelchiori)
- [LinkedIn](https://www.linkedin.com/in/leandromelchiori-developer/)
