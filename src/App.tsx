import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import LevelSelect from "./pages/LevelSelect";
import Test from "./pages/Test";
import Result from "./pages/Result";
import LanguageSwitcher from "./components/LanguageSwitcher";

function App() {
  return (
    <div>
      <header>
        <h1>Exam</h1>
        <LanguageSwitcher />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/level" element={<LevelSelect />} />
          <Route path="/test" element={<Test />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;