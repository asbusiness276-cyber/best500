/** Shared CSV image parsing for product import scripts. */
function isImageUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) && !/image unavailable/i.test(url);
}

function splitImageList(value) {
  const text = String(value || "");
  const fromRegex = text.match(/https?:\/\/[^\s,"']+/gi) || [];
  const fromDelimiters = text
    .split(/[\n,|]+/)
    .map((item) => item.trim())
    .filter(isImageUrl);
  return [...new Set([...fromRegex, ...fromDelimiters].map((url) => url.trim()).filter(isImageUrl))];
}

/**
 * @param {Record<string, number>} headerMap
 * @param {string[]} row
 * @param {(value: unknown) => string} clean
 */
function parseProductImages(row, headerMap, clean) {
  const mainKeys = ["Main HD Image", "Main Image", "Image", "Primary Image"];
  let primary = "";
  for (const key of mainKeys) {
    if (headerMap[key] !== undefined) {
      primary = clean(row[headerMap[key]]);
      if (isImageUrl(primary)) break;
      primary = "";
    }
  }

  const columnImages = Object.entries(headerMap)
    .filter(([key]) => /^(?:main hd image|main image|image|primary image)$/i.test(key) || /^image\s*\d+$/i.test(key) || /^gallery image\s*\d+$/i.test(key))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, index]) => clean(row[index]))
    .filter(isImageUrl);

  const listKeys = ["All HD Images", "Product Images", "Images", "Gallery Images", "Additional Images"];
  const listImages = listKeys.flatMap((key) => {
    if (headerMap[key] === undefined) return [];
    return splitImageList(clean(row[headerMap[key]]));
  });

  const merged = [...(primary ? [primary] : []), ...columnImages, ...listImages].filter(isImageUrl);
  const unique = [...new Set(merged)];
  const image = unique[0] || "";
  const images = unique.length ? unique : image ? [image] : [];

  return { image, images };
}

module.exports = { parseProductImages, isImageUrl, splitImageList };
