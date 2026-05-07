import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout";
import { LoginPage } from "./features/auth/login-page";
import { DashboardPage } from "./features/dashboard/dashboard-page";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout>}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
