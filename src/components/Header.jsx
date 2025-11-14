import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ label = "← Назад", className = "" }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center">
      <div>
        <Link
          to="/"
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500"
        >
          глaвнaя
        </Link>
        <button
          onClick={() => navigate(-1)}
          className={`px-3 py-1 bg-sky-200 rounded-xl hover:bg-sky-300 ${className}`}
        >
          {label}
        </button>
      </div>

      <Link
        to="/learned"
        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500"
      >
        Мои слова
      </Link>
    </header>
  );
};

export default Header;
