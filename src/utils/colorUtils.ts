import chroma from 'chroma-js';

export type Harmony = 'random' | 'analogous' | 'complementary' | 'triadic' | 'monochromatic';

export const generatePalette = (baseColor: string, count: number, harmony: Harmony): string[] => {
  const base = chroma(baseColor);
  let colors: chroma.Color[] = [];

  switch (harmony) {
    case 'analogous':
      // spread colors around the hue circle by small steps
      for (let i = 0; i < count; i++) {
        colors.push(base.set('hsl.h', `+${(i - Math.floor(count / 2)) * 30}`));
      }
      break;
    case 'complementary':
      // split base and complementary
      colors.push(base);
      for (let i = 1; i < count; i++) {
        if (i % 2 === 1) {
          colors.push(base.set('hsl.h', '+180').set('hsl.l', `*${1 - (i * 0.1)}`));
        } else {
          colors.push(base.set('hsl.l', `*${1 - (i * 0.1)}`));
        }
      }
      break;
    case 'triadic':
      // 120 degrees apart
      colors.push(base);
      for (let i = 1; i < count; i++) {
        colors.push(base.set('hsl.h', `+${(i * 120) % 360}`));
      }
      break;
    case 'monochromatic':
      // same hue, varying lightness and saturation
      colors = chroma.scale([base.set('hsl.l', 0.1), base, base.set('hsl.l', 0.9)])
        .mode('lch').colors(count, 'hex').map(c => chroma(c));
      break;
    case 'random':
    default:
      for (let i = 0; i < count; i++) {
        colors.push(chroma.random());
      }
      break;
  }

  return colors.map(c => c.hex());
};

export const getRandomColor = () => chroma.random().hex();

export const formatColor = (hex: string, format: 'HEX' | 'RGB' | 'HSL'): string => {
  const c = chroma(hex);
  switch (format) {
    case 'RGB':
      return c.css('rgb');
    case 'HSL':
      return c.css('hsl');
    case 'HEX':
    default:
      return c.hex().toUpperCase();
  }
};

export const getContrastRatio = (bgHex: string, textHex: string): number => {
  return chroma.contrast(bgHex, textHex);
};

export const getTextColor = (bgHex: string): string => {
  return chroma.contrast(bgHex, '#ffffff') >= 4.5 ? '#ffffff' : '#000000';
};
