import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            zIndex: 999999,
            fontSize: "14px",
          },
        }}
      />
      <AppRoutes />
    </>
  );
}
