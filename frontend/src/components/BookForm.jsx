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

  const [category, setCategory] =
    useState(
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
      <div className="form-group">
        <label className="form-label">
          Title
        </label>

        <input
          className="form-input"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Author
        </label>

        <input
          className="form-input"
          value={author}
          onChange={(e) =>
            setAuthor(e.target.value)
          }
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Genre
        </label>

        <select
          className="form-input"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="">
            Select Genre
          </option>

          <option value="Fiction">
            Fiction
          </option>

          <option value="Non-Fiction">
            Non-Fiction
          </option>

          <option value="Fantasy">
            Fantasy
          </option>

          <option value="Science Fiction">
            Science Fiction
          </option>

          <option value="Mystery">
            Mystery
          </option>

          <option value="Thriller">
            Thriller
          </option>

          <option value="Romance">
            Romance
          </option>

          <option value="Biography">
            Biography
          </option>

          <option value="History">
            History
          </option>

          <option value="Technology">
            Technology
          </option>

          <option value="Psychology">
            Psychology
          </option>

          <option value="Business">
            Business
          </option>

          <option value="Self Development">
            Self Development
          </option>

          <option value="Memoir">
            Memoir
          </option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          Description
        </label>

        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />
      </div>

      <button
        type="submit"
        className="submit-btn"
      >
        {submitText}
      </button>
    </form>
  );
}

export default BookForm;