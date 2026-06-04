import { useEffect, useState } from "react";

import { getBooks } from "../api/bookApi";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BookList from "../components/BookList";

function HomePage() {
  const [books, setBooks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response =
          await getBooks();

        setBooks(response.data);
      }catch {
  setError("Failed to load books.");
} finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

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
      <h1>Book Catalog</h1>

      <BookList books={books} />
    </div>
  );
}

export default HomePage;