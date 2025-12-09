# 🌟 EnergyAI Blockchain

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red.svg)

**Energy Token Blockchain for AI Computation and Compute Power**

A futuristic blockchain implementation designed to tokenize energy consumption and incentivize sustainable AI computation. EnergyAI addresses the growing energy concerns around AI infrastructure by creating a transparent, efficient, and eco-friendly system for tracking and trading energy credits.

> **🤝 We Welcome Public Contributions!** Check out our [Contributing Guide](./CONTRIBUTING.md) to get started.

---

## 🚀 Vision

As AI models grow larger and more complex, their energy consumption becomes a critical concern. EnergyAI Blockchain creates a sustainable ecosystem where:

- **Energy is tokenized** and can be traded transparently
- **AI computations are verified** on-chain with proof-of-compute
- **Green energy is incentivized** through bonus rewards
- **Carbon credits** can be purchased and tracked
- **Compute resources** are allocated efficiently

---

## ✨ Key Features

### 🔋 Energy Tokenization
- Convert kilowatt-hours (kWh) to EnergyAI (EAI) tokens
- Dynamic conversion rates: 1 kWh = 10 EAI tokens (base rate)
- Bonus multipliers for renewable energy sources:
  - **Renewable (Solar/Wind)**: 1.5x bonus
  - **Nuclear**: 1.2x bonus
  - **Mixed/Fossil**: 1.0x (no bonus)

### 🤖 AI Compute Verification
- Track AI workload types (training, inference, general)
- Record GPU/TPU compute hours on-chain
- Estimate energy consumption per compute unit
- Proof-of-compute mechanism for validation

### 🌱 Carbon Credit System
- Purchase carbon offsets directly on-chain
- Track total carbon footprint per block
- Incentivize carbon-negative operations
- Transparent carbon accounting

### ⛏️ Proof-of-Compute Mining
- Energy-aware mining difficulty
- Rewards adjusted based on:
  - Energy source (renewable vs fossil)
  - Efficiency score (0-100)
  - AI workload type
- Mining metrics tracked (time, energy, hash rate)

### 💱 Smart Transactions
- **Transfer**: Standard token transfers
- **Energy Trade**: P2P energy trading
- **Compute Allocation**: AI resource allocation
- **Carbon Credit**: Carbon offset purchases
- All transactions cryptographically signed (secp256k1)

---

## 📦 Project Structure

```
NewCoin/
├── src/
│   ├── core/
│   │   ├── Block.js          # Block implementation with energy tracking
│   │   ├── Blockchain.js     # Main blockchain with energy features
│   │   └── Transaction.js    # Transaction types (transfer, energy, compute, carbon)
│   ├── wallet/
│   │   └── Wallet.js         # Wallet management with key generation
│   ├── index.js              # Main demo showcasing all features
│   ├── miner.js              # Interactive mining CLI
│   ├── node.js               # REST API server
│   └── test.js               # Comprehensive test suite
├── package.json
└── README.md
```

---

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

```bash
# Navigate to project directory
cd d:\Code\Blockchain\NewCoin

# Install dependencies
npm install

# Run the demo
npm start

# Run tests
npm test

# Start interactive miner
npm run miner

# Start API server
npm run node
```

---

## 🎮 Usage Examples

### 1. Basic Demo

Run the comprehensive demo to see all features in action:

```bash
npm start
```

This will demonstrate:
- Energy tokenization with renewable sources
- AI compute allocation for LLM training
- Carbon credit purchases
- P2P energy trading
- Blockchain statistics and leaderboards

### 2. Interactive Mining

Start the interactive miner CLI:

```bash
npm run miner
```

Choose from different energy sources:
- Renewable energy (highest rewards)
- Mixed energy (moderate rewards)
- Fossil fuel (lowest rewards)

### 3. REST API Server

Start the blockchain node with REST API:

```bash
npm run node
```

The server runs on `http://localhost:3000` with endpoints:

#### Get Blockchain Stats
```bash
curl http://localhost:3000/stats
```

#### Tokenize Energy
```bash
curl -X POST http://localhost:3000/energy/tokenize \
  -H "Content-Type: application/json" \
  -d '{
    "providerAddress": "YOUR_ADDRESS",
    "energyAmount": 100,
    "energySource": "renewable"
  }'
```

#### Mine a Block
```bash
curl -X POST http://localhost:3000/mine \
  -H "Content-Type: application/json" \
  -d '{
    "minerAddress": "YOUR_ADDRESS",
    "energyData": {
      "energySource": "renewable",
      "efficiencyScore": 90
    }
  }'
```

#### Check Balance
```bash
curl http://localhost:3000/balance/YOUR_ADDRESS
```

---

## 💻 Code Examples

### Create a Wallet

```javascript
import Wallet from './src/wallet/Wallet.js';

const wallet = new Wallet();
console.log('Address:', wallet.getAddress());
console.log('Private Key:', wallet.getPrivateKey());
```

### Tokenize Energy

```javascript
import Blockchain from './src/core/Blockchain.js';

const blockchain = new Blockchain();

// Tokenize 100 kWh of solar energy
const tokens = blockchain.tokenizeEnergy(
  walletAddress,
  100,        // kWh
  'renewable' // energy source
);

console.log(`Generated ${tokens} EAI tokens`);
```

### Create and Sign Transaction

```javascript
import Transaction from './src/core/Transaction.js';

const tx = new Transaction(
  fromAddress,
  toAddress,
  amount,
  'transfer'
);

tx.signTransaction(wallet.keyPair);
blockchain.addTransaction(tx);
```

### Allocate AI Compute

```javascript
const computeTx = blockchain.allocateCompute(
  fromAddress,
  toAddress,
  100,        // GPU hours
  'training'  // AI workload type
);

computeTx.signTransaction(wallet.keyPair);
blockchain.addTransaction(computeTx);
```

### Mine a Block

```javascript
blockchain.minePendingTransactions(minerAddress, {
  totalEnergyConsumed: 50,
  aiComputeUnits: 100,
  carbonFootprint: 25,
  energySource: 'renewable',
  efficiencyScore: 90,
  aiWorkloadType: 'training'
});
```

---

## 🔐 Security Features

- **Elliptic Curve Cryptography**: secp256k1 (same as Bitcoin)
- **SHA-256 Hashing**: For block and transaction hashing
- **Digital Signatures**: All transactions must be signed
- **Chain Validation**: Continuous integrity checking
- **Proof-of-Compute**: Prevents spam and ensures work

### 🛡️ Production Security (NEW!)

**⚠️ CRITICAL: Learn from the $55k Google Cloud incident!**

We've implemented comprehensive security features to prevent accidental API key leaks and runaway cloud costs:

#### Secret Management
- ✅ **Google Cloud Secret Manager** integration
- ✅ **AWS Secrets Manager / Parameter Store** support
- ✅ **Azure Key Vault** integration
- ✅ **Never commit secrets** to Git
- ✅ **Runtime secret loading** from secure sources

#### Budget Protection
- ✅ **Daily and monthly spending limits**
- ✅ **Automatic alerts** at configurable thresholds
- ✅ **Emergency shutdown** when limits exceeded
- ✅ **Real-time cost tracking**
- ✅ **Budget status API** endpoint

#### GitHub Security
- ✅ **Secret scanning** configuration included
- ✅ **Push protection** for leaked credentials
- ✅ **Comprehensive .gitignore** patterns
- ✅ **Custom secret patterns** detection

### 📚 Security Documentation

- **[SECURITY.md](./SECURITY.md)** - Complete security guide
  - The $55k horror story and lessons learned
  - Secret Manager setup (GCP, AWS, Azure)
  - Budget alerts and hard caps
  - GitHub secret scanning
  - Key rotation strategies
  - Emergency response procedures

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick setup guide
  - Development environment setup
  - Production deployment with Secret Manager
  - Budget monitoring configuration

### 🚨 Security Checklist

Before deploying to production:

- [ ] ✅ Using Secret Manager (not .env files)
- [ ] ✅ Budget alerts configured in cloud provider
- [ ] ✅ Hard spending caps enabled
- [ ] ✅ GitHub secret scanning enabled
- [ ] ✅ No hardcoded secrets in code
- [ ] ✅ `.env` files in `.gitignore`
- [ ] ✅ API keys rotated every 90 days
- [ ] ✅ Monitoring and logging enabled
- [ ] ✅ Read [SECURITY.md](./SECURITY.md) completely

**Remember**: The $55k incident could have been prevented. Don't let it happen to you!

---

## 📊 Blockchain Statistics

The blockchain tracks comprehensive metrics:

- **Total Blocks**: Number of blocks in the chain
- **Total Energy Tokenized**: Cumulative kWh converted to tokens
- **Total Carbon Offset**: Cumulative CO2 offset in kg
- **Total AI Compute Units**: Cumulative GPU/TPU hours
- **Energy Providers**: Number of registered energy providers
- **Validators**: Number of network validators
- **Chain Validity**: Real-time integrity status

---

## 🌍 Future Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Basic blockchain implementation
- [x] Energy tokenization
- [x] AI compute tracking
- [x] Carbon credit system
- [x] REST API

### Phase 2: Network & Consensus (Q1 2026)
- [ ] Peer-to-peer networking
- [ ] Distributed consensus mechanism
- [ ] Multi-node synchronization
- [ ] WebSocket real-time updates

### Phase 3: Smart Contracts (Q2 2026)
- [ ] Smart contract execution engine
- [ ] Energy trading contracts
- [ ] Automated carbon offsetting
- [ ] Compute resource marketplace

### Phase 4: Integration (Q3 2026)
- [ ] IoT device integration
- [ ] Cloud provider APIs (AWS, Azure, GCP)
- [ ] Energy grid integration
- [ ] AI framework plugins (TensorFlow, PyTorch)

### Phase 5: Ecosystem (Q4 2026)
- [ ] Mobile wallet app
- [ ] Web dashboard
- [ ] Cross-chain bridges
- [ ] Regulatory compliance tools
- [ ] Decentralized exchange (DEX)

---

## 🎯 Use Cases

### 1. AI Training Companies
- Track and optimize energy consumption
- Purchase carbon offsets automatically
- Prove sustainability to stakeholders
- Trade excess compute capacity

### 2. Energy Providers
- Tokenize renewable energy production
- Receive premium for green energy
- Direct sales to AI companies
- Transparent energy accounting

### 3. Data Centers
- Monetize idle compute resources
- Track PUE (Power Usage Effectiveness)
- Participate in energy markets
- Earn rewards for efficiency

### 4. Research Institutions
- Access affordable compute resources
- Track research carbon footprint
- Collaborate on sustainable AI
- Publish energy metrics

### 5. Individual Miners
- Mine with renewable energy
- Earn bonus rewards
- Support sustainable AI
- Participate in governance

---

## 📈 Tokenomics

### EnergyAI Token (EAI)

- **Base Mining Reward**: 100 EAI per block
- **Energy Bonus Multiplier**: 1.0x - 1.95x
  - Renewable energy: 1.5x
  - High efficiency (>80): 1.3x
  - AI inference workload: 1.2x
  - Combined maximum: 1.95x (1.5 × 1.3 × 1.2)

### Energy Conversion
- **Base Rate**: 1 kWh = 10 EAI
- **Renewable Bonus**: 1 kWh = 15 EAI (1.5x)
- **Nuclear Bonus**: 1 kWh = 12 EAI (1.2x)

### Carbon Credits
- **Price**: 0.5 EAI per kg CO2
- **Offset Pool**: Community-managed
- **Verification**: On-chain tracking

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

Tests cover:
- ✅ Blockchain initialization
- ✅ Block mining and validation
- ✅ Transaction signing and verification
- ✅ Energy tokenization with bonuses
- ✅ Wallet creation and management
- ✅ Carbon credit system
- ✅ Compute allocation
- ✅ Chain integrity

---

## 🤝 Contributing

**We Welcome Public Contributions!** 🎉

EnergyAI Blockchain is an open-source project and we actively encourage contributions from the community. Whether you're fixing a bug, adding a feature, improving documentation, or sharing ideas, your contribution matters!

### 📖 How to Contribute

Please read our **[CONTRIBUTING.md](./CONTRIBUTING.md)** guide for detailed instructions on:
- Setting up your development environment
- Code style guidelines
- Commit message conventions
- Pull request process
- Testing requirements

### 🎯 Priority Areas for Contribution

1. **Performance Optimization**
   - Faster mining algorithms
   - Database integration (MongoDB, PostgreSQL)
   - Caching strategies
   - Transaction pool management

2. **Security Enhancements**
   - Penetration testing
   - Vulnerability audits
   - Key management improvements
   - Security audits

3. **Feature Development**
   - Smart contracts execution engine
   - P2P networking implementation
   - Mobile wallet applications
   - Web dashboard and block explorer

4. **Integration & APIs**
   - Cloud provider APIs (AWS, Azure, GCP)
   - IoT device integration
   - Energy grid APIs
   - AI framework plugins

5. **Documentation**
   - API documentation
   - Tutorial videos
   - Use case studies
   - Architecture diagrams

### 🌟 First-Time Contributors

New to open source? No problem! Look for issues labeled `good-first-issue` or `help-wanted`. We're here to help you get started!

### 💬 Get Involved

- **Report Bugs**: Found an issue? [Open a bug report](https://github.com/energyai/blockchain/issues)
- **Suggest Features**: Have an idea? [Create a feature request](https://github.com/energyai/blockchain/issues)
- **Ask Questions**: Join our Discord community or open a discussion
- **Spread the Word**: Star ⭐ the repo and share with others!

**Every contribution, no matter how small, helps build a sustainable future for AI!** 🚀

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Bitcoin**: Inspiration for blockchain architecture
- **Ethereum**: Smart contract concepts
- **Chia**: Proof-of-space-time ideas
- **Energy Web Chain**: Energy sector blockchain insights

---

## 📞 Contact & Support

- **GitHub**: [EnergyAI Blockchain](https://github.com/energyai/blockchain)
- **Discord**: Join our community
- **Twitter**: @EnergyAI_Chain
- **Email**: support@energyai.io

---

## ⚡ Quick Start Checklist

- [ ] Install Node.js and npm
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Run `npm start` to see the demo
- [ ] Run `npm test` to verify installation
- [ ] Explore `npm run miner` for interactive mining
- [ ] Start `npm run node` for API access
- [ ] Read the code examples above
- [ ] Join our community
- [ ] Start building!

---

<div align="center">

**🌟 Building a Sustainable Future for AI 🌟**

*EnergyAI Blockchain - Where Energy Meets Intelligence*

</div>
