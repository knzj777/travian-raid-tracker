import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import RaidDiffCalculator from "./RaidDiffCalculator";
import HowToUse from "./Pages/HowToUse";
import History from "./Pages/History";
import Timer from "./Pages/Timer";
import TimeCalculator from "./Pages/TimeCalculator";

function App() {
  return (
    <Router basename="/travian-raid-tracker">
      <Routes>
        <Route path="/" element={<RaidDiffCalculator />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/history" element={<History />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/time-calculator" element={<TimeCalculator />} />
      </Routes>
    </Router>
  );
}

export default App;
