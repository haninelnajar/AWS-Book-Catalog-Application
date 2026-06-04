# AWS Book Catalog Application

## Project Overview

This project is a cloud-hosted Book Catalog web application developed as part of the Cloud Computing course project.

The application allows users to:

* Create books
* View all books
* View a single book
* Update book information
* Delete books
* Upload and manage book cover images (to be implemented)
* Store book data in AWS DynamoDB
* Store book images in AWS S3
* Resize uploaded images using AWS Lambda
* Deploy the application on AWS EC2 with High Availability architecture

---

# Technology Stack

## Frontend

* React.js
* React Router

## Backend

* Node.js
* Express.js

## Database

* AWS DynamoDB

## Storage

* AWS S3

## Serverless Processing

* AWS Lambda

## Infrastructure

* AWS EC2
* Application Load Balancer (ALB)
* CloudFront

---

# Application Domain

## Book Catalog

Each book contains:

```json
{
  "bookId": "uuid",
  "title": "Atomic Habits",
  "author": "James Clear",
  "category": "Self Development",
  "description": "Book description",
  "imageKey": null,
  "resizedImageKey": null,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

# Backend Folder Structure

```text
backend/
│
├── src/
│   │
│   ├── config/
│   │   └── dynamoClient.js
│   │
│   ├── controllers/
│   │   └── bookController.js
│   │
│   ├── middleware/
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   └── bookRoutes.js
│   │
│   ├── services/
│   │   └── bookRepository.js
│   │
│   └── app.js
│
├── server.js
├── .env
├── package.json
└── README.md
```

---

# DynamoDB Table Design

## Table Name

Books

## Partition Key

bookId (String)

## Attributes

| Attribute       | Type   |
| --------------- | ------ |
| bookId          | String |
| title           | String |
| author          | String |
| category        | String |
| description     | String |
| imageKey        | String |
| resizedImageKey | String |
| createdAt       | String |
| updatedAt       | String |

