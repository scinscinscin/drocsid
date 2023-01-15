import "./globals.scss";
import { Index } from "./pages";
import { About } from "./pages/about";
import { Routes, Route, BrowserRouter, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session, SessionContext } from "./utils/SessionController";
import { httpClient } from "./utils/trpcClient";
import { ToastContainer } from "react-toastify";

export default function () {
  const [user, setUser] = useState<Session | null>(null);

  useEffect(() => {
    httpClient.user.getUser.query().then((u) => {
      setUser(u);
    });
  }, []);

  return (
    <SessionContext.Provider value={[user, setUser]}>
      <ToastContainer />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}
