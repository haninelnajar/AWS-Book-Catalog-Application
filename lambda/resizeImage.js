const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const MAX = 300;
const RESIZED_BUCKET = process.env.RESIZED_BUCKET; // set on the Lambda function
const s3 = new S3Client({});

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// S3 ObjectCreated trigger on the SOURCE bucket. Reads the uploaded original,
// resizes it to fit MAXxMAX, and writes the result to a SEPARATE resized bucket
// under the SAME key. Because the resized bucket has no trigger, there is no
// recursion — so no metadata flag / size guard is needed. We always resize.
exports.handler = async (event) => {
  for (const record of event.Records) {
    const SourceBucket = record.s3.bucket.name;
    const Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const { Body, ContentType } = await s3.send(
      new GetObjectCommand({ Bucket: SourceBucket, Key })
    );
    const buffer = await streamToBuffer(Body);
    const meta = await sharp(buffer).metadata();

    const resized = await sharp(buffer).resize(MAX, MAX, { fit: "inside" }).toBuffer();
    await s3.send(
      new PutObjectCommand({
        Bucket: RESIZED_BUCKET,
        Key, // same key, different bucket
        Body: resized,
        ContentType: ContentType || `image/${meta.format}`,
      })
    );
    console.log(`Resized ${Key} -> ${RESIZED_BUCKET} (fit ${MAX}x${MAX})`);
  }

  return { ok: true };
};
