#!/usr/bin/env node

import { 
  parseDiceNotation, 
  evaluateDiceExpression, 
  calculateProbabilities, 
  normalizeProbabilities,
  formatProbabilities 
} from './dist/dice-parser.js';

function testRoll(notation) {
  console.log(`\n🎲 Rolling: ${notation}`);
  try {
    const diceNode = parseDiceNotation(notation);
    const result = evaluateDiceExpression(diceNode);
    console.log(`Result: ${result}`);
    return result;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

function testStats(notation) {
  console.log(`\n📊 Statistics for: ${notation}`);
  try {
    const diceNode = parseDiceNotation(notation);
    const probabilities = calculateProbabilities(diceNode);
    const normalized = normalizeProbabilities(probabilities);
    const formatted = formatProbabilities(normalized);
    console.log(formatted);
    return formatted;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

// Run tests
console.log("=== DICE STATS TEST UTILITY ===");

// Test basic dice rolls
testRoll("1d6");
testRoll("2d10");
testRoll("3d4+2");
testRoll("3d6-2d6+4");

// Test more complex expressions
testRoll("2d6*3");
testRoll("(1d20+5)/2");

// Test statistics
testStats("1d6");
testStats("2d6");
testStats("1d20+5");
testStats("3d6-2d6");

console.log("\n=== TEST COMPLETE ==="); 