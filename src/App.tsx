import { Toaster } from "react-hot-toast";
import "./App.scss";
import { LotteryCard } from "./components/LotteryCard";

const App = () => {
  return (
    <div className="app">
      <LotteryCard />
      <Toaster
        toastOptions={{
          success: {
            className: "success-toast custom-toast",
          },
          error: {
            className: "error-toast custom-toast",
          },
          loading: {
            className: "loading-toast custom-toast",
          },
        }}
      />
    </div>
  );
};

export default App;
