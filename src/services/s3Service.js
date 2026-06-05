const { randomUUID } = require("crypto");
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3Client, S3_BUCKET } = require("../config/s3Client");

// Upload a multer file (memoryStorage) under a unique key. Returns the S3 key,
// which is stored as `imageKey` on the book. Unique keys mean uploads never
// overwrite each other, so old + new versions are both retained on update.
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

// Build a viewable URL for a stored key. CloudFront if configured, else a
// short-lived presigned GET URL (bucket stays private).
async function getImageUrl(key) {
  if (!key) return null;
  if (process.env.CLOUDFRONT_URL) {
    return `${process.env.CLOUDFRONT_URL}/${key}`;
  }
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    { expiresIn: 3600 }
  );
}

async function deleteImage(key) {
  if (!key) return;
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })
  );
}

module.exports = { uploadImage, getImageUrl, deleteImage };
