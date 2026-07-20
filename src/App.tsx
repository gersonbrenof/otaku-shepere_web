// App.tsx
import {  BrowserRouter, Routes, Route } from "react-router-dom";

//import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { AnimeDetalhe } from "./pages/AnimeDetalhe";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import { Perfil } from "./pages/Perfil";
import { Favoritos } from "./pages/Favoritos";

function App() {
  return (
    // 🟢 O AuthProvider entra aqui, abraçando absolutamente tudo!
    <AuthProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/anime/:id" element={<AnimeDetalhe />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;