# 🚀 Quick Start Guide - EnergyAI Blockchain

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/energyai-blockchain.git
cd energyai-blockchain
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Development)

Copy the example environment file:
```bash
copy .env.example .env
```

Edit `.env` and set your configuration:
```env
PORT=3000
NODE_ENV=development
MINING_DIFFICULTY=2
MINING_REWARD=100

# Budget Limits (IMPORTANT!)
MAX_DAILY_SPEND=10
MAX_MONTHLY_SPEND=100
ALERT_THRESHOLD_PERCENTAGE=80
```

### 4. Run the Application

#### Option A: Run Demo
```bash
npm start
```

#### Option B: Start API Server
```bash
npm run node
```

#### Option C: Interactive Miner
```bash
npm run miner
```

#### Option D: Run Tests
```bash
npm test
```

## Production Deployment

### ⚠️ IMPORTANT: Never Use .env Files in Production!

For production, use a proper secret manager:

### Google Cloud Platform

1. **Create Secrets**
```bash
# Store API keys in Secret Manager
echo -n "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "100" | gcloud secrets create MINING_REWARD --data-file=-
```

2. **Set Environment Variables**
```bash
export SECRET_PROVIDER=gcp
export GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

3. **Deploy**
```bash
npm run node
```

### AWS

1. **Create Secrets**
```bash
# Store in Parameter Store
aws ssm put-parameter \
  --name "JWT_SECRET" \
  --value "your-jwt-secret" \
  --type "SecureString"
```

2. **Set Environment Variables**
```bash
export SECRET_PROVIDER=aws
export AWS_REGION=us-east-1
```

3. **Deploy**
```bash
npm run node
```

### Azure

1. **Create Secrets**
```bash
# Store in Key Vault
az keyvault secret set \
  --vault-name "your-vault" \
  --name "JWT-SECRET" \
  --value "your-jwt-secret"
```

2. **Set Environment Variables**
```bash
export SECRET_PROVIDER=azure
export AZURE_KEY_VAULT_NAME=your-vault
```

3. **Deploy**
```bash
npm run node
```

## Budget Monitoring

The application includes built-in budget monitoring to prevent runaway costs (like the $55k incident).

### Features
- ✅ Daily and monthly spending limits
- ✅ Automatic alerts at 80% threshold
- ✅ Emergency shutdown at 100% limit
- ✅ Real-time cost tracking
- ✅ Budget status API endpoint

### Check Budget Status
```bash
curl http://localhost:3000/budget
```

Response:
```json
{
  "success": true,
  "budget": {
    "isShutdown": false,
    "daily": {
      "spent": "2.45",
      "limit": "10.00",
      "percentage": "24.50",
      "remaining": "7.55"
    },
    "monthly": {
      "spent": "15.30",
      "limit": "100.00",
      "percentage": "15.30",
      "remaining": "84.70"
    },
    "alerts": 0
  }
}
```

## API Endpoints

### Get Blockchain Stats
```bash
curl http://localhost:3000/stats
```

### Tokenize Energy
```bash
curl -X POST http://localhost:3000/energy/tokenize \
  -H "Content-Type: application/json" \
  -d '{
    "providerAddress": "YOUR_ADDRESS",
    "energyAmount": 100,
    "energySource": "renewable"
  }'
```

### Mine a Block
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

### Check Balance
```bash
curl http://localhost:3000/balance/YOUR_ADDRESS
```

## Security Checklist

Before deploying to production:

- [ ] ✅ Using Secret Manager (not .env files)
- [ ] ✅ Budget alerts configured
- [ ] ✅ GitHub secret scanning enabled
- [ ] ✅ `.env` files in `.gitignore`
- [ ] ✅ No hardcoded secrets in code
- [ ] ✅ API keys rotated regularly
- [ ] ✅ Monitoring and logging enabled
- [ ] ✅ Read [SECURITY.md](./SECURITY.md)

## Troubleshooting

### "Budget limit exceeded" Error
If you see this error, your spending has reached the configured limit.

**Solution:**
1. Check budget status: `curl http://localhost:3000/budget`
2. Review your usage
3. Increase limits in `.env` (development) or Secret Manager (production)
4. Restart the server

### "Secret Manager not initialized"
The application couldn't connect to your secret manager.

**Solution:**
1. Verify `SECRET_PROVIDER` environment variable
2. Check cloud credentials are configured
3. Verify secrets exist in Secret Manager
4. Check IAM permissions

### Dependencies Installation Failed
Some optional dependencies (cloud SDKs) might fail to install.

**Solution:**
```bash
# Install only required dependencies
npm install --no-optional

# Or install specific cloud SDK you need
npm install @google-cloud/secret-manager
# or
npm install @aws-sdk/client-ssm
# or
npm install @azure/keyvault-secrets @azure/identity
```

## Next Steps

1. **Read the Documentation**
   - [README.md](./README.md) - Full documentation
   - [SECURITY.md](./SECURITY.md) - Security best practices
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide

2. **Explore the Code**
   - `src/core/` - Blockchain core
   - `src/config/` - Security configuration
   - `src/wallet/` - Wallet management

3. **Join the Community**
   - Star ⭐ the repository
   - Report issues
   - Submit pull requests
   - Share your feedback

## Support

- **Documentation**: [README.md](./README.md)
- **Security**: [SECURITY.md](./SECURITY.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/energyai-blockchain/issues)
- **Email**: support@energyai.io

---

**Remember**: Always use Secret Manager in production. Never commit secrets to Git. Set budget limits to prevent unexpected charges.
