// Quick test to verify empty defender detection
const fs = require("fs");
const path = require("path");

// Read the parser file and convert it to CommonJS
const parserPath = path.join(
  __dirname,
  "src",
  "utils",
  "attackReportParser.js"
);
let parserContent = fs.readFileSync(parserPath, "utf8");

// Convert ES6 exports to CommonJS
parserContent = parserContent.replace(/export function/g, "function");
parserContent = parserContent.replace(/export const/g, "const");

// Add module.exports at the end
parserContent +=
  "\nmodule.exports = { parseAttackReport, validateAttackReport };";

// Write temporary file
const tempPath = path.join(__dirname, "temp-parser.js");
fs.writeFileSync(tempPath, parserContent);

// Import the converted parser
const { parseAttackReport } = require("./temp-parser.js");

const text = `Ravenna attacks 06H Master of Seas
19.10.25, 01:47:11

Attacker
[WILD] Kamikaze from village Ravenna
Clubswinger	Spearman	Axeman	Scout	Paladin	Teutonic Knight	Ram	Catapult	Chief	Settler	 Hero
1000	500	200	50	100	50	10	5	1	0	1
100	50	20	5	10	5	1	0	0	0	0
50	25	10	2	5	2	0	0	0	0	0
Information	
Makeshift Wall level 20 destroyed
Command Center level 20 destroyed
Bounty	
21704
11455
28326
49688
111173 / 898685

DEFENDER 1
[Boats] NoShip Sherlock from village 06H Master of Seas
Clubswinger	Spearman	Axeman	Scout	Paladin	Teutonic Knight	Ram	Catapult	Chief	Settler	 Hero
1337	0	102	80	480	0	0	0	0	0	0
1337	0	102	80	480	0	0	0	0	0	0
534	0	40	32	192	0	0	0	0	0	0

DEFENDER 2
[] from village

DEFENDER 3
[] from village

DEFENDER 4
[] from village

DEFENDER 5
[] from village

DEFENDER 6
[] from village

DEFENDER 7
[] from village

Statistics
Attacker	Defender
Combat strength	
203,359
8,034
Supply before	
3,062
150
Supply lost	
26
149
Resources lost	
14,170
75,970`;

console.log("=== TESTING EMPTY DEFENDER DETECTION ===");
const result = parseAttackReport(text);

console.log("\nDefender analysis:");
result.defenders.forEach((defender, index) => {
  console.log(`Defender ${index + 1}:`);
  console.log(`  - isEmpty: ${defender.isEmpty}`);
  console.log(`  - player: "${defender.player}"`);
  console.log(`  - village: "${defender.village}"`);
  console.log(`  - alliance: "${defender.alliance}"`);
  console.log(`  - units count: ${Object.keys(defender.units).length}`);
  console.log(`  - hasUnits: ${Object.keys(defender.units).length > 0}`);
  console.log("");
});

// Clean up temp file
fs.unlinkSync(tempPath);
