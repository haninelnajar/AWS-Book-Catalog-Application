# AWS Book Catalog — System Architecture & Deployment Documentation

> Cloud Computing 2026 — "Web Application Hosting on AWS" milestone.
> This document describes the deployed system, what was built, and how every
> AWS component is wired together.

---

## 1. Overview

The Book Catalog is a server-rendered CRUD web application (Node.js + Express +
EJS) for managing books and their cover images. It runs on **two EC2 instances
across two Availability Zones** behind an **Application Load Balancer** for high
availability. Book data lives in **DynamoDB**; cover images live in **S3**; a
**Lambda** function resizes each uploaded image into a second bucket.

| Property | Value |
|----------|-------|
| Region | `us-east-1` |
| AWS Account | `328833518686` |
| App stack | Node.js 20 + Express + EJS, AWS SDK for JavaScript v3 |
| App port | `5000` |
| Git branch | `single-server` |
| ALB DNS | `book-catalog-1962840844.us-east-1.elb.amazonaws.com` |

---

## 2. Architecture Diagram (eraser.io syntax)

> Paste the block below into [eraser.io](https://app.eraser.io) → *Diagram as Code*
> → *Cloud Architecture* to render it.

```eraser
title AWS Book Catalog — High-Availability Architecture

// ─── External ───
User [icon: user, label: "User / Browser"]
CloudFront [icon: aws-cloudfront, label: "CloudFront\n(planned — ALB origin)"]

// ─── Edge / Load Balancing ───
ALB [icon: aws-elastic-load-balancing, label: "Application Load Balancer\n(HTTP :80, 2 AZs)"]

// ─── Compute (VPC) ───
VPC [icon: aws-vpc, label: "Default VPC (us-east-1)"] {
  AZ_A [label: "Availability Zone us-east-1a"] {
    EC2_1 [icon: aws-ec2, label: "EC2 #1\nNode app :5000\n(systemd)"]
  }
  AZ_B [label: "Availability Zone us-east-1b"] {
    EC2_2 [icon: aws-ec2, label: "EC2 #2\nNode app :5000\n(systemd)"]
  }
}

// ─── IAM ───
Role [icon: aws-iam, label: "EC2 Instance Role\nDynamoDB CRUD + S3 RW"]

// ─── Data services ───
DynamoDB [icon: aws-dynamodb, label: "DynamoDB\nBooks (PK: bookId)"]
SourceBucket [icon: aws-s3, label: "S3 source bucket\nimage-bucket-…-an\n(originals, covers/)"]
ResizedBucket [icon: aws-s3, label: "S3 resized bucket\nresized-bucket-…-an\n(displayed copies)"]
Lambda [icon: aws-lambda, label: "Lambda resizeImage\n(Node, sharp)"]

// ─── Request path ───
User > CloudFront
CloudFront > ALB
ALB > EC2_1
ALB > EC2_2

// ─── App ↔ data ───
EC2_1 > DynamoDB
EC2_2 > DynamoDB
EC2_1 > SourceBucket
EC2_2 > SourceBucket
EC2_1 < ResizedBucket
EC2_2 < ResizedBucket

// ─── IAM attachment ───
Role > EC2_1
Role > EC2_2

// ─── Image resize pipeline ───
SourceBucket > Lambda: "ObjectCreated\n(covers/ prefix)"
Lambda > ResizedBucket: "writes resized\n(same key)"
```

### ASCII fallback (if eraser.io is unavailable)

```
                         ┌──────────────┐
        User ───────────▶│  CloudFront  │  (planned: ALB origin)
                         └──────┬───────┘
                                ▼
                    ┌───────────────────────┐
                    │ Application Load Bal.  │  HTTP :80, spans 2 AZs
                    │ (health check /health) │
                    └─────┬─────────────┬────┘
                forward :5000      forward :5000
                          ▼             ▼
              ┌────────────────┐  ┌────────────────┐
              │  EC2 #1 (AZ a) │  │  EC2 #2 (AZ b) │   Node app :5000 (systemd)
              └───┬───┬────────┘  └────┬───┬───────┘   IAM role attached
                  │   │                │   │
        DynamoDB ◀┘   └─▶ S3 source ◀──┘   └─▶ S3 source
        (Books)            (originals)
                                │
                       ObjectCreated (covers/)
                                ▼
                         ┌─────────────┐
                         │   Lambda    │  resize (sharp)
                         └──────┬──────┘
                                ▼
                          S3 resized bucket  ◀── app displays these (presigned URL)
```

---

## 3. Components

### 3.1 Application (EC2 × 2)
- **AMI:** Ubuntu, Node.js 20 installed via NodeSource.
- Code cloned from GitHub (`single-server` branch), `npm install --omit=dev`.
- Runs as a **systemd service** (`bookcatalog.service`) with `Restart=always` and
  `enable`, so it survives reboots and crashes.
- Listens on **`0.0.0.0:5000`** (so the ALB can reach it).
- Both instances are **identical** — instance #2 was created from an **AMI baked
  from instance #1**, then launched into a **different AZ**.

### 3.2 Application Load Balancer
- **Internet-facing**, IPv4, spans **two AZs** (`us-east-1a`, `us-east-1b`).
- **Listener:** HTTP `:80` → forwards to target group `bookcatalog-tg`.
- Distributes traffic across both instances and removes unhealthy ones.

### 3.3 Target Group (`bookcatalog-tg`)
- Target type **Instances**, protocol **HTTP**, port **5000**.
- **Health check path `/health`** (the app returns HTTP 200 JSON there).
- Both EC2 instances registered.

### 3.4 IAM Instance Role (`BookCatalogEC2Role`)
- Attached to both instances — **no access keys on disk**.
- Permissions:
  - DynamoDB: `GetItem, PutItem, UpdateItem, DeleteItem, Scan, Query` on `Books`.
  - S3: `PutObject, GetObject, DeleteObject` on **both** buckets.

### 3.5 DynamoDB
- Table **`Books`**, partition key **`bookId`** (String).
- Stores book metadata + the cover image key.

### 3.6 S3 (two buckets)
- **Source bucket** `image-bucket-328833518686-us-east-1-an` — app uploads
  originals here under `covers/<uuid>-<name>`.
- **Resized bucket** `resized-bucket-328833518686-us-east-1-an` — Lambda writes
  resized copies (same key); the app displays these via presigned URLs.
- Unique keys per upload retain old cover versions on edit.

### 3.7 Lambda (`resizeImage`)
- Triggered by S3 `ObjectCreated:*` on the **source** bucket, prefix `covers/`.
- Resizes the image with **sharp** and writes the copy to the **resized** bucket
  under the same key.
- Separate output bucket avoids S3→Lambda recursion.

---

## 4. Security Groups

| Security group | Inbound rule | Source | Purpose |
|----------------|--------------|--------|---------|
| **ALB SG** | HTTP 80 | `0.0.0.0/0` | Public web traffic |
| **Instance SG** | Custom TCP 5000 | **ALB SG** (sg-id) | Only the ALB can reach the app |
| **Instance SG** | SSH 22 | Admin IP | Maintenance access |

Key principle: the app port (5000) is **never** exposed to the internet — only
the ALB can reach it. Public traffic terminates at the ALB on port 80.

---

## 5. Configuration (environment variables)

Set per instance in `/home/<user>/AWS-Book-Catalog-Application/.env`, loaded by
the systemd unit via `EnvironmentFile`:

| Var | Value |
|-----|-------|
| `PORT` | `5000` |
| `AWS_REGION` | `us-east-1` |
| `BOOKS_TABLE` | `Books` |
| `S3_BUCKET` | `image-bucket-328833518686-us-east-1-an` |
| `RESIZED_BUCKET` | `resized-bucket-328833518686-us-east-1-an` |
| `CLOUDFRONT_URL` | *(empty — presigned URLs used)* |

> **Note:** do **not** set an empty `AWS_ACCESS_KEY_ID` — it breaks the default
> credential chain and stops the IAM role from being used. The line must be absent.

---

## 6. What We Built (deployment log)

1. **Launched a golden EC2 instance** (Ubuntu, `t2.micro`) and installed Node.js 20 + git.
2. **Created an IAM role** (`BookCatalogEC2Role`) with DynamoDB + S3 permissions
   and attached it to the instance — no keys on the box.
3. **Cloned the app** (`single-server` branch), `npm install --omit=dev`.
4. **Created `.env`** with region, table, and both bucket names.
5. **Created a systemd service** (`bookcatalog.service`, `Restart=always`,
   `enable`) so the app auto-starts and self-heals. Verified
   `curl localhost:5000/health` → 200.
6. **Baked an AMI** from the working instance.
7. **Launched a second instance** from that AMI in a **different AZ** — it boots
   already running the app.
8. **Created the target group** (`bookcatalog-tg`, HTTP :5000, health check
   `/health`) and registered both instances.
9. **Created the Application Load Balancer** (internet-facing, 2 AZs, HTTP :80 →
   target group).
10. **Configured security groups** — ALB open on 80 to the internet; instances
    open on 5000 only to the ALB's SG.
11. **Verified** both targets `healthy` and the app reachable via the ALB DNS:
    `http://book-catalog-1962840844.us-east-1.elb.amazonaws.com/`.

---

## 7. CloudFront Setup (to be completed)

CloudFront sits in front of the ALB as the public entry point — users hit the
CloudFront domain, which forwards to the ALB, which forwards to the EC2 instances.

### Steps

1. AWS Console → **CloudFront** → **Create distribution**.
2. **Origin domain:** select / paste the **ALB DNS name**
   `book-catalog-1962840844.us-east-1.elb.amazonaws.com`.
3. **Protocol:** **HTTP only** (the ALB listener is HTTP :80) — set **Origin
   protocol policy = HTTP only**, **Origin port = 80**.
4. **Viewer protocol policy:** *Redirect HTTP to HTTPS* (CloudFront gives you a
   free `*.cloudfront.net` HTTPS cert for the viewer side).
5. **Allowed HTTP methods:** **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE**
   (the app has forms that POST — restricting to GET/HEAD would break create/edit/delete).
6. **Cache policy:** **CachingDisabled** (managed policy). The app is dynamic
   server-rendered HTML, so caching would serve stale book lists.
7. **Origin request policy:** **AllViewer** (forward all headers/cookies/query
   strings to the ALB).
8. Leave WAF off (not required). **Create distribution**.
9. Wait for status **Enabled / Deployed** (~5–10 min).
10. **Verify:** open `https://<distribution-id>.cloudfront.net/` → the app loads,
    create/edit/delete a book to confirm POST works through CloudFront.

### Config summary

| Setting | Value |
|---------|-------|
| Origin domain | ALB DNS (`book-catalog-…elb.amazonaws.com`) |
| Origin protocol | **HTTP only**, port 80 |
| Viewer protocol policy | Redirect HTTP → HTTPS |
| Allowed methods | GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE |
| Cache policy | CachingDisabled |
| Origin request policy | AllViewer |

### Gotchas

- **Don't use "HTTPS only" for the origin** — the ALB only listens on HTTP :80,
  so CloudFront → ALB over HTTPS would fail. HTTPS is only on the viewer side.
- **Must allow POST/PUT/DELETE** — the default GET/HEAD-only would break all
  form submissions (adding/editing/deleting books).
- **Caching must be disabled** (or set very low) — otherwise users see stale
  catalog pages after changes.

Once created, record the **CloudFront domain** in the submission form and update
the diagram in §2 (remove the `(planned)` note on the CloudFront node).

---

## 8. Remaining Work

- [ ] **CloudFront distribution** with the **ALB as the origin** (assignment-required
      front door for app delivery).
- [ ] Architecture diagram exported with AWS standard icons (use the eraser.io block above).
- [ ] Demo / presentation of the working app.
- [ ] Submission form: ALB DNS ✅, CloudFront domain, EC2 private IPs, diagram, demo.

> ⚠️ After submission, **STOP** the EC2 instances — do **not terminate** them.
> Keep within AWS Free Tier limits.
