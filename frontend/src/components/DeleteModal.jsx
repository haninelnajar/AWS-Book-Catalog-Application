function DeleteModal({
  onConfirm,
  onCancel,
}) {
  return (
    <div
      style={{
        border: "1px solid red",
        padding: "1rem",
        marginTop: "1rem",
      }}
    >
      <p>
        Are you sure you want to
        delete this book?
      </p>

      <button
        onClick={onConfirm}
        style={{
          marginRight: "1rem",
        }}
      >
        Yes
      </button>

      <button onClick={onCancel}>
        No
      </button>
    </div>
  );
}

export default DeleteModal;