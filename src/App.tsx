import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { AnimeDetalhe } from "./pages/AnimeDetalhe";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/anime/:id" element={<AnimeDetalhe />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;