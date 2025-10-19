const { parseAttackReport } = require("./src/utils/attackReportParser.js");

const testData = `Defender
[HF] Odysseus95 from village DİKBAYIR
Legionnaire	Praetorian	Imperian	Equites Legati	Equites Imperatoris	Equites Caesaris	Battering ram	Fire Catapult	Senator	Settler
?	?	?	?	?	?	?	?	?	?`;

console.log("Testing defender section parsing...");
console.log("Input data:");
console.log(testData);
console.log("\n---");

try {
  const result = parseAttackReport(testData);
  console.log("Result:", JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Error:", error);
}
