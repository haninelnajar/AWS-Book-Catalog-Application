import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  getBook,
  deleteBook,
} from "../api/bookApi";

import LoadingSpinner from "../components/LoadingSpinner";

import ErrorMessage from "../components/ErrorMessage";

import DeleteModal from "../components/DeleteModal";

function BookDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [book, setBook] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  useEffect(() => {
    async function fetchBook() {
      try {
        const response =
          await getBook(id);

        setBook(response.data);
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load book."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  async function handleDelete() {
    try {
      await deleteBook(book.bookId);

      navigate("/");
    } catch (err) {
      console.error(err);

      alert("Failed to delete book");
    }
  }

  if (loading)
    return <LoadingSpinner />;

  if (error)
    return (
      <ErrorMessage
        message={error}
      />
    );

  if (!book)
    return (
      <ErrorMessage
        message="Book not found."
      />
    );

  return (
    <div>
      <h1>{book.title}</h1>

      <p>
        <strong>Author:</strong>{" "}
        {book.author}
      </p>

      <p>
        <strong>Category:</strong>{" "}
        {book.category}
      </p>

      <p>
        <strong>Description:</strong>{" "}
        {book.description}
      </p>

      <br />

      <button
        onClick={() =>
          navigate(
            `/books/edit/${book.bookId}`
          )
        }
        style={{
          marginRight: "1rem",
        }}
      >
        Edit Book
      </button>

      <button
        onClick={() =>
          setShowDeleteModal(true)
        }
      >
        Delete Book
      </button>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() =>
            setShowDeleteModal(false)
          }
        />
      )}
    </div>
  );
}

export default BookDetailsPage;