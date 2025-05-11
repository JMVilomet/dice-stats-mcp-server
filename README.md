# Dice Stats MCP Server

An MCP (Model Context Protocol) server that provides dice rolling and probability calculation tools for tabletop RPGs.

## Features

- Roll dice using standard dice notation (e.g., `2d6`, `1d20+5`, `3d6-2d4`)
- Calculate probability distributions for dice expressions
- Supports complex dice expressions with mathematical operations (+, -, *, /)

## Installation

### NPX (recommended)

The easiest way to use this tool is via NPX:

```bash
npx @jmvilomet/dice-stats-mcp-server
```

### Global Installation

You can also install it globally:

```bash
npm install -g @jmvilomet/dice-stats-mcp-server
```

Then run:

```bash
dice-stats-mcp-server
```

## Using with MCP Clients

To integrate this MCP server with your MCP client (such as Claude or GPT), add the following configuration to your client's MCP server list:

```json
{
  "mcpServers": {
    "dice-stats": {
      "command": "npx",
      "args": [
        "-y",
        "@jmvilomet/dice-stats-mcp-server"
      ]
    }
  }
}
```

## Tools

The MCP server provides the following tools:

### roll

Rolls dice according to the provided notation.

- Parameter: `notation` (string) - Dice notation to roll (e.g., `2d6`, `1d20+5`, `3d6-2d4`)
- Returns: The result of the dice roll

Example:
```
roll("3d6+2")
```

### stat

Calculates probability distribution for the provided dice notation.

- Parameter: `notation` (string) - Dice notation to analyze (e.g., `2d6`, `1d20+5`, `3d6-2d4`)
- Returns: The probability distribution for each possible outcome

Example:
```
stat("2d6")
```

## Dice Notation

The server supports the following dice notation:

- Basic dice: `NdS` (e.g., `1d6`, `2d10`, `3d4`)
- Modifiers: `NdS+M` or `NdS-M` (e.g., `1d20+5`, `3d6-2`)
- Multiple dice groups: `NdS+MdT` (e.g., `1d6+2d4`)
- Mathematical operations: +, -, *, / (e.g., `2d6*3`, `(1d8+2)/2`)

## Development

### Setup

```bash
git clone https://github.com/JMVilomet/dice-stats-mcp-server.git
cd dice-stats-mcp-server
npm install
```

### Build

```bash
npm run build
```

### Run Locally

```bash
npm start
```

## License

MIT 