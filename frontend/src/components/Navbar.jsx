import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        marginBottom: "2rem",
      }}
    >
      <Link
        to="/"
        style={{
          marginRight: "1rem",
        }}
      >
        Home
      </Link>

      <Link to="/books/new">
        Add Book
      </Link>
    </nav>
  );
}

export default Navbar;