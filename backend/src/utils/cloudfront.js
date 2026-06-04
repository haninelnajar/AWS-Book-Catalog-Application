function buildImageUrl(key) {
  if (!key) return null;

  return `${process.env.CLOUDFRONT_URL}/${key}`;
}

module.exports = {
  buildImageUrl,
};