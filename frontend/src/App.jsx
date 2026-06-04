import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import BookDetailsPage from "./pages/BookDetailsPage";
import CreateBookPage from "./pages/CreateBookPage";
import EditBookPage from "./pages/EditBookPage";

function App() {
  return (
    <>
      <Navbar />

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/books/new"
            element={<CreateBookPage />}
          />

          <Route
            path="/books/:id"
            element={<BookDetailsPage />}
          />

          <Route
            path="/books/edit/:id"
            element={<EditBookPage />}
          />
        </Routes>
      </main>
    </>
  );
}

export default App;