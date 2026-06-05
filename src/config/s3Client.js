const { S3Client } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET; // source bucket: originals are uploaded here
const RESIZED_BUCKET = process.env.RESIZED_BUCKET; // resized copies the app displays/links

const s3Client = new S3Client({ region: REGION });

module.exports = { s3Client, S3_BUCKET, RESIZED_BUCKET };
