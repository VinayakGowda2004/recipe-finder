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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl transform transition duration-300 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600">Please login to continue</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />

          {/* Role Selection */}
          <div className="flex justify-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
                className="form-radio text-blue-500"
              />
              <span className="text-gray-700 font-medium">User</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                className="form-radio text-blue-500"
              />
              <span className="text-gray-700 font-medium">Admin</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full text-center text-blue-600 hover:text-blue-700 font-medium underline transition duration-200"
          >
            Create an account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
