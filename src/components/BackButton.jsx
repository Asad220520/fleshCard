import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "← Назад", className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`px-3 py-1 bg-sky-200 rounded-xl hover:bg-sky-300 ${className}`}
    >
      {label}
    </button>
  );
}
