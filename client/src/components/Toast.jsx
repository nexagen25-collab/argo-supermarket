export default function Toast({ toast }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}