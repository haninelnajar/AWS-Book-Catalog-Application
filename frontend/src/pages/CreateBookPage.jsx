import { useNavigate } from "react-router-dom";

import { createBook } from "../api/bookApi";

import BookForm from "../components/BookForm";

function CreateBookPage() {
  const navigate = useNavigate();

  async function handleCreate(
    formData
  ) {
    try {
      const response =
        await createBook(formData);

      navigate(
        `/books/${response.data.book.bookId}`
      );
    } catch (err) {
      console.error(err);

      alert("Failed to create book");
    }
  }

  return (
    <div>
      <h1>Create Book</h1>

      <BookForm
        onSubmit={handleCreate}
        submitText="Create Book"
      />
    </div>
  );
}

export default CreateBookPage;