/* ============================================================
   color-domain.js - Operaciones puras de color y accesibilidad.
   No conoce el DOM: puede probarse y reutilizarse de forma aislada.
   ============================================================ */

(function initColorDomain(global) {
  'use strict';

  function hslToRgb(hue, saturation, lightness) {
    const s = saturation / 100;
    const l = lightness / 100;
    const amplitude = s * Math.min(l, 1 - l);
    const channel = (offset) => {
      const position = (offset + hue / 30) % 12;
      return l - amplitude * Math.max(Math.min(position - 3, 9 - position, 1), -1);
    };
    return [channel(0), channel(8), channel(4)].map(value => Math.round(value * 255));
  }

  function rgbToHex(red, green, blue) {
    const hex = [red, green, blue].map(value =>
      Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
    );
    return '#' + hex.join('');
  }

  function hslToHex(hue, saturation, lightness) {
    return rgbToHex(...hslToRgb(hue, saturation, lightness));
  }

  function hexToRgb(hex) {
    const value = String(hex).replace('#', '');
    if (value.length !== 6) return [128, 128, 128];
    return [0, 2, 4].map(index => Number.parseInt(value.slice(index, index + 2), 16));
  }

  function rgbToHsl(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    let hue = 0;
    let saturation = 0;

    if (max !== min) {
      const delta = max - min;
      saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      if (max === r) hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      else if (max === g) hue = ((b - r) / delta + 2) / 6;
      else hue = ((r - g) / delta + 4) / 6;
    }

    return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
  }

  const hexToHsl = hex => rgbToHsl(...hexToRgb(hex));
  const isValidHex = hex => /^#[0-9a-fA-F]{6}$/.test(hex);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function getTextColor(hex) {
    const [red, green, blue] = hexToRgb(hex);
    const perceivedLightness = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
    return perceivedLightness > 0.55 ? '#1a1a1a' : '#ffffff';
  }

  const emotions = [
    {
      "r": [
        345,
        360
      ],
      "e": "❤️",
      "n": "Rojo",
      "w": "pasión · energía · fuerza",
      "rb": "Gastronomía, deporte, moda"
    },
    {
      "r": [
        0,
        15
      ],
      "e": "❤️",
      "n": "Rojo",
      "w": "pasión · energía · fuerza",
      "rb": "Gastronomía, deporte, moda"
    },
    {
      "r": [
        15,
        45
      ],
      "e": "🧡",
      "n": "Naranja",
      "w": "creatividad · calidez · juventud",
      "rb": "Comida, entretenimiento"
    },
    {
      "r": [
        45,
        70
      ],
      "e": "💛",
      "n": "Amarillo",
      "w": "optimismo · alegría · atención",
      "rb": "Bebidas, infantil"
    },
    {
      "r": [
        70,
        165
      ],
      "e": "💚",
      "n": "Verde",
      "w": "naturaleza · salud · frescura",
      "rb": "Orgánico, bienestar"
    },
    {
      "r": [
        165,
        200
      ],
      "e": "🩵",
      "n": "Celeste",
      "w": "tranquilidad · limpieza · modernidad",
      "rb": "Tecnología, salud"
    },
    {
      "r": [
        200,
        255
      ],
      "e": "💙",
      "n": "Azul",
      "w": "confianza · profesionalismo · calma",
      "rb": "Finanzas, tech, servicios"
    },
    {
      "r": [
        255,
        310
      ],
      "e": "💜",
      "n": "Violeta",
      "w": "creatividad · lujo · misterio",
      "rb": "Belleza, arte, bienestar"
    },
    {
      "r": [
        310,
        345
      ],
      "e": "🩷",
      "n": "Rosa",
      "w": "ternura · romance · delicadeza",
      "rb": "Belleza, moda, regalos"
    }
  ];
  const harmonies = {
    "complementario": {
      "label": "Complementaria",
      "desc": "Máximo contraste y energía",
      "offsets": [
        180
      ]
    },
    "analogos": {
      "label": "Análoga",
      "desc": "Colores vecinos, armonía natural",
      "offsets": [
        30,
        60,
        -30
      ]
    },
    "triadico": {
      "label": "Tríada",
      "desc": "3 colores equidistantes, vibrante",
      "offsets": [
        120,
        240
      ]
    },
    "split": {
      "label": "Complementaria Dividida",
      "desc": "Variante suave de la complementaria",
      "offsets": [
        150,
        210
      ]
    },
    "monocromatico": {
      "label": "Monocromática",
      "desc": "Un tono en distintas luminosidades",
      "offsets": []
    },
    "cuadrado": {
      "label": "Cuadrada",
      "desc": "4 colores en cuadrado perfecto",
      "offsets": [
        90,
        180,
        270
      ]
    },
    "tetradica": {
      "label": "Tetrádica",
      "desc": "4 colores en rectángulo",
      "offsets": [
        60,
        180,
        240
      ]
    }
  };
  const harmLabels = {
    "complementario": [
      "Complementaria"
    ],
    "analogos": [
      "Análogo+",
      "Análogo++",
      "Análogo−"
    ],
    "triadico": [
      "Tríada 2",
      "Tríada 3"
    ],
    "split": [
      "Comp. Div. 1",
      "Comp. Div. 2"
    ],
    "cuadrado": [
      "Cuadrada 2",
      "Cuadrada 3",
      "Cuadrada 4"
    ],
    "tetradica": [
      "Tetrádica 2",
      "Tetrádica 3",
      "Tetrádica 4"
    ]
  };

  function getEmotion(hue) {
    return emotions.find(item => {
      const [start, end] = item.r;
      return start > end ? hue >= start || hue < end : hue >= start && hue < end;
    }) || emotions[6];
  }

  function generatePalette(hue, saturation, lightness, harmonyKey) {
    const colors = [{ hex: hslToHex(hue, saturation, lightness), label: 'Principal' }];
    if (harmonyKey === 'monocromatico') {
      colors.push({ hex: hslToHex(hue, saturation, clamp(lightness + 22, 5, 95)), label: 'Claro' });
      colors.push({ hex: hslToHex(hue, saturation, clamp(lightness - 22, 5, 95)), label: 'Oscuro' });
      colors.push({ hex: hslToHex(hue, Math.max(saturation - 35, 5), clamp(lightness + 40, 5, 97)), label: 'Neutro' });
      return colors;
    }

    const harmony = harmonies[harmonyKey] || { offsets: [] };
    harmony.offsets.forEach((offset, index) => {
      const shiftedHue = ((hue + offset) % 360 + 360) % 360;
      colors.push({
        hex: hslToHex(shiftedHue, saturation, lightness),
        label: harmLabels[harmonyKey]?.[index] || 'Color ' + (index + 2),
      });
    });
    colors.push({
      hex: hslToHex(hue, Math.max(saturation - 48, 5), clamp(lightness + 38, 5, 96)),
      label: 'Neutro',
    });
    return colors;
  }

  function relLum(red, green, blue) {
    const [r, g, b] = [red, green, blue].map(value => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrastRatio(firstHex, secondHex) {
    const first = relLum(...hexToRgb(firstHex));
    const second = relLum(...hexToRgb(secondHex));
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  }

  const colorBlindnessMatrices = {
    protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
    deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  };

  function simulateCb(hex, type) {
    const matrix = colorBlindnessMatrices[type];
    if (!matrix) return hex;
    const [red, green, blue] = hexToRgb(hex).map(value => value / 255);
    const channel = row => (row[0] * red + row[1] * green + row[2] * blue) * 255;
    return rgbToHex(...matrix.map(channel));
  }

  global.AppColor = Object.freeze({
    hslToRgb, rgbToHex, hslToHex, hexToRgb, rgbToHsl, hexToHsl,
    isValidHex, getTextColor, clamp, emotions, getEmotion,
    harmonies, harmLabels, generatePalette, relLum, contrastRatio, simulateCb,
  });
})(window);
