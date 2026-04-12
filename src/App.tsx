import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { AnimeDetalhe } from "./pages/AnimeDetalhe";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/anime/:id" element={<AnimeDetalhe />} />

          {/* Novas Rotas de Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;