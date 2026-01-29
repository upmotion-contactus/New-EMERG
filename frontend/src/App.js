import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SetupPage from "@/pages/SetupPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App dark">
      <Toaster data-testid="global-toaster" richColors position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SetupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
