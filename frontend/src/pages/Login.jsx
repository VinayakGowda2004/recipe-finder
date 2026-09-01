import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";

const Login = ({ setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default to "user"
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await loginUser({ email, password, role });

      // ✅ Store role & token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ✅ Update state & navigate
      setUserRole(data.role);
      alert(data.message);
      navigate(data.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .rf-font { font-family: 'Inter', sans-serif; }
        .rf-display { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* decorative line art */}
      <svg
        className="absolute top-6 right-6 pointer-events-none opacity-30"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
      >
        <path
          d="M10 140 C 60 60, 100 100, 150 20"
          stroke="#FBF3E7"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="30" r="3" fill="#FBF3E7" />
      </svg>

      <div
        className="relative w-full rounded-3xl p-8 sm:p-10"
        style={{ maxWidth: "420px", backgroundColor: "rgba(0,0,0,0.32)" }}
      >
        <span
          className="rf-display text-lg block mb-8"
          style={{ color: "#FBF3E7" }}
        >
          Pantry<span style={{ color: "#FFB648" }}>Plate</span>
        </span>

        <h1
          className="rf-display text-3xl sm:text-4xl mb-2"
          style={{ color: "#FBF3E7" }}
        >
          Welcome back
        </h1>
        <p
          className="rf-font text-sm mb-8"
          style={{ color: "rgba(251,243,231,0.7)" }}
        >
          Log in to find what's cookable tonight.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rf-font w-full px-5 py-3 rounded-2xl border-0 focus:outline-none text-base"
            style={{ backgroundColor: "#FBF3E7", color: "#1C1620" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rf-font w-full px-5 py-3 rounded-2xl border-0 focus:outline-none text-base"
            style={{ backgroundColor: "#FBF3E7", color: "#1C1620" }}
          />

          {/* Role toggle */}
          <div
            className="flex p-1 rounded-2xl"
            style={{ backgroundColor: "rgba(251,243,231,0.12)" }}
          >
            {["user", "admin"].map((r) => (
              <label key={r} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="sr-only"
                />
                <div
                  className="rf-font text-center py-2 rounded-xl text-sm capitalize transition-colors"
                  style={
                    role === r
                      ? { backgroundColor: "#FFB648", color: "#1C1620" }
                      : { color: "rgba(251,243,231,0.7)" }
                  }
                >
                  {r}
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="rf-display w-full py-3 rounded-2xl font-semibold transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: "#FFB648", color: "#1C1620" }}
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="rf-font w-full text-center text-sm underline underline-offset-4"
            style={{ color: "rgba(251,243,231,0.75)" }}
          >
            Don't have an account? Create one
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
