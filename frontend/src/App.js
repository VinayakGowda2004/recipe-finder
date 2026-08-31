import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import RecipeDetails from "./pages/RecipeDetails";
import History from "./pages/History"; // ✅ Import History Page

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedRole = localStorage.getItem("role");
      setUserRole(updatedRole);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("searchedRecipes"); // ✅ Clear stored search data
    localStorage.removeItem("ingredients");
    localStorage.removeItem("category");
    sessionStorage.clear(); // ✅ Ensure session storage is also cleared
    setUserRole(null);
    navigate("/");
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-lg font-semibold">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Navbar */}
      {userRole && (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex gap-4">
            <button
              onClick={() => navigate(userRole === "admin" ? "/admin" : "/home")}
              className="text-lg font-semibold hover:text-gray-300"
            >
              🏠 {userRole === "admin" ? "Admin Panel" : "Home"}
            </button>
            {userRole === "user" && (
              <button
                onClick={() => navigate("/history")}
                className="text-lg font-semibold hover:text-gray-300"
              >
                📜 History
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            🚪 Logout
          </button>
        </nav>
      )}

      {/* ✅ Main Content */}
      <div className="flex-grow container mx-auto p-6">
        <Routes>
          <Route path="/" element={userRole ? <Navigate to={userRole === "admin" ? "/admin" : "/home"} /> : <Login setUserRole={setUserRole} />} />
          <Route path="/register" element={!userRole ? <Register /> : <Navigate to="/" />} />
          <Route path="/home" element={userRole === "user" ? <Home /> : <Navigate to="/" />} />
          <Route path="/admin" element={userRole === "admin" ? <AdminPanel /> : <Navigate to="/" />} />
          <Route path="/recipe/:id" element={userRole === "user" ? <RecipeDetails /> : <Navigate to="/" />} />
          <Route path="/history" element={userRole === "user" ? <History /> : <Navigate to="/" />} /> {/* ✅ History Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* ✅ Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-6 shadow-inner">
        <p>&copy; 2025 AI Recipe Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
