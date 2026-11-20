// Prueba rapida sin Vercel: node scripts/test-local.js [selector] [parameters]
const fs = require("fs");
const { loadSelector, renderImage } = require("../lib/render");

(async () => {
  const selector = process.argv[2] || "ejemplo1";
  const params = process.argv[3] || "asd";
  const config = loadSelector(selector);
  if (!config) return console.error(`Selector '${selector}' no existe`);
  const png = await renderImage(config, params);
  fs.writeFileSync("output-test.png", png);
  console.log(`OK -> output-test.png (${config.width}x${config.height}, capas: ${params})`);
})();
