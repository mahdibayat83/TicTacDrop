import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import importAllPages from "./utils/importPages";

const pages = importAllPages(require.context("./pages", true, /\.(tsx|jsx|ts|js)$/));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {Object.entries(pages).map(([pageName, PageComponent]) => {
          const path = `/${pageName.toLowerCase()}`;

          return (
            <Route
              key={pageName}
              path={path}
              element={<PageComponent />}
            />
          );
        })}

        
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
