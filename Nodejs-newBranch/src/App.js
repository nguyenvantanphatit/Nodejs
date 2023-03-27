import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Blog from "./components/Blog";
function App() {
  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Blog />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
