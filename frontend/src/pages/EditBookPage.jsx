import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  getBook,
  updateBook,
} from "../api/bookApi";

import BookForm from "../components/BookForm";

import LoadingSpinner from "../components/LoadingSpinner";

import ErrorMessage from "../components/ErrorMessage";

function EditBookPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [book, setBook] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

  async function handleUpdate(
    formData
  ) {
    try {
      await updateBook(id, formData);

      navigate(`/books/${id}`);
    } catch (err) {
      console.error(err);

      alert("Failed to update book");
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

  return (
    <div>
      <h1>Edit Book</h1>

      <BookForm
        initialData={book}
        onSubmit={handleUpdate}
        submitText="Update Book"
      />
    </div>
  );
}

export default EditBookPage;