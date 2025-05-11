#!/usr/bin/env node

import { createInterface } from 'readline';
import { 
  parseDiceNotation, 
  evaluateDiceExpression, 
  calculateProbabilities, 
  normalizeProbabilities,
  formatProbabilities 
} from './dist/dice-parser.js';

// Create readline interface
const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== DICE STATS INTERACTIVE TESTER ===");
console.log("Commands:");
console.log("  roll <dice notation> - Roll dice (e.g., roll 2d6+3)");
console.log("  stat <dice notation> - Calculate probabilities (e.g., stat 2d6)");
console.log("  exit - Exit the program");
console.log("");

function prompt() {
  readline.question('> ', (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      readline.close();
      return;
    }

    // Parse the command
    const match = input.match(/^(roll|stat)\s+(.+)$/i);
    if (!match) {
      console.log("Invalid command. Use 'roll <dice notation>' or 'stat <dice notation>'");
      prompt();
      return;
    }

    const [_, command, notation] = match;
    
    try {
      if (command.toLowerCase() === 'roll') {
        // Roll the dice
        const diceNode = parseDiceNotation(notation);
        const result = evaluateDiceExpression(diceNode);
        console.log(`🎲 Result: ${result}`);
      } else if (command.toLowerCase() === 'stat') {
        // Calculate probabilities
        const diceNode = parseDiceNotation(notation);
        const probabilities = calculateProbabilities(diceNode);
        const normalized = normalizeProbabilities(probabilities);
        const formatted = formatProbabilities(normalized);
        console.log(`📊 Probability distribution for ${notation}:\n${formatted}`);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    prompt();
  });
}

// Start the prompt
prompt(); 