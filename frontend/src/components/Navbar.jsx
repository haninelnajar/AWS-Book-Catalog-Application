import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-logo"
        >
          📚 Book Catalog
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className="nav-link"
          >
            Home
          </Link>

          <Link
            to="/books/new"
            className="nav-link"
          >
            Add Book
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;