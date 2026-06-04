import { useState } from "react";

function BookForm({
  initialData = {},
  onSubmit,
  submitText,
}) {
  const [title, setTitle] = useState(
    initialData.title || ""
  );

  const [author, setAuthor] = useState(
    initialData.author || ""
  );

  const [category, setCategory] = useState(
    initialData.category || ""
  );

  const [description, setDescription] =
    useState(
      initialData.description || ""
    );

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      title,
      author,
      category,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>

        <br />

        <input
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />
      </div>

      <br />

      <div>
        <label>Author</label>

        <br />

        <input
          type="text"
          value={author}
          onChange={(e) =>
            setAuthor(e.target.value)
          }
          required
        />
      </div>

      <br />

      <div>
        <label>Category</label>

        <br />

        <input
          type="text"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        />
      </div>

      <br />

      <div>
        <label>Description</label>

        <br />

        <textarea
          rows="5"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />
      </div>

      <br />

      <button type="submit">
        {submitText}
      </button>
    </form>
  );
}

export default BookForm;