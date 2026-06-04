import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  getBook,
  deleteBook,
} from "../api/bookApi";

import {
  FaEdit,
  FaTrash,
} from "react-icons/fa";

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
    <div className="details-container">
      <div className="details-card">

        <div className="details-cover">
          📖 Cover Coming Soon
        </div>

        <div className="details-content">

          <h1 className="details-title">
            {book.title}
          </h1>

          <p className="details-info">
            <strong>Author:</strong>{" "}
            {book.author}
          </p>

          <p className="details-info">
            <strong>Genre:</strong>{" "}
            {book.category}
          </p>

          <div className="details-description">
            <strong>Description</strong>

            <p>
              {book.description}
            </p>
          </div>

          <div className="actions">

            <button
              className="edit-btn"
              title="Edit Book"
              onClick={() =>
                navigate(
                  `/books/edit/${book.bookId}`
                )
              }
            >
              <FaEdit />
            </button>
            <button
              className="delete-btn"
              title="Delete Book"
              onClick={() =>
                setShowDeleteModal(true)
              }
            >
              <FaTrash />
            </button>

          </div>

        </div>

      </div>

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