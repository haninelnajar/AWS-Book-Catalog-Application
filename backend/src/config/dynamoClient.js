
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.BOOKS_TABLE || "Books";
const CATEGORY_INDEX = "category-createdAt-index";

const baseClient = new DynamoDBClient({ region: REGION });

const ddbDocClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

module.exports = { ddbDocClient, baseClient, TABLE_NAME, CATEGORY_INDEX, REGION };
