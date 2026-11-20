const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const SELECTORS_DIR = path.join(ROOT, "config", "selectors");

const SELECTOR_RE = /^[a-zA-Z0-9_-]{1,50}$/; // evita path traversal
const MAX_LAYERS = 64;

// Lee config/selectors/<nombre>.json. Devuelve null si no existe o el nombre es invalido.
function loadSelector(name) {
  if (!SELECTOR_RE.test(name)) return null;
  const file = path.join(SELECTORS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Convierte la ruta del JSON en una ruta absoluta, y verifica que quede dentro de /images
function resolveImage(relPath) {
  const abs = path.resolve(ROOT, relPath);
  if (!abs.startsWith(IMAGES_DIR + path.sep)) {
    throw new Error(`Ruta de imagen invalida: ${relPath}`);
  }
  return abs;
}

// params: "asd" -> la 1ra letra va arriba de todo, la ultima al fondo
async function renderImage(config, params) {
  const { width, height, images, fit = "fill", background } = config;

  // sharp compone en orden de abajo hacia arriba, asi que invertimos
  const letters = Array.from(params)
    .filter((ch) => images[ch])
    .slice(0, MAX_LAYERS)
    .reverse();

  const layers = await Promise.all(
    letters.map(async (ch) => ({
      input: await sharp(resolveImage(images[ch]))
        .resize(width, height, { fit, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
    }))
  );

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: background || { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers)
    .png()
    .toBuffer();
}

module.exports = { loadSelector, renderImage };
