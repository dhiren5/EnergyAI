/**
 * Budget Monitoring and Alert System
 * Prevents runaway cloud costs like the $55k incident
 * 
 * Features:
 * - Real-time cost tracking
 * - Budget alerts
 * - Automatic service shutdown on limit breach
 * - Daily/Monthly spending reports
 */

import EventEmitter from 'events';

class BudgetMonitor extends EventEmitter {
    constructor(config = {}) {
        super();

        this.maxDailySpend = config.maxDailySpend || 10; // USD
        this.maxMonthlySpend = config.maxMonthlySpend || 100; // USD
        this.alertThreshold = config.alertThreshold || 80; // Percentage

        this.dailySpend = 0;
        this.monthlySpend = 0;
        this.lastResetDate = new Date();
        this.lastMonthResetDate = new Date();

        this.isShutdown = false;
        this.alerts = [];

        // Start monitoring
        this.startMonitoring();

        console.log('💰 Budget Monitor initialized');
        console.log(`   Daily limit: $${this.maxDailySpend}`);
        console.log(`   Monthly limit: $${this.maxMonthlySpend}`);
        console.log(`   Alert threshold: ${this.alertThreshold}%`);
    }

    /**
     * Start periodic monitoring
     */
    startMonitoring() {
        // Check every minute
        this.monitoringInterval = setInterval(() => {
            this.checkBudgets();
            this.resetIfNeeded();
        }, 60 * 1000);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }

    /**
     * Record a cost
     * @param {number} amount - Cost in USD
     * @param {string} service - Service name (e.g., 'compute', 'storage', 'api')
     */
    recordCost(amount, service = 'unknown') {
        if (this.isShutdown) {
            console.error('❌ Service is shutdown due to budget limit breach');
            throw new Error('Service shutdown: Budget limit exceeded');
        }

        this.dailySpend += amount;
        this.monthlySpend += amount;

        console.log(`💸 Cost recorded: $${amount.toFixed(4)} (${service})`);
        console.log(`   Daily: $${this.dailySpend.toFixed(2)} / $${this.maxDailySpend}`);
        console.log(`   Monthly: $${this.monthlySpend.toFixed(2)} / $${this.maxMonthlySpend}`);

        this.checkBudgets();
    }

    /**
     * Check if budgets are exceeded
     */
    checkBudgets() {
        const dailyPercentage = (this.dailySpend / this.maxDailySpend) * 100;
        const monthlyPercentage = (this.monthlySpend / this.maxMonthlySpend) * 100;

        // Check daily limit
        if (dailyPercentage >= 100) {
            this.triggerShutdown('daily', this.dailySpend, this.maxDailySpend);
        } else if (dailyPercentage >= this.alertThreshold) {
            this.sendAlert('daily', dailyPercentage, this.dailySpend, this.maxDailySpend);
        }

        // Check monthly limit
        if (monthlyPercentage >= 100) {
            this.triggerShutdown('monthly', this.monthlySpend, this.maxMonthlySpend);
        } else if (monthlyPercentage >= this.alertThreshold) {
            this.sendAlert('monthly', monthlyPercentage, this.monthlySpend, this.maxMonthlySpend);
        }
    }

    /**
     * Send budget alert
     */
    sendAlert(period, percentage, current, limit) {
        const alertKey = `${period}-${Math.floor(percentage)}`;

        // Prevent duplicate alerts
        if (this.alerts.includes(alertKey)) {
            return;
        }

        this.alerts.push(alertKey);

        const alert = {
            timestamp: new Date().toISOString(),
            period,
            percentage: percentage.toFixed(2),
            current: current.toFixed(2),
            limit: limit.toFixed(2),
            message: `⚠️  BUDGET ALERT: ${period} spending at ${percentage.toFixed(1)}% ($${current.toFixed(2)} / $${limit})`
        };

        console.warn('\n' + '='.repeat(70));
        console.warn(alert.message);
        console.warn('='.repeat(70) + '\n');

        this.emit('alert', alert);

        // TODO: Send email/Slack notification
        // this.sendEmailAlert(alert);
        // this.sendSlackAlert(alert);
    }

    /**
     * Trigger emergency shutdown
     */
    triggerShutdown(period, current, limit) {
        if (this.isShutdown) {
            return;
        }

        this.isShutdown = true;

        const shutdown = {
            timestamp: new Date().toISOString(),
            period,
            current: current.toFixed(2),
            limit: limit.toFixed(2),
            message: `🚨 EMERGENCY SHUTDOWN: ${period} budget limit exceeded! ($${current.toFixed(2)} / $${limit})`
        };

        console.error('\n' + '🚨'.repeat(35));
        console.error(shutdown.message);
        console.error('All services have been automatically disabled to prevent further charges.');
        console.error('Please review your usage and increase limits if needed.');
        console.error('🚨'.repeat(35) + '\n');

        this.emit('shutdown', shutdown);

        // TODO: Implement actual service shutdown
        // - Stop accepting new requests
        // - Disable API endpoints
        // - Send emergency notifications
        // - Log to monitoring system
    }

    /**
     * Reset daily/monthly counters if needed
     */
    resetIfNeeded() {
        const now = new Date();

        // Reset daily counter
        if (now.getDate() !== this.lastResetDate.getDate()) {
            console.log('🔄 Resetting daily budget counter');
            this.dailySpend = 0;
            this.lastResetDate = now;
            this.alerts = this.alerts.filter(a => !a.startsWith('daily-'));
        }

        // Reset monthly counter
        if (now.getMonth() !== this.lastMonthResetDate.getMonth()) {
            console.log('🔄 Resetting monthly budget counter');
            this.monthlySpend = 0;
            this.lastMonthResetDate = now;
            this.alerts = this.alerts.filter(a => !a.startsWith('monthly-'));
        }
    }

    /**
     * Get current budget status
     */
    getStatus() {
        return {
            isShutdown: this.isShutdown,
            daily: {
                spent: this.dailySpend.toFixed(2),
                limit: this.maxDailySpend.toFixed(2),
                percentage: ((this.dailySpend / this.maxDailySpend) * 100).toFixed(2),
                remaining: Math.max(0, this.maxDailySpend - this.dailySpend).toFixed(2)
            },
            monthly: {
                spent: this.monthlySpend.toFixed(2),
                limit: this.maxMonthlySpend.toFixed(2),
                percentage: ((this.monthlySpend / this.maxMonthlySpend) * 100).toFixed(2),
                remaining: Math.max(0, this.maxMonthlySpend - this.monthlySpend).toFixed(2)
            },
            alerts: this.alerts.length
        };
    }

    /**
     * Manually reset shutdown state (admin only)
     */
    resetShutdown(adminKey) {
        // TODO: Implement proper admin authentication
        console.log('⚠️  Manually resetting shutdown state');
        this.isShutdown = false;
        this.emit('reset');
    }

    /**
     * Estimate cost for an operation
     * @param {string} operation - Operation type
     * @param {object} params - Operation parameters
     * @returns {number} Estimated cost in USD
     */
    estimateCost(operation, params = {}) {
        // Example cost estimates (adjust based on actual cloud pricing)
        const costTable = {
            'api_call': 0.0001,
            'compute_hour': 0.10,
            'storage_gb_month': 0.02,
            'network_gb': 0.01,
            'transaction': 0.00001,
            'mining': 0.05
        };

        const baseCost = costTable[operation] || 0;
        const multiplier = params.multiplier || 1;

        return baseCost * multiplier;
    }
}

export default BudgetMonitor;
