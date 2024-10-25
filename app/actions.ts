"use server";

function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

function interpolateColor(
  rgb: [number, number, number],
  factor: number
): [number, number, number] {
  if (factor > 0) {
    return rgb.map((c) => Math.round(c + (255 - c) * factor)) as [
      number,
      number,
      number
    ];
  } else {
    return rgb.map((c) => Math.round(c * (1 + factor))) as [
      number,
      number,
      number
    ];
  }
}

function generateColorPalette(hexColor: string, colorName: string): string {
  const rgbColor = hexToRgb(hexColor);
  const palette: Record<string, string> = {};
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  shades.forEach((shade, index) => {
    const factor = 0.95 - (index * 1.75) / 9; // This will range from 0.95 to -0.8
    const interpolatedRgb = interpolateColor(rgbColor, factor);
    palette[shade] = rgbToHex(interpolatedRgb);
  });

  // Generate Tailwind config string
  const configString = `'${colorName}': {
${Object.entries(palette)
  .map(([shade, color]) => `      ${shade}: '${color}',`)
  .join("\n")}
    },`;

  return configString;
}

export async function generatePalette(formData: FormData) {
  const hexColor = formData.get("hexColor") as string;
  const colorName = formData.get("colorName") as string;

  if (!hexColor || !/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
    return {
      error:
        "Invalid hex color. Please provide a valid 6-digit hex color (e.g., #3498DB).",
    };
  }

  if (!colorName) {
    return { error: "Please provide a name for your color palette." };
  }

  const paletteConfig = generateColorPalette(hexColor, colorName);
  return { paletteConfig };
}
