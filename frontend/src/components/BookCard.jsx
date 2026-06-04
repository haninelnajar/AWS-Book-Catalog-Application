import { Link } from "react-router-dom";

function BookCard({ book }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h3>{book.title}</h3>

      <p>
        <strong>Author:</strong> {book.author}
      </p>

      <p>
        <strong>Category:</strong>{" "}
        {book.category}
      </p>

      <Link to={`/books/${book.bookId}`}>
        View Details
      </Link>
    </div>
  );
}

export default BookCard;