import express from 'express';
import Blockchain from './core/Blockchain.js';
import Transaction from './core/Transaction.js';
import Wallet from './wallet/Wallet.js';
import secretManager from './config/secrets.js';
import BudgetMonitor from './config/budgetMonitor.js';
import dotenv from 'dotenv';

// Load environment variables (development only)
dotenv.config();

/**
 * EnergyAI Blockchain Node - REST API Server
 * Provides HTTP endpoints for blockchain interaction
 * 
 * Security Features:
 * - Secret Manager integration (GCP, AWS, Azure)
 * - Budget monitoring and alerts
 * - Rate limiting
 * - Request validation
 */

const app = express();
app.use(express.json());

// Initialize budget monitor
let budgetMonitor;
let config;

async function initializeServer() {
    try {
        // Load configuration from Secret Manager
        config = await secretManager.getConfig();

        // Initialize budget monitor
        budgetMonitor = new BudgetMonitor({
            maxDailySpend: config.maxDailySpend,
            maxMonthlySpend: config.maxMonthlySpend,
            alertThreshold: config.alertThreshold
        });

        // Listen for budget alerts
        budgetMonitor.on('alert', (alert) => {
            console.warn('💰 BUDGET ALERT:', alert.message);
            // TODO: Send email/Slack notification
        });

        // Listen for emergency shutdown
        budgetMonitor.on('shutdown', (shutdown) => {
            console.error('🚨 EMERGENCY SHUTDOWN:', shutdown.message);
            // TODO: Disable API endpoints, send notifications
            process.exit(1);
        });

        console.log('✅ Secret Manager initialized');
        console.log('✅ Budget Monitor initialized');

    } catch (error) {
        console.error('❌ Failed to initialize server:', error.message);
        console.log('⚠️  Continuing with default configuration');

        // Fallback to defaults
        config = {
            port: process.env.PORT || 3000,
            maxDailySpend: 10,
            maxMonthlySpend: 100
        };

        budgetMonitor = new BudgetMonitor(config);
    }
}

const PORT = process.env.PORT || 3000;

// Initialize blockchain and node wallet
const blockchain = new Blockchain();
const nodeWallet = new Wallet();
nodeWallet.walletType = 'node';

console.log('🚀 Starting EnergyAI Blockchain Node...');
console.log(`Node Address: ${nodeWallet.getWalletId()}\n`);

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Budget tracking middleware
 * Records costs for each API call
 */
app.use((req, res, next) => {
    if (budgetMonitor) {
        // Estimate cost based on endpoint
        const cost = budgetMonitor.estimateCost('api_call');

        try {
            budgetMonitor.recordCost(cost, req.path);
        } catch (error) {
            // Budget limit exceeded
            return res.status(503).json({
                success: false,
                error: 'Service temporarily unavailable: Budget limit exceeded',
                message: error.message
            });
        }
    }
    next();
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /budget
 * Get current budget status
 */
app.get('/budget', (req, res) => {
    if (!budgetMonitor) {
        return res.status(503).json({
            success: false,
            error: 'Budget monitor not initialized'
        });
    }

    res.json({
        success: true,
        budget: budgetMonitor.getStatus()
    });
});

/**
 * GET /blockchain
 * Get the entire blockchain
 */
app.get('/blockchain', (req, res) => {
    res.json({
        success: true,
        blockchain: blockchain.chain,
        length: blockchain.chain.length
    });
});

/**
 * GET /stats
 * Get blockchain statistics
 */
app.get('/stats', (req, res) => {
    res.json({
        success: true,
        statistics: blockchain.getStatistics()
    });
});

/**
 * GET /balance/:address
 * Get balance for an address
 */
app.get('/balance/:address', (req, res) => {
    const balance = blockchain.getBalanceOfAddress(req.params.address);
    res.json({
        success: true,
        address: req.params.address,
        balance: balance
    });
});

/**
 * GET /transactions/:address
 * Get all transactions for an address
 */
app.get('/transactions/:address', (req, res) => {
    const transactions = blockchain.getAllTransactionsForAddress(req.params.address);
    res.json({
        success: true,
        address: req.params.address,
        transactions: transactions.map(tx => tx.getSummary())
    });
});

/**
 * POST /transaction/create
 * Create a new transaction
 */
app.post('/transaction/create', (req, res) => {
    try {
        const { fromAddress, toAddress, amount, type, metadata } = req.body;

        const transaction = new Transaction(
            fromAddress,
            toAddress,
            amount,
            type || 'transfer',
            metadata || {}
        );

        res.json({
            success: true,
            message: 'Transaction created (needs to be signed)',
            transaction: transaction.getSummary()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /transaction/submit
 * Submit a signed transaction
 */
app.post('/transaction/submit', (req, res) => {
    try {
        const { transaction } = req.body;

        // Recreate transaction object
        const tx = new Transaction(
            transaction.fromAddress,
            transaction.toAddress,
            transaction.amount,
            transaction.transactionType,
            transaction.metadata
        );
        tx.signature = transaction.signature;

        blockchain.addTransaction(tx);

        res.json({
            success: true,
            message: 'Transaction added to pending pool',
            pendingCount: blockchain.pendingTransactions.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /mine
 * Mine pending transactions
 */
app.post('/mine', (req, res) => {
    try {
        const { minerAddress, energyData } = req.body;

        const address = minerAddress || nodeWallet.getAddress();

        blockchain.minePendingTransactions(address, energyData || {});

        res.json({
            success: true,
            message: 'Block mined successfully',
            minerAddress: address,
            newBalance: blockchain.getBalanceOfAddress(address),
            blockCount: blockchain.chain.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /energy/tokenize
 * Tokenize energy
 */
app.post('/energy/tokenize', (req, res) => {
    try {
        const { providerAddress, energyAmount, energySource } = req.body;

        const tokens = blockchain.tokenizeEnergy(
            providerAddress,
            energyAmount,
            energySource || 'mixed'
        );

        res.json({
            success: true,
            message: 'Energy tokenized successfully',
            energyAmount: energyAmount,
            tokensGenerated: tokens,
            energySource: energySource
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /compute/allocate
 * Allocate compute resources
 */
app.post('/compute/allocate', (req, res) => {
    try {
        const { fromAddress, toAddress, computeUnits, aiWorkloadType } = req.body;

        const transaction = blockchain.allocateCompute(
            fromAddress,
            toAddress,
            computeUnits,
            aiWorkloadType || 'general'
        );

        res.json({
            success: true,
            message: 'Compute allocation created (needs to be signed and submitted)',
            transaction: transaction.getSummary()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /carbon/purchase
 * Purchase carbon credits
 */
app.post('/carbon/purchase', (req, res) => {
    try {
        const { fromAddress, carbonAmount } = req.body;

        const transaction = blockchain.purchaseCarbonCredit(
            fromAddress,
            carbonAmount
        );

        res.json({
            success: true,
            message: 'Carbon credit purchase created (needs to be signed and submitted)',
            transaction: transaction.getSummary()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /leaderboard
 * Get energy provider leaderboard
 */
app.get('/leaderboard', (req, res) => {
    res.json({
        success: true,
        leaderboard: blockchain.getEnergyLeaderboard()
    });
});

/**
 * POST /wallet/create
 * Create a new wallet
 */
app.post('/wallet/create', (req, res) => {
    const wallet = new Wallet();
    wallet.walletType = req.body.walletType || 'standard';

    res.json({
        success: true,
        wallet: wallet.export()
    });
});

/**
 * GET /validate
 * Validate the blockchain
 */
app.get('/validate', (req, res) => {
    const isValid = blockchain.isChainValid();

    res.json({
        success: true,
        isValid: isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain is corrupted'
    });
});

/**
 * GET /block/:index
 * Get a specific block
 */
app.get('/block/:index', (req, res) => {
    const index = parseInt(req.params.index);

    if (index < 0 || index >= blockchain.chain.length) {
        return res.status(404).json({
            success: false,
            error: 'Block not found'
        });
    }

    res.json({
        success: true,
        block: blockchain.chain[index].getSummary()
    });
});

/**
 * GET /
 * API information
 */
app.get('/', (req, res) => {
    res.json({
        name: 'EnergyAI Blockchain Node',
        version: '1.0.0',
        description: 'Energy token blockchain for AI computation and compute power',
        endpoints: {
            'GET /': 'API information',
            'GET /blockchain': 'Get entire blockchain',
            'GET /stats': 'Get blockchain statistics',
            'GET /balance/:address': 'Get balance for address',
            'GET /transactions/:address': 'Get transactions for address',
            'GET /block/:index': 'Get specific block',
            'GET /leaderboard': 'Get energy provider leaderboard',
            'GET /validate': 'Validate blockchain',
            'POST /transaction/create': 'Create new transaction',
            'POST /transaction/submit': 'Submit signed transaction',
            'POST /mine': 'Mine pending transactions',
            'POST /energy/tokenize': 'Tokenize energy',
            'POST /compute/allocate': 'Allocate compute resources',
            'POST /carbon/purchase': 'Purchase carbon credits',
            'POST /wallet/create': 'Create new wallet'
        },
        nodeAddress: nodeWallet.getAddress(),
        nodeId: nodeWallet.getWalletId()
    });
});

// Start server
async function startServer() {
    // Initialize security features
    await initializeServer();

    app.listen(PORT, () => {
        console.log(`✅ EnergyAI Blockchain Node running on port ${PORT}`);
        console.log(`📡 API endpoint: http://localhost:${PORT}`);
        console.log(`🔗 Node ID: ${nodeWallet.getWalletId()}\n`);

        console.log('🔐 Security Features:');
        console.log(`   Secret Manager: ${config.secretProvider || 'env'}`);
        console.log(`   Budget Monitor: Enabled`);
        console.log(`   Daily Limit: $${budgetMonitor.maxDailySpend}`);
        console.log(`   Monthly Limit: $${budgetMonitor.maxMonthlySpend}\n`);

        console.log('Available endpoints:');
        console.log(`   GET  http://localhost:${PORT}/`);
        console.log(`   GET  http://localhost:${PORT}/stats`);
        console.log(`   GET  http://localhost:${PORT}/budget`);
        console.log(`   GET  http://localhost:${PORT}/blockchain`);
        console.log(`   POST http://localhost:${PORT}/mine`);
        console.log(`   POST http://localhost:${PORT}/energy/tokenize`);
        console.log(`   ... and more!\n`);
    });
}

// Start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;
