import ReactDOM from "react-dom/client";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";
import "@/styles/globals.scss";
import App from "./App";
import {ThemeProvider} from "./components/Layout/theme-provider";
import {QueryClient, QueryClientProvider} from "react-query";
const queryClient = new QueryClient({defaultOptions: {queries: {refetchOnWindowFocus: false}}});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/*" element={<App />} />
    </Route>
  )
);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer theme="colored" stacked />
    </QueryClientProvider>
  </ThemeProvider>
);

