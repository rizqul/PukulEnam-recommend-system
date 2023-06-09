import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import RequestWriter from "./pages/requestWriter";
import GetWriter from "./pages/getWriter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/request-writer" exact element={<RequestWriter />} />
        <Route path="/get-writer/:id" exact element={<GetWriter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
