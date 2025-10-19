import {
  parseAttackReport,
  validateAttackReport,
} from "./src/utils/attackReportParser.js";

const defensiveScoutData = `Privacy settings
17
‭1,399‬
‭6,666‬
‭80,000‬
‭24,386‬
‭21,499‬
‭16,859‬
‭80,000‬
‭28,069‬
‭6,649‬
Switch to avatar for sitting
Hero1
Server time:  12:06:07
Alliance banner
Go brrr
 
Link list
FARMLIST
Red swords
Timer
Last Sent
CP check
Send Troops
Send res
Natar
Kirilloid
Ally top 10
Top 10
Incoming attack
Warehouse
Training Queues
Raid tracker
 
Reports
All
Offensive
Defensive
Scouting
Other
Archive
Surrounding
02 - Caledonia R scouts 06H Master of Seas
19.10.25, 01:18:20





Attacker
[WILD] Vladulesq from village 02 - Caledonia R
Legionnaire	Praetorian	Imperian	Equites Legati	Equites Imperatoris	Equites Caesaris	Battering ram	Fire Catapult	Senator	Settler	 Hero
0	0	0	1110	0	0	0	0	0	0	0
0	0	0	164	0	0	0	0	0	0	0
0	0	0	65	0	0	0	0	0	0	0
Information	
Command Center level 20
Rally Point level 19
Makeshift Wall level 14
Defender
[Boats] NoShip Sherlock from village 06H Master of Seas
Mercenary	Bowman	Spotter	Steppe Rider	Marksman	Marauder	Ram	Catapult	Logades	Settler	 Hero
1337	0	102	2460	480	0	16	0	2	0	0
0	0	0	0	0	0	0	0	0	0	0
Defender
Reinforcement
Legionnaire	Praetorian	Imperian	Equites Legati	Equites Imperatoris	Equites Caesaris	Battering ram	Fire Catapult	Senator	Settler	 Hero
348	2966	0	0	0	0	0	0	0	0	0
0	0	0	0	0	0	0	0	0	0	0
Defender
Reinforcement
Clubswinger	Spearman	Axeman	Scout	Paladin	Teutonic Knight	Ram	Catapult	Chief	Settler	 Hero
0	2321	0	0	0	0	0	0	0	0	0
0	0	0	0	0	0	0	0	0	0	0`;

console.log("Testing defensive scout validation...");
const isValid = validateAttackReport(defensiveScoutData);
console.log("Is valid:", isValid);

if (isValid) {
  console.log("Testing defensive scout parsing...");
  const result = parseAttackReport(defensiveScoutData);
  console.log("Parsed result:", JSON.stringify(result, null, 2));
} else {
  console.log("Report failed validation");
}
