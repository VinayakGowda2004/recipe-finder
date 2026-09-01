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

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{
          background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        `}</style>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: "#FBF3E7",
          }}
          className="text-lg font-semibold"
        >
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#1C1620" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .rf-font { font-family: 'Inter', sans-serif; }
        .rf-display { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* ✅ Navbar */}
      {userRole && (
        <nav
          className="flex justify-between items-center px-5 sm:px-8 py-4"
          style={{
            background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
          }}
        >
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => navigate(userRole === "admin" ? "/admin" : "/home")}
              className="rf-display text-sm sm:text-base font-semibold px-4 py-2 rounded-full transition-colors"
              style={{ color: "#FBF3E7", backgroundColor: "rgba(251,243,231,0.1)" }}
            >
              {userRole === "admin" ? "Admin Panel" : "Home"}
            </button>
            {userRole === "user" && (
              <button
                onClick={() => navigate("/history")}
                className="rf-display text-sm sm:text-base font-semibold px-4 py-2 rounded-full transition-colors"
                style={{ color: "#FBF3E7", backgroundColor: "rgba(251,243,231,0.1)" }}
              >
                History
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rf-display text-sm sm:text-base font-semibold px-4 sm:px-5 py-2 rounded-full transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: "#FFB648", color: "#1C1620" }}
          >
            Logout
          </button>
        </nav>
      )}

      {/* ✅ Main Content */}
      <div className="flex-grow">
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
      <footer
        className="text-center py-5"
        style={{ backgroundColor: "#1C1620" }}
      >
        <p
          className="rf-font text-sm"
          style={{ color: "rgba(251,243,231,0.55)" }}
        >
          © 2026 PantryPlate — recipes from what's already in your kitchen.
        </p>
      </footer>
    </div>
  );
}

export default App;