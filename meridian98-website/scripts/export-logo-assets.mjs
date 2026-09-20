import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const markSvg = fs.readFileSync(path.join(publicDir, "logo-mark-98.svg"), "utf8");
const fullSvg = fs.readFileSync(path.join(publicDir, "logo.svg"), "utf8");

function renderPng(svg, width, outName) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: "transparent",
  });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(publicDir, outName), png);
}

renderPng(fullSvg, 840, "logo.png");
renderPng(markSvg, 256, "favicon.png");

console.log("Wrote public/logo.png and public/favicon.png");
