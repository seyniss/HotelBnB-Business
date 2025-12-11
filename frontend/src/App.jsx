import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BusinessAuthProvider } from "./context/BusinessAuthContext";
import businessRoutes from "./router/businessRoutes";
import "./styles/index.scss";

function App() {
  return (
    <BrowserRouter>
      <BusinessAuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/business/login" replace />} />
          {businessRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children?.map((child, childIndex) => (
                <Route
                  key={childIndex}
                  index={child.index}
                  path={child.path}
                  element={child.element}
                />
              ))}
            </Route>
          ))}
        </Routes>
      </BusinessAuthProvider>
    </BrowserRouter>
  );
}

export default App;
