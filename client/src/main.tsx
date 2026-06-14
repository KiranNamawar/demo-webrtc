import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SocketProvider } from "./socketContext.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App.tsx";
import Room from "./Room.tsx";

const router = createBrowserRouter([
  {
    index: true,
    Component: App,
  },
  {
    path: "/:room",
    Component: Room,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </StrictMode>,
);
