import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Result from "./pages/Result";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./admin/AdminLogin";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminDashboard from "./admin/Dashboard";
import { useAuth } from "./context/AuthContext";
import { useI18n } from "./i18n";

function App() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <img src="/logo.png" alt="Logo" style={{ height: "40px", cursor: "pointer" }} onClick={() => navigate("/")} />
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={() => navigate("/admin/login")}
            style={{
              padding: "6px 12px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6366f1";
            }}
          >
            {lang === "ru" ? "Админ" : "Админ"}
          </button>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }}
              >
                {lang === "ru" ? "Войти" : "Кирүү"}
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#10b981";
                }}
              >
                {lang === "ru" ? "Регистрация" : "Катталуу"}
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ef4444";
              }}
            >
              {lang === "ru" ? "Выход" : "Чыгуу"}
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </header>
      <main style={{ minHeight: "calc(100vh - 73px)" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<ProtectedRoute element={<Test />} />} />
          <Route path="/result" element={<ProtectedRoute element={<Result />} />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;