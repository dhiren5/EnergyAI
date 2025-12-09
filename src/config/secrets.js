/**
 * Secret Management Module
 * Handles secure loading of secrets from various sources
 * 
 * Priority order:
 * 1. Cloud Secret Manager (Google Cloud, AWS, Azure)
 * 2. Environment variables (for development only)
 * 3. Default values (for testing only)
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

class SecretManager {
    constructor() {
        this.provider = process.env.SECRET_PROVIDER || 'env'; // 'gcp', 'aws', 'azure', 'env'
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

        // Initialize clients based on provider
        this.initializeClients();
    }

    initializeClients() {
        try {
            switch (this.provider) {
                case 'gcp':
                    this.gcpClient = new SecretManagerServiceClient();
                    console.log('✅ Google Cloud Secret Manager initialized');
                    break;
                case 'aws':
                    this.awsClient = new SSMClient({
                        region: process.env.AWS_REGION || 'us-east-1'
                    });
                    console.log('✅ AWS Secrets Manager initialized');
                    break;
                case 'azure':
                    const vaultName = process.env.AZURE_KEY_VAULT_NAME;
                    if (vaultName) {
                        const vaultUrl = `https://${vaultName}.vault.azure.net`;
                        this.azureClient = new SecretClient(
                            vaultUrl,
                            new DefaultAzureCredential()
                        );
                        console.log('✅ Azure Key Vault initialized');
                    }
                    break;
                case 'env':
                    console.log('⚠️  Using environment variables for secrets (development only)');
                    break;
                default:
                    console.warn('⚠️  Unknown secret provider, falling back to environment variables');
                    this.provider = 'env';
            }
        } catch (error) {
            console.error('❌ Failed to initialize secret manager:', error.message);
            console.log('⚠️  Falling back to environment variables');
            this.provider = 'env';
        }
    }

    /**
     * Get a secret value
     * @param {string} secretName - Name of the secret
     * @param {string} defaultValue - Default value if secret not found
     * @returns {Promise<string>} Secret value
     */
    async getSecret(secretName, defaultValue = null) {
        // Check cache first
        const cached = this.cache.get(secretName);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.value;
        }

        let secretValue;

        try {
            switch (this.provider) {
                case 'gcp':
                    secretValue = await this.getGCPSecret(secretName);
                    break;
                case 'aws':
                    secretValue = await this.getAWSSecret(secretName);
                    break;
                case 'azure':
                    secretValue = await this.getAzureSecret(secretName);
                    break;
                case 'env':
                default:
                    secretValue = process.env[secretName] || defaultValue;
            }

            // Cache the secret
            if (secretValue) {
                this.cache.set(secretName, {
                    value: secretValue,
                    timestamp: Date.now()
                });
            }

            return secretValue;
        } catch (error) {
            console.error(`❌ Failed to get secret '${secretName}':`, error.message);
            return defaultValue;
        }
    }

    /**
     * Get secret from Google Cloud Secret Manager
     */
    async getGCPSecret(secretName) {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        if (!projectId) {
            throw new Error('GOOGLE_CLOUD_PROJECT_ID not set');
        }

        const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
        const [version] = await this.gcpClient.accessSecretVersion({ name });
        return version.payload.data.toString('utf8');
    }

    /**
     * Get secret from AWS Systems Manager Parameter Store
     */
    async getAWSSecret(secretName) {
        const command = new GetParameterCommand({
            Name: secretName,
            WithDecryption: true
        });
        const response = await this.awsClient.send(command);
        return response.Parameter.Value;
    }

    /**
     * Get secret from Azure Key Vault
     */
    async getAzureSecret(secretName) {
        const secret = await this.azureClient.getSecret(secretName);
        return secret.value;
    }

    /**
     * Clear the secret cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🔄 Secret cache cleared');
    }

    /**
     * Get configuration with secrets
     */
    async getConfig() {
        return {
            // Server Configuration
            port: await this.getSecret('PORT', '3000'),
            nodeEnv: await this.getSecret('NODE_ENV', 'development'),

            // Blockchain Configuration
            miningDifficulty: parseInt(await this.getSecret('MINING_DIFFICULTY', '2')),
            miningReward: parseInt(await this.getSecret('MINING_REWARD', '100')),
            energyToTokenRate: parseInt(await this.getSecret('ENERGY_TO_TOKEN_RATE', '10')),

            // Security
            jwtSecret: await this.getSecret('JWT_SECRET'),

            // Budget Limits
            maxDailySpend: parseFloat(await this.getSecret('MAX_DAILY_SPEND', '10')),
            maxMonthlySpend: parseFloat(await this.getSecret('MAX_MONTHLY_SPEND', '100')),
            alertThreshold: parseFloat(await this.getSecret('ALERT_THRESHOLD_PERCENTAGE', '80')),

            // Rate Limiting
            rateLimitWindow: parseInt(await this.getSecret('RATE_LIMIT_WINDOW_MS', '900000')),
            rateLimitMax: parseInt(await this.getSecret('RATE_LIMIT_MAX_REQUESTS', '100')),

            // Logging
            logLevel: await this.getSecret('LOG_LEVEL', 'info'),
            logFile: await this.getSecret('LOG_FILE', './logs/blockchain.log')
        };
    }
}

// Singleton instance
const secretManager = new SecretManager();

export default secretManager;
export { SecretManager };
