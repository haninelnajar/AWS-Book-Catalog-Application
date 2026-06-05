# AWS Book Catalog — Single-Server Edition

A single Node.js/Express app (server-rendered EJS) doing CRUD on **DynamoDB**
with cover-image upload to **S3**, plus a separate **Lambda** that resizes
images. Built for the Cloud Computing 2026 "Web Application Hosting on AWS"
milestone. Runs as one process on one EC2 instance (replicated across AZs behind
an ALB + CloudFront for high availability).

## Stack
- Node.js + Express + EJS (one process, one port)
- AWS SDK for JavaScript v3 — DynamoDB + S3
- multer (in-memory upload)
- Lambda (`lambda/`) — image resize (deployed separately)

## Prerequisites (AWS)
- DynamoDB table `Books`, partition key `bookId` (string)
- A private S3 bucket for covers
- Credentials: an EC2 IAM role in production, or a local AWS CLI profile for dev,
  with DynamoDB CRUD + `s3:PutObject/GetObject/DeleteObject` on the bucket

## Run locally
```bash
npm install
cp .env.example .env   # set S3_BUCKET, AWS_REGION, BOOKS_TABLE
npm start              # http://localhost:5000
```

## Environment
| Var | Meaning |
|-----|---------|
| `PORT` | HTTP port (default 5000) |
| `AWS_REGION` | e.g. `us-east-1` |
| `BOOKS_TABLE` | DynamoDB table name (default `Books`) |
| `S3_BUCKET` | cover-image bucket |
| `CLOUDFRONT_URL` | optional; if set, images served via this domain instead of presigned URLs |

## Deploy on EC2 (one server)
1. Install Node.js 20.
2. `git clone` this repo, `npm install --omit=dev`.
3. Attach an IAM role with DynamoDB + S3 permissions (no keys in code).
4. Set env vars (e.g. in a systemd unit or `.env`).
5. Run with a process manager: `node server.js` under `systemd`/`pm2`.
6. For HA: run the same on multiple instances across AZs, front with an ALB
   (health check `/health`), and put CloudFront in front of the ALB.

## Lambda
See [`lambda/README.md`](lambda/README.md) for building, deploying, and wiring
the S3 trigger.
