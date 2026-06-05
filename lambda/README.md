# Image Resize Lambda

Resizes book cover images **in place** in the S3 bucket. Deployed to AWS Lambda
and triggered by S3 — it is NOT run by the web server. The web app and this
function communicate only through the bucket.

## Flow
1. Web app uploads a cover to `s3://<bucket>/covers/<uuid>-name.jpg`.
2. S3 fires an `ObjectCreated` event.
3. This function resizes the image to fit 300x300 and overwrites the same key,
   tagging the object with metadata `resized=true`.
4. The overwrite re-triggers the function once; the `resized=true` flag makes
   that second run a no-op, breaking the recursion.

## Build the deployment package
`sharp` ships native binaries, so build the package for the Lambda runtime
(Amazon Linux, x86_64). From this `lambda/` folder:

```bash
npm init -y
npm install @aws-sdk/client-s3 sharp --os=linux --cpu=x64 --libc=glibc
zip -r resizeImage.zip resizeImage.js decideAction.js node_modules
```
(Alternatively, attach a prebuilt `sharp` Lambda layer and zip only `resizeImage.js` + `decideAction.js`.)

## Create the function
- Runtime: Node.js 20.x
- Handler: `resizeImage.handler`
- Upload `resizeImage.zip`
- Timeout: 30s; Memory: 512 MB

## Wire the S3 trigger
- Source: the cover bucket
- Event type: `s3:ObjectCreated:*`
- Prefix: `covers/`

## Execution role permissions (on the bucket)
- `s3:GetObject`
- `s3:PutObject`
- `s3:HeadObject`
