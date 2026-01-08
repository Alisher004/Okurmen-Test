import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import LevelSelect from "./pages/LevelSelect";
import Test from "./pages/Test";
import Result from "./pages/Result";
import LanguageSwitcher from "./components/LanguageSwitcher";
import AdminLogin from "./admin/AdminLogin";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminDashboard from "./admin/Dashboard";
import Questions from "./admin/Questions";
import Tests from "./admin/Tests";

function App() {
  return (
    <div>
      <header>
        <img src="/logo.png" alt="" />
        <LanguageSwitcher />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/level" element={<LevelSelect />} />
          <Route path="/test" element={<Test />} />
          <Route path="/result" element={<Result />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="questions" element={<Questions />} />
            <Route path="tests" element={<Tests />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;