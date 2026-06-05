const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const { decideAction } = require("./decideAction");

const MAX = 300;
const s3 = new S3Client({});

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// S3 ObjectCreated trigger. Single bucket, resize-in-place. The resized=true
// metadata flag (set on our own writes) is the primary recursion breaker.
exports.handler = async (event) => {
  for (const record of event.Records) {
    const Bucket = record.s3.bucket.name;
    const Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const head = await s3.send(new HeadObjectCommand({ Bucket, Key }));
    const { Body, ContentType } = await s3.send(new GetObjectCommand({ Bucket, Key }));
    const buffer = await streamToBuffer(Body);
    const meta = await sharp(buffer).metadata();

    const action = decideAction({
      resizedFlag: head.Metadata?.resized,
      width: meta.width,
      height: meta.height,
      max: MAX,
    });

    if (action !== "resize") {
      console.log(`Skipping ${Key}: ${action}`);
      continue;
    }

    const resized = await sharp(buffer).resize(MAX, MAX, { fit: "inside" }).toBuffer();
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key, // overwrite in place — one bucket, one key
        Body: resized,
        ContentType: ContentType || `image/${meta.format}`,
        Metadata: { resized: "true" }, // tag so we never reprocess our output
      })
    );
    console.log(`Resized ${Key} to fit ${MAX}x${MAX}`);
  }

  return { ok: true };
};

module.exports.decideAction = decideAction;
