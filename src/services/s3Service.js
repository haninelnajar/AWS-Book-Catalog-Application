const { randomUUID } = require("crypto");
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3Client, S3_BUCKET, RESIZED_BUCKET } = require("../config/s3Client");

// Upload a multer file (memoryStorage) to the SOURCE bucket under a unique key.
// Returns the S3 key, which is stored as `imageKey` on the book. The Lambda
// then writes a resized copy to RESIZED_BUCKET under this SAME key — so the key
// references both objects, and the app displays the resized one. Unique keys
// mean uploads never overwrite each other, so old + new versions are retained.
async function uploadImage(file) {
  if (!file) return null;
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `covers/${randomUUID()}-${safeName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return key;
}

// Build a viewable URL for a stored key, pointing at the RESIZED bucket (the
// app always displays the resized image, not the original). CloudFront if
// configured (assumed to front the resized bucket), else a short-lived
// presigned GET URL.
async function getImageUrl(key) {
  if (!key) return null;
  if (process.env.CLOUDFRONT_URL) {
    return `${process.env.CLOUDFRONT_URL}/${key}`;
  }
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: RESIZED_BUCKET, Key: key }),
    { expiresIn: 3600 }
  );
}

// Delete both copies of the image: the original in the source bucket and the
// resized copy in RESIZED_BUCKET. allSettled so a missing copy (e.g. the Lambda
// hadn't run yet) doesn't throw.
async function deleteImage(key) {
  if (!key) return;
  await Promise.allSettled([
    s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })),
    s3Client.send(new DeleteObjectCommand({ Bucket: RESIZED_BUCKET, Key: key })),
  ]);
}

module.exports = { uploadImage, getImageUrl, deleteImage };
