# Image Resize Lambda

Resizes book cover images into a **separate resized bucket**. Deployed to AWS
Lambda and triggered by S3 — it is NOT run by the web server. The web app and
this function communicate only through S3.

## Two-bucket design
- **Source bucket** (`S3_BUCKET`): the web app uploads originals here.
- **Resized bucket** (`RESIZED_BUCKET`): this function writes the resized copy
  here, under the **same key**. The web app displays/links the resized copy.

Because the resized bucket has **no trigger**, the function never re-invokes
itself — there is no recursion, so no metadata flag or size guard is needed.

## Flow
1. Web app uploads a cover to `s3://<source-bucket>/covers/<uuid>-name.jpg`.
2. The source bucket fires an `ObjectCreated` event.
3. This function reads that object, resizes it to fit 300x300, and writes the
   result to `s3://<resized-bucket>/covers/<uuid>-name.jpg` (same key).
4. The app builds the cover URL against the resized bucket.

## Build the deployment package
`sharp` ships native binaries, so build the package for the Lambda runtime
(Amazon Linux, x86_64). From this `lambda/` folder:

```bash
npm init -y
npm install @aws-sdk/client-s3 sharp --os=linux --cpu=x64 --libc=glibc
zip -r resizeImage.zip resizeImage.js node_modules
```
(Alternatively, attach a prebuilt `sharp` Lambda layer and zip only `resizeImage.js`.)

## Create the function
- Runtime: Node.js 20.x
- Architecture: x86_64
- Handler: `resizeImage.handler`
- Upload `resizeImage.zip`
- Timeout: 30s; Memory: 512 MB

## Set the environment variable
- `RESIZED_BUCKET` = the resized bucket name (Configuration → Environment variables).

## Wire the S3 trigger
- Source: the **source** bucket (`S3_BUCKET`) only — do NOT add a trigger on the resized bucket.
- Event type: `s3:ObjectCreated:*`
- Prefix: `covers/`

## Execution role permissions
- `s3:GetObject` on `arn:aws:s3:::<source-bucket>/*` (read the original; also authorizes HeadObject)
- `s3:PutObject` on `arn:aws:s3:::<resized-bucket>/*` (write the resized copy)
