import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";
import { SECTIONS } from "./data/sections";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {SECTIONS.map((section) => (
        <Route
          key={section.id}
          path={section.path}
          element={<SectionPage section={section} />}
        />
      ))}
    </Routes>
  );
}
