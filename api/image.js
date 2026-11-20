const { loadSelector, renderImage } = require("../lib/render");

const first = (v) => (Array.isArray(v) ? v[0] : v);

module.exports = async (req, res) => {
  try {
    const selector = first(req.query.selector);
    const parameters = first(req.query.parameters) || "";

    if (!selector) {
      return res.status(400).json({ error: "Falta el parametro 'selector'" });
    }

    const config = loadSelector(selector);
    if (!config) {
      return res.status(404).json({ error: `El selector '${selector}' no existe` });
    }

    const png = await renderImage(config, parameters);

    res.setHeader("Content-Type", "image/png");
    // Misma URL = misma imagen, asi que se puede cachear fuerte
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=31536000");
    return res.status(200).send(png);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error generando la imagen" });
  }
};
