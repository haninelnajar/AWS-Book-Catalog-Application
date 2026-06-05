const { S3Client } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET;

const s3Client = new S3Client({ region: REGION });

module.exports = { s3Client, S3_BUCKET };
