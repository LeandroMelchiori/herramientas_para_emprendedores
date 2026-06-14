# Herramientas para Emprendedores

Suite de herramientas web gratuitas para emprendedores de la economía social, desarrollada para la **Dirección de Economía Social — Ministerio de Igualdad y Desarrollo Humano, Gobierno de Santa Fe, Argentina**.

> App en uso real por emprendedores de la economía social de Santa Fe.

🔗 **[Ver en vivo → economiasocial.sachadev.me](https://economiasocial.sachadev.me)**

---

## Módulos

### 🧮 Calculadora de Costos
Calculá el precio de venta de tus productos con margen, punto de equilibrio y resumen exportable.

- Cálculo de insumos, materiales y mano de obra por tanda de producción
- Slider de margen de ganancia con cálculo inverso
- Punto de equilibrio (unidades/mes y unidades/día)
- Comparativa de escenarios de precio
- Proyectos guardados en localStorage (guardar, cargar, duplicar)
- Compartir por link (estado codificado en URL)
- Exportar / importar proyectos en JSON
- Descarga en PDF
- Monedas: ARS, UYU, CLP, MXN, USD
- Autoguardado

### 🤖 Guía de Prompts IA
Biblioteca de prompts listos para usar con ChatGPT y otras IAs.

- +40 prompts organizados por categoría (redes sociales, atención al cliente, finanzas, etc.)
- Buscador en tiempo real
- Filtro por categoría (barra compacta colapsable)
- Favoritos guardados en localStorage
- **Mis Prompts**: creá, editá y eliminá tus propios prompts personalizados
- Exportar / importar prompts propios en JSON
- Copiar prompt al portapapeles con un clic
- Contadores dinámicos por categoría

### 🎨 Combinador de Colores
Encontrá la paleta perfecta para tu marca.

- Rueda de color HSL con selector interactivo (canvas)
- Paletas armónicas: complementario, análogo, triádico, split, cuadrado, monocromático
- Verificación de contraste WCAG (AA / AAA)
- Simulación de daltonismo (protanopía, deuteranopía, tritanopía)
- Guardar paletas en localStorage (hasta 12)
- Compartir paleta por URL
- Copiar HEX o variables CSS (`:root { --color: #HEX }`)
- Extraer colores desde una foto
- Exportar paleta como PNG (1080×1080)

### 📱 Herramientas de Marketing Digital
Recursos y herramientas gratuitas para crecer en redes sociales.

- Guías y recursos seleccionados para emprendedores
- Herramientas online gratuitas recomendadas

---

## Características técnicas

### PWA (Progressive Web App)
- Instalable en Android, iOS y escritorio (sin app store)
- Funciona **offline** — páginas servidas desde caché del Service Worker
- Con conexión lenta: carga instantánea desde caché + actualización en segundo plano (stale-while-revalidate)
- Caché por versión: cada deploy invalida la caché anterior automáticamente

### Analytics
- **GoatCounter** — estadísticas anónimas sin cookies ni datos personales
- No requiere banner de consentimiento (GDPR-friendly)
- Registra: visitas, dispositivo, país, navegador, referrer y eventos de uso
- Eventos personalizados: qué prompts se copian, qué paletas se guardan, qué exportaciones se hacen

### Privacidad
- Cero datos personales recolectados
- localStorage: datos guardados únicamente en el dispositivo del usuario
- Sin tracking entre sesiones ni perfiles de usuario
- [Política de privacidad](https://economiasocial.sachadev.me/privacidad.html)

---

## Stack

- **HTML5 / CSS3 / JavaScript** — vanilla, sin frameworks ni dependencias de build
- **localStorage** — persistencia local (paletas, prompts favoritos, prompts propios)
- **Canvas API** — rueda de color y exportación PNG
- **Service Worker** — caché offline y estrategia stale-while-revalidate
- **Web App Manifest** — instalación PWA
- **jsPDF** — generación de PDF en el cliente
- **GoatCounter** — analytics sin cookies
- **Vercel** — deploy estático con headers personalizados

---

## Estructura del proyecto

```
/
├── index.html                        # Home con acceso a los 4 módulos
├── privacidad.html                   # Política de privacidad
├── manifest.json                     # PWA manifest
├── sw.js                             # Service Worker
├── pwa.js                            # Registro SW + botón de instalación
├── analytics.js                      # GoatCounter (compartido por todas las páginas)
├── vercel.json                       # Headers de caché y CORS
├── assets/
│   ├── icons/                        # Íconos PWA (192, 512, maskable, apple-touch)
│   ├── banner-santa-fe.png
│   └── banco-solidario-santa-fe.png
└── modules/
    ├── calculadora/index.html
    ├── guiadeprompts/index.html
    ├── combinadordecolores/index.html
    └── herramientasdigitales/index.html
```

---

## Deploy

El sitio es 100% estático. No requiere build ni servidor backend. Se despliega directamente en Vercel conectando el repositorio.

Los headers de `vercel.json` configuran:
- `sw.js` y `manifest.json`: sin caché (siempre frescos)
- Íconos PWA: caché inmutable de 1 año

---

## Autor

**Leandro Sacha Melchiori**
- [LinkedIn](https://www.linkedin.com/in/leandromelchiori-developer/)
- [Instagram](https://www.instagram.com/sacha.melchiori/)
