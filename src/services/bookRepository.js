const { randomUUID } = require("crypto");
const {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const { ddbDocClient, TABLE_NAME } = require("../config/dynamoClient");

// Fields a caller is allowed to set/change. Anything else is ignored.
const EDITABLE_FIELDS = ["title", "author", "category", "description", "imageKey"];

async function createBook(book) {
  if (!book || !book.title || !book.author) {
    throw new Error("createBook: 'title' and 'author' are required");
  }

  const now = new Date().toISOString();
  const item = {
    bookId: randomUUID(),
    title: book.title,
    author: book.author,
    category: book.category || "Uncategorized",
    description: book.description || "",
    imageKey: book.imageKey || null,
    createdAt: now,
    updatedAt: now,
  };

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(bookId)",
    })
  );

  return item;
}

async function getAllBooks() {
  const books = [];
  let ExclusiveStartKey;

  do {
    const resp = await ddbDocClient.send(
      new ScanCommand({ TableName: TABLE_NAME, ExclusiveStartKey })
    );
    books.push(...(resp.Items ?? []));
    ExclusiveStartKey = resp.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return books;
}

async function getBookById(bookId) {
  const { Item } = await ddbDocClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { bookId } })
  );
  return Item ?? null;
}

async function updateBook(bookId, data = {}) {
  const fields = Object.keys(data).filter((k) => EDITABLE_FIELDS.includes(k));

  const setClauses = ["#updatedAt = :updatedAt"];
  const names = { "#updatedAt": "updatedAt" };
  const values = { ":updatedAt": new Date().toISOString() };

  for (const f of fields) {
    setClauses.push(`#${f} = :${f}`);
    names[`#${f}`] = f; // alias every field to dodge reserved words
    values[`:${f}`] = data[f];
  }

  const { Attributes } = await ddbDocClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { bookId },
      UpdateExpression: `SET ${setClauses.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: "attribute_exists(bookId)",
      ReturnValues: "ALL_NEW",
    })
  );

  return Attributes;
}

async function deleteBook(bookId) {
  const { Attributes } = await ddbDocClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { bookId },
      ReturnValues: "ALL_OLD",
    })
  );
  return Attributes ?? null;
}

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
