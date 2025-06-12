# Blockchain-Based Logistics Cross-Docking Operations

A comprehensive blockchain solution for managing cross-docking logistics operations using Clarity smart contracts on the Stacks blockchain.

## Overview

This system provides a decentralized platform for managing cross-docking operations, including provider verification, shipment coordination, dock scheduling, inventory management, and efficiency optimization.

## Features

### 🏢 Provider Verification
- Register and verify logistics providers
- Maintain provider ratings and performance metrics
- Track provider shipment history

### 📦 Shipment Coordination
- Create and track shipments between providers
- Manage shipment status updates
- Coordinate cross-docking operations

### 🚛 Dock Scheduling
- Schedule dock time slots
- Manage dock availability and capacity
- Reserve and release dock resources

### 📊 Inventory Management
- Track inventory items and quantities
- Log inventory movements (in/out)
- Monitor inventory across different locations

### ⚡ Efficiency Optimization
- Record performance metrics for docks
- Generate optimization suggestions
- Track efficiency scores and improvements

## Smart Contracts

### 1. Provider Verification Contract (`provider-verification.clar`)
Manages logistics provider registration, verification, and rating system.

**Key Functions:**
- \`register-provider\`: Register a new logistics provider
- \`verify-provider\`: Verify a registered provider
- \`update-rating\`: Update provider performance rating
- \`get-provider\`: Retrieve provider information

### 2. Shipment Coordination Contract (`shipment-coordination.clar`)
Coordinates shipments between different providers and manages shipment lifecycle.

**Key Functions:**
- \`create-shipment\`: Create a new cross-docking shipment
- \`update-shipment-status\`: Update shipment status
- \`assign-dock-slot\`: Assign dock slot to shipment
- \`get-shipment\`: Retrieve shipment details

### 3. Dock Scheduling Contract (`dock-scheduling.clar`)
Manages dock resources, scheduling, and availability.

**Key Functions:**
- \`initialize-dock\`: Set up a new dock facility
- \`reserve-dock-slot\`: Reserve dock time slot
- \`occupy-dock\`: Mark dock as occupied
- \`release-dock\`: Release dock for next use

### 4. Inventory Management Contract (`inventory-management.clar`)
Tracks inventory items, quantities, and movements across the cross-docking facility.

**Key Functions:**
- \`add-inventory-item\`: Add new inventory item
- \`update-inventory-quantity\`: Update item quantities
- \`move-inventory\`: Log inventory movements
- \`get-inventory-item\`: Retrieve inventory information

### 5. Efficiency Optimization Contract (`efficiency-optimization.clar`)
Monitors performance metrics and provides optimization suggestions.

**Key Functions:**
- \`record-performance-metrics\`: Record dock performance data
- \`add-optimization-suggestion\`: Add improvement suggestions
- \`implement-suggestion\`: Mark suggestions as implemented
- \`get-dock-efficiency-rating\`: Calculate efficiency ratings

## Getting Started

### Prerequisites
- Stacks blockchain development environment
- Clarity CLI tools
- Node.js and npm for testing

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd blockchain-logistics-crossdocking
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

### Deployment

Deploy contracts to Stacks blockchain:

\`\`\`bash
# Deploy provider verification contract
clarinet deploy contracts/provider-verification.clar

# Deploy other contracts in order
clarinet deploy contracts/shipment-coordination.clar
clarinet deploy contracts/dock-scheduling.clar
clarinet deploy contracts/inventory-management.clar
clarinet deploy contracts/efficiency-optimization.clar
\`\`\`

## Usage Examples

### Register a Provider
\`\`\`clarity
(contract-call? .provider-verification register-provider "FastLogistics" 'SP1234567890)
\`\`\`

### Create a Shipment
\`\`\`clarity
(contract-call? .shipment-coordination create-shipment u1 u2 "Electronics" u100 u1000)
\`\`\`

### Schedule Dock Time
\`\`\`clarity
(contract-call? .dock-scheduling reserve-dock-slot u1 u500 u1 u50)
\`\`\`

## Architecture

The system follows a modular architecture with separate contracts for each major functionality:

\`\`\`
┌─────────────────────┐    ┌─────────────────────┐
│ Provider            │    │ Shipment            │
│ Verification        │◄──►│ Coordination        │
└─────────────────────┘    └─────────────────────┘
│                          │
▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│ Dock                │    │ Inventory           │
│ Scheduling          │◄──►│ Management          │
└─────────────────────┘    └─────────────────────┘
│                          │
└──────────┐    ┌──────────┘
▼    ▼
┌─────────────────────┐
│ Efficiency          │
│ Optimization        │
└─────────────────────┘
\`\`\`

## Testing

The project includes comprehensive tests using Vitest:

\`\`\`bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

