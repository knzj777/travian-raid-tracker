import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RaidDiffCalculator from "./RaidDiffCalculator";
import HowToUse from "./Pages/HowToUse";

function App() {
  return (
    <Router basename="/travian-raid-tracker">
      <Routes>
        <Route path="/" element={<RaidDiffCalculator />} />
        <Route path="/how-to-use" element={<HowToUse />} />
      </Routes>
    </Router>
  );
}

export default App;
