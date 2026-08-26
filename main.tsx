import { createRoot } from "react-dom/client";
import App from "./App";
import './userWorker';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>
)

