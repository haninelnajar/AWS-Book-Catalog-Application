

const { randomUUID } = require("crypto");
const {
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const {
  ddbDocClient,
  TABLE_NAME,
  CATEGORY_INDEX,
} = require("../config/dynamoClient");

// Fields a caller is allowed to set/change. Anything else is ignored.
const EDITABLE_FIELDS = ["title", "author", "category", "description", "imageKey", "resizedImageKey"];

/**
 * CREATE — createBook(book)
 * Inserts a new book and returns the full stored record (incl. generated bookId).
 * `imageKey` is the S3 key Person 2 gets after uploading the cover image;
 * `resizedImageKey` is usually null at creation and filled later by the Lambda.
 */
async function createBook(book) {
  if (!book || !book.title || !book.author) {
    throw new Error("createBook: 'title' and 'author' are required");
  }

  const now = new Date().toISOString();
  const item = {
    bookId: randomUUID(),
    title: book.title,
    author: book.author,
    category: book.category ?? "Uncategorized",
    description: book.description ?? "",
    imageKey: book.imageKey ?? null,
    resizedImageKey: book.resizedImageKey ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(bookId)", // guard vs UUID collision
    })
  );

  return item;
}

/**
 * READ ALL — getAllBooks()
 * Returns every book (for the list/table view). Scans with pagination so you
 * get the whole table even if it spans multiple 1 MB pages.
 */
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

/**
 * READ ONE — getBookById(bookId)
 * Returns a single book, or null if not found.
 */
async function getBookById(bookId) {
  const { Item } = await ddbDocClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { bookId } })
  );
  return Item ?? null;
}

/**
 * UPDATE — updateBook(bookId, data)
 * Partial update: pass only the fields you want to change, e.g.
 *   updateBook(id, { title: "New Title", category: "Fiction" })
 * `updatedAt` is always refreshed. Throws if the book doesn't exist.
 * Returns the full updated book.
 */
async function updateBook(bookId, data = {}) {
  const fields = Object.keys(data).filter((k) => EDITABLE_FIELDS.includes(k));

  const setClauses = ["#updatedAt = :updatedAt"];
  const names = { "#updatedAt": "updatedAt" };
  const values = { ":updatedAt": new Date().toISOString() };

  for (const f of fields) {
    setClauses.push(`#${f} = :${f}`);
    names[`#${f}`] = f; // alias every field to dodge DynamoDB reserved words
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

/**
 * DELETE — deleteBook(bookId)
 * Removes a book and returns the deleted record (so the backend can read
 * imageKey / resizedImageKey off it and delete the matching S3 objects).
 * Returns null if there was nothing to delete.
 */
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

/**
 * BONUS (optional) — getBooksByCategory(category)
 * Not in the core spec, but the category GSI is already there, so this gives
 * you an efficient "filter by category, newest first" query for free.
 * Safe to ignore if the backend doesn't need it.
 */
async function getBooksByCategory(category) {
  const { Items } = await ddbDocClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: CATEGORY_INDEX,
      KeyConditionExpression: "category = :c",
      ExpressionAttributeValues: { ":c": category },
      ScanIndexForward: false, // newest first
    })
  );
  return Items ?? [];
}

/**
 * Helper for the Lambda/backend to attach the resized cover key once the
 * S3 -> Lambda resize step has finished.
 */
async function setResizedImageKey(bookId, resizedImageKey) {
  return updateBook(bookId, { resizedImageKey });
}

module.exports = {
  // core spec
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  // extras
  getBooksByCategory,
  setResizedImageKey,
};
