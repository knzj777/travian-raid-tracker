const { parseAttackReport } = require("./src/utils/attackReportParser.js");

const text = `08G Cod Save Us raids Doboj
19.10.25, 14:06:21

Attacker
[Boats] NoShip Sherlock from village 08G Cod Save Us
Phalanx	Swordsman	Pathfinder	Theutates Thunder	Druidrider	Haeduan	Ram	Trebuchet	Chieftain	Settler	 Hero
0	0	0	1531	0	0	0	0	0	0	0
0	0	0	13	0	0	0	0	0	0	0
0	0	0	5	0	0	0	0	0	0	0
Bounty	
29771
29770
29770
24539
Defender
[HF] Odysseus95 from village Doboj
Hoplite	Sentinel	Shieldsman	Twinsteel Therion	Elpida Rider	Corinthian Crusher	Ram	Ballista	Ephor	Settler	 Hero
5	30	115	0	0	0	0	0	0	0	0
5	30	114	0	0	0	0	0	0	0	0
0	12	0	0	0	0	0	0	0	0	0
Statistics
Attacker	Defender
Combat strength	
‭203,359‬
‭8,034‬
Supply before	
‭3,062‬
‭150‬
Supply lost	
‭26‬
‭149‬
Resources lost	
‭14,170‬
‭75,970‬`;

console.log("Testing parser...");
const result = parseAttackReport(text);
console.log("Result:", JSON.stringify(result, null, 2));
