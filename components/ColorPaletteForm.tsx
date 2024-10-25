"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generatePalette } from "@/app/actions";
import { ColorPicker } from "./ui/color-picker";

type ColorPalette = {
  [key: string]: string;
};

export default function ColorPaletteForm() {
  const [paletteConfig, setPaletteConfig] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [baseColor, setBaseColor] = useState("#3498DB");
  const [colorName, setColorName] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("hexColor", baseColor);
    formData.append("colorName", colorName);

    const result = await generatePalette(formData);
    if ("error" in result) {
      setError(result.error || "An error occurred");
      setPaletteConfig(null);
      setPalette(null);
    } else {
      setPaletteConfig(result.paletteConfig);
      // Extract the color values from the paletteConfig string
      const colorValues = result.paletteConfig.match(/'#[0-9A-F]{6}'/g);
      if (colorValues) {
        const newPalette: ColorPalette = {};
        const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        colorValues.forEach((color, index) => {
          newPalette[shades[index]] = color.replace(/'/g, "");
        });
        setPalette(newPalette);
      }
      setError(null);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tailwind Color Palette Generator</CardTitle>
        <CardDescription>
          Generate a Tailwind-compatible color palette
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="baseColor">Base Color</Label>
              <ColorPicker
                value={baseColor}
                onChange={setBaseColor}
                name="baseColor"
                id="baseColor"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="colorName">Color Name</Label>
              <Input
                id="colorName"
                name="colorName"
                placeholder="my-color"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="mt-4">
            Generate Palette
          </Button>
        </form>
        {error && (
          <p className="text-red-500 mt-4" role="alert">
            {error}
          </p>
        )}
        {palette && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              Generated Color Palette:
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(palette).map(([shade, color]) => (
                <div key={shade} className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded"
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${shade}: ${color}`}
                  ></div>
                  <span className="text-sm mt-1">{shade}</span>
                  <span className="text-xs">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {paletteConfig && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              Generated Tailwind Config:
            </h3>
            <Textarea
              value={`module.exports = {
  theme: {
    extend: {
      colors: {
        ${paletteConfig}
      }
    }
  }
}`}
              readOnly
              className="font-mono text-sm"
              rows={15}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Copy this code into your tailwind.config.js file to use your new
              color palette.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
