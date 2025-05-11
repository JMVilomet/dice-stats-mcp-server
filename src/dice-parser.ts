interface DiceRoll {
  count: number;
  sides: number;
}

export type DiceNode = 
  | { type: 'dice', value: DiceRoll }
  | { type: 'number', value: number }
  | { type: 'operation', operator: '+' | '-' | '*' | '/', left: DiceNode, right: DiceNode };

/**
 * Parses a dice notation string into a structured AST for evaluation
 */
export function parseDiceNotation(notation: string): DiceNode {
  // Remove all whitespace
  notation = notation.replace(/\s+/g, '');

  return parseExpression(notation);
}

/**
 * Parse an expression with addition and subtraction
 */
function parseExpression(notation: string): DiceNode {
  let result: DiceNode;
  let position = 0;

  // First, find all the terms (things separated by + or -)
  const terms: { operator: '+' | '-', position: number }[] = [];
  let depth = 0;

  for (let i = 0; i < notation.length; i++) {
    const char = notation[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (depth === 0 && (char === '+' || char === '-') && i > 0) {
      terms.push({ operator: char as '+' | '-', position: i });
    }
  }

  if (terms.length === 0) {
    // If no + or - is found, parse as a term
    return parseTerm(notation);
  }

  // Start with the first term
  let currentNode = parseTerm(notation.substring(0, terms[0].position));

  // Add or subtract the subsequent terms
  for (let i = 0; i < terms.length; i++) {
    const { operator, position } = terms[i];
    const nextPosition = i + 1 < terms.length ? terms[i + 1].position : notation.length;
    const right = parseTerm(notation.substring(position + 1, nextPosition));

    currentNode = {
      type: 'operation',
      operator,
      left: currentNode,
      right
    };
  }

  return currentNode;
}

/**
 * Parse a term (multiplication and division)
 */
function parseTerm(notation: string): DiceNode {
  if (!notation) throw new Error("Empty term notation");

  let depth = 0;
  const terms: { operator: '*' | '/', position: number }[] = [];

  for (let i = 0; i < notation.length; i++) {
    const char = notation[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (depth === 0 && (char === '*' || char === '/')) {
      terms.push({ operator: char as '*' | '/', position: i });
    }
  }

  if (terms.length === 0) {
    // If no * or / is found, parse as a factor
    return parseFactor(notation);
  }

  // Start with the first factor
  let currentNode = parseFactor(notation.substring(0, terms[0].position));

  // Multiply or divide the subsequent factors
  for (let i = 0; i < terms.length; i++) {
    const { operator, position } = terms[i];
    const nextPosition = i + 1 < terms.length ? terms[i + 1].position : notation.length;
    const right = parseFactor(notation.substring(position + 1, nextPosition));

    currentNode = {
      type: 'operation',
      operator,
      left: currentNode,
      right
    };
  }

  return currentNode;
}

/**
 * Parse a factor (dice, number, or parenthesized expression)
 */
function parseFactor(notation: string): DiceNode {
  notation = notation.trim();
  
  // Check for parentheses
  if (notation.startsWith('(') && notation.endsWith(')')) {
    return parseExpression(notation.substring(1, notation.length - 1));
  }

  // Check for dice notation
  const diceMatch = notation.match(/^(\d+)d(\d+)$/);
  if (diceMatch) {
    return {
      type: 'dice',
      value: {
        count: parseInt(diceMatch[1]),
        sides: parseInt(diceMatch[2])
      }
    };
  }

  // Check for number
  const numberMatch = notation.match(/^(\d+)$/);
  if (numberMatch) {
    return {
      type: 'number',
      value: parseInt(numberMatch[1])
    };
  }

  throw new Error(`Invalid dice notation: ${notation}`);
}

/**
 * Roll a specific die (e.g., d6, d20)
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Evaluates a parsed dice expression by actually rolling dice
 */
export function evaluateDiceExpression(node: DiceNode): number {
  switch (node.type) {
    case 'dice':
      let total = 0;
      for (let i = 0; i < node.value.count; i++) {
        total += rollDie(node.value.sides);
      }
      return total;
    
    case 'number':
      return node.value;
    
    case 'operation':
      const left = evaluateDiceExpression(node.left);
      const right = evaluateDiceExpression(node.right);
      
      switch (node.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return Math.floor(left / right);
        default: throw new Error(`Unknown operator: ${node.operator}`);
      }
  }
}

/**
 * Calculate all possible outcomes and their probabilities
 */
export function calculateProbabilities(node: DiceNode): Map<number, number> {
  const outcomes = new Map<number, number>();
  
  // Helper function to recursively calculate probabilities
  function calculateOutcomesRecursive(node: DiceNode, currentOutcomes: Map<number, number>): Map<number, number> {
    switch (node.type) {
      case 'dice': {
        const { count, sides } = node.value;
        
        // Start with an empty map if we're at the beginning
        if (currentOutcomes.size === 0) {
          currentOutcomes.set(0, 1);
        }
        
        // For each die, calculate all possible outcomes
        for (let i = 0; i < count; i++) {
          const newOutcomes = new Map<number, number>();
          
          // For each current outcome
          for (const [outcome, freq] of currentOutcomes.entries()) {
            // Add each possible die result
            for (let face = 1; face <= sides; face++) {
              const newOutcome = outcome + face;
              const newFreq = (newOutcomes.get(newOutcome) || 0) + freq;
              newOutcomes.set(newOutcome, newFreq);
            }
          }
          
          currentOutcomes = newOutcomes;
        }
        
        return currentOutcomes;
      }
      
      case 'number': {
        // For a constant, just add it to each outcome
        const newOutcomes = new Map<number, number>();
        
        if (currentOutcomes.size === 0) {
          // If there are no previous outcomes, just set the constant
          newOutcomes.set(node.value, 1);
        } else {
          // Otherwise, add the constant to each outcome
          for (const [outcome, freq] of currentOutcomes.entries()) {
            newOutcomes.set(outcome + node.value, freq);
          }
        }
        
        return newOutcomes;
      }
      
      case 'operation': {
        // Calculate the outcomes for the left side
        const leftOutcomes = calculateOutcomesRecursive(node.left, new Map());
        
        // Calculate the outcomes for the right side
        const rightOutcomes = calculateOutcomesRecursive(node.right, new Map());
        
        // Combine the outcomes according to the operation
        const newOutcomes = new Map<number, number>();
        
        for (const [leftOutcome, leftFreq] of leftOutcomes.entries()) {
          for (const [rightOutcome, rightFreq] of rightOutcomes.entries()) {
            let result: number;
            
            switch (node.operator) {
              case '+': result = leftOutcome + rightOutcome; break;
              case '-': result = leftOutcome - rightOutcome; break;
              case '*': result = leftOutcome * rightOutcome; break;
              case '/': result = Math.floor(leftOutcome / rightOutcome); break;
              default: throw new Error(`Unknown operator: ${node.operator}`);
            }
            
            const freq = leftFreq * rightFreq;
            newOutcomes.set(result, (newOutcomes.get(result) || 0) + freq);
          }
        }
        
        return newOutcomes;
      }
    }
  }
  
  // Start the calculation with an empty set of outcomes
  return calculateOutcomesRecursive(node, new Map());
}

/**
 * Normalize probabilities to sum to 1.0
 */
export function normalizeProbabilities(probabilities: Map<number, number>): Map<number, number> {
  const normalizedProbabilities = new Map<number, number>();
  let total = 0;
  
  // Calculate the total of all frequencies
  for (const freq of probabilities.values()) {
    total += freq;
  }
  
  // Normalize each frequency
  for (const [outcome, freq] of probabilities.entries()) {
    normalizedProbabilities.set(outcome, freq / total);
  }
  
  return normalizedProbabilities;
}

/**
 * Format probability results for display
 */
export function formatProbabilities(probabilities: Map<number, number>): string {
  const results: string[] = [];
  
  // Sort outcomes by value
  const sortedOutcomes = Array.from(probabilities.keys()).sort((a, b) => a - b);
  
  for (const outcome of sortedOutcomes) {
    const probability = probabilities.get(outcome) || 0;
    const percentage = (probability * 100).toFixed(2);
    results.push(`${outcome}: ${percentage}%`);
  }
  
  return results.join('\n');
} 