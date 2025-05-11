#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
  parseDiceNotation, 
  evaluateDiceExpression, 
  calculateProbabilities, 
  normalizeProbabilities,
  formatProbabilities
} from './dice-parser.js';

/**
 * MCP server that provides dice rolling and probability calculation tools
 */
async function main() {
  // Create an MCP server
  const server = new McpServer({
    name: "Dice Stats",
    version: "1.0.0",
    description: "Dice roller and probability calculator for tabletop RPGs"
  });

  // Add the dice roll tool
  server.tool(
    "roll",
    { notation: z.string().describe("Dice notation to roll (e.g., 2d6, 1d20+5, 3d6-2d4)") },
    async ({ notation }) => {
      try {
        // Parse the dice notation
        const diceNode = parseDiceNotation(notation);
        
        // Roll the dice
        const result = evaluateDiceExpression(diceNode);
        
        // Return the result
        return {
          content: [
            { type: "text", text: `🎲 Result: ${result}` }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` }
          ]
        };
      }
    }
  );

  // Add the probability stats tool
  server.tool(
    "stat",
    { notation: z.string().describe("Dice notation to analyze (e.g., 2d6, 1d20+5, 3d6-2d4)") },
    async ({ notation }) => {
      try {
        // Parse the dice notation
        const diceNode = parseDiceNotation(notation);
        
        // Calculate the probabilities
        const rawProbabilities = calculateProbabilities(diceNode);
        const normalizedProbabilities = normalizeProbabilities(rawProbabilities);
        
        // Format the results
        const formattedResults = formatProbabilities(normalizedProbabilities);
        
        // Return the results
        return {
          content: [
            { type: "text", text: `Probability distribution for ${notation}:\n\n${formattedResults}` }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` }
          ]
        };
      }
    }
  );

  // Start receiving messages on stdin and sending messages on stdout
  console.error("Starting Dice Stats MCP Server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dice Stats MCP Server connected");
}

main().catch(error => {
  console.error("Error in MCP server:", error);
  process.exit(1);
}); 