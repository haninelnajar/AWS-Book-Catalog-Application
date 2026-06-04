function ErrorMessage({ message }) {
  return (
    <div>
      <p style={{ color: "red" }}>
        {message}
      </p>
    </div>
  );
}

export default ErrorMessage;