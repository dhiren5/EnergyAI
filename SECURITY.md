# 🔐 Security Best Practices Guide

## Table of Contents
1. [The $55k Horror Story](#the-55k-horror-story)
2. [Never Commit Secrets](#never-commit-secrets)
3. [Using Secret Managers](#using-secret-managers)
4. [Budget Alerts & Caps](#budget-alerts--caps)
5. [GitHub Secret Scanning](#github-secret-scanning)
6. [Key Rotation](#key-rotation)
7. [Security Checklist](#security-checklist)

---

## The $55k Horror Story

A student in Georgia accidentally pushed a Google Gemini API key to a public GitHub repository. Within days, attackers found and abused it, racking up **over $55,444** in Google Cloud bills (mostly Vertex AI / Gemini usage).

**Key Lessons:**
- ❌ Never hardcode API keys in code
- ❌ Never commit `.env` files to Git
- ❌ Don't rely on `.gitignore` alone (accidents happen)
- ✅ Use proper secret managers
- ✅ Set budget alerts and hard caps
- ✅ Enable GitHub secret scanning
- ✅ Rotate keys immediately if leaked

---

## Never Commit Secrets

### ❌ BAD - Hardcoded Secrets
```javascript
// NEVER DO THIS!
const API_KEY = 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxx';
const DB_PASSWORD = 'mypassword123';
const JWT_SECRET = 'supersecret';
```

### ❌ BAD - .env File in Repository
```bash
# Even with .gitignore, this is risky
echo "API_KEY=secret123" > .env
git add .env  # DANGER!
```

### ✅ GOOD - Using Secret Manager
```javascript
import secretManager from './config/secrets.js';

// Load secrets at runtime
const apiKey = await secretManager.getSecret('GEMINI_API_KEY');
const dbPassword = await secretManager.getSecret('DB_PASSWORD');
```

---

## Using Secret Managers

### Google Cloud Secret Manager

#### 1. Create Secret
```bash
# Create a secret in Google Cloud
echo -n "your-api-key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Grant access to your service account
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:your-service@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 2. Use in Code
```javascript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const name = `projects/YOUR_PROJECT_ID/secrets/${secretName}/versions/latest`;
  const [version] = await client.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

// Usage
const apiKey = await getSecret('GEMINI_API_KEY');
```

#### 3. Use Our Secret Manager Module
```javascript
import secretManager from './config/secrets.js';

// Set environment variable
process.env.SECRET_PROVIDER = 'gcp';
process.env.GOOGLE_CLOUD_PROJECT_ID = 'your-project-id';

// Get secret
const apiKey = await secretManager.getSecret('GEMINI_API_KEY');
```

### AWS Secrets Manager / Parameter Store

#### 1. Create Secret
```bash
# Using AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name "GEMINI_API_KEY" \
  --value "your-api-key" \
  --type "SecureString"

# Or using Secrets Manager
aws secretsmanager create-secret \
  --name GEMINI_API_KEY \
  --secret-string "your-api-key"
```

#### 2. Use in Code
```javascript
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'us-east-1' });

async function getSecret(secretName) {
  const command = new GetParameterCommand({
    Name: secretName,
    WithDecryption: true
  });
  const response = await client.send(command);
  return response.Parameter.Value;
}

// Usage
const apiKey = await getSecret('GEMINI_API_KEY');
```

#### 3. Use Our Secret Manager Module
```javascript
import secretManager from './config/secrets.js';

// Set environment variable
process.env.SECRET_PROVIDER = 'aws';
process.env.AWS_REGION = 'us-east-1';

// Get secret
const apiKey = await secretManager.getSecret('GEMINI_API_KEY');
```

### Azure Key Vault

#### 1. Create Secret
```bash
# Create a secret in Azure Key Vault
az keyvault secret set \
  --vault-name "your-vault-name" \
  --name "GEMINI-API-KEY" \
  --value "your-api-key"
```

#### 2. Use in Code
```javascript
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

const vaultName = 'your-vault-name';
const vaultUrl = `https://${vaultName}.vault.azure.net`;
const client = new SecretClient(vaultUrl, new DefaultAzureCredential());

async function getSecret(secretName) {
  const secret = await client.getSecret(secretName);
  return secret.value;
}

// Usage
const apiKey = await getSecret('GEMINI-API-KEY');
```

#### 3. Use Our Secret Manager Module
```javascript
import secretManager from './config/secrets.js';

// Set environment variable
process.env.SECRET_PROVIDER = 'azure';
process.env.AZURE_KEY_VAULT_NAME = 'your-vault-name';

// Get secret
const apiKey = await secretManager.getSecret('GEMINI_API_KEY');
```

### Other Options

- **HashiCorp Vault**: Enterprise-grade secret management
- **Doppler**: Developer-friendly secret sync
- **Infisical**: Open-source secret management
- **Vercel/Netlify/Render**: Built-in environment variables (encrypted)

---

## Budget Alerts & Caps

### Google Cloud

#### 1. Set Budget Alerts
```bash
# Via gcloud CLI
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="Monthly Budget" \
  --budget-amount=100 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=80 \
  --threshold-rule=percent=100
```

#### 2. Set Hard Cap (via Cloud Functions)
```javascript
// Cloud Function to disable billing on budget alert
export async function stopBilling(pubsubEvent) {
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data, 'base64').toString()
  );
  
  if (pubsubData.costAmount >= pubsubData.budgetAmount) {
    // Disable billing
    const billing = require('@google-cloud/billing');
    const client = new billing.CloudBillingClient();
    
    await client.updateProjectBillingInfo({
      name: `projects/${PROJECT_ID}/billingInfo`,
      projectBillingInfo: {
        billingAccountName: '', // Empty = disabled
      },
    });
    
    console.log('Billing disabled due to budget limit');
  }
}
```

#### 3. Use Our Budget Monitor
```javascript
import BudgetMonitor from './config/budgetMonitor.js';

const monitor = new BudgetMonitor({
  maxDailySpend: 10,    // $10/day
  maxMonthlySpend: 100, // $100/month
  alertThreshold: 80    // Alert at 80%
});

// Record costs
monitor.recordCost(0.50, 'api_call');

// Listen for alerts
monitor.on('alert', (alert) => {
  console.warn('Budget alert:', alert);
  // Send email/Slack notification
});

// Listen for shutdown
monitor.on('shutdown', (shutdown) => {
  console.error('Emergency shutdown:', shutdown);
  // Disable services
  process.exit(1);
});
```

### AWS

#### Set Budget Alerts
```bash
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

**budget.json:**
```json
{
  "BudgetName": "Monthly Budget",
  "BudgetLimit": {
    "Amount": "100",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

### Azure

#### Set Budget Alerts
```bash
az consumption budget create \
  --budget-name "Monthly Budget" \
  --amount 100 \
  --time-grain Monthly \
  --start-date 2025-01-01 \
  --end-date 2026-12-31
```

---

## GitHub Secret Scanning

### Enable Secret Scanning

1. **For Public Repositories** (Free):
   - Go to repository Settings → Security → Code security and analysis
   - Enable "Secret scanning"
   - Enable "Push protection"

2. **For Private Repositories** (GitHub Advanced Security):
   - Requires GitHub Enterprise or GitHub Advanced Security
   - Same steps as above

### Configure Push Protection

Create `.github/secret_scanning.yml`:
```yaml
# Custom patterns for secret scanning
patterns:
  - name: Custom API Key
    regex: 'API_KEY\s*=\s*["\']([a-zA-Z0-9]{32,})["\']'
    
  - name: Private Key
    regex: '-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----'
    
  - name: JWT Token
    regex: 'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*'
```

### What GitHub Detects Automatically

- Google API keys
- AWS access keys
- Azure connection strings
- GitHub tokens
- Slack tokens
- Stripe API keys
- And 200+ other patterns

### If You Accidentally Commit a Secret

1. **Immediately rotate the key**
   ```bash
   # Revoke the old key in your cloud provider
   # Generate a new key
   # Update Secret Manager with new key
   ```

2. **Remove from Git history**
   ```bash
   # Use BFG Repo-Cleaner
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

3. **Notify your team**
   - Alert security team
   - Check for unauthorized usage
   - Review access logs

---

## Key Rotation

### Why Rotate Keys?

- Limit exposure window if key is compromised
- Compliance requirements (PCI-DSS, HIPAA, etc.)
- Best practice: Rotate every 90 days

### Rotation Strategy

#### 1. Create New Key
```bash
# Google Cloud
gcloud secrets versions add GEMINI_API_KEY --data-file=new-key.txt

# AWS
aws secretsmanager update-secret \
  --secret-id GEMINI_API_KEY \
  --secret-string "new-api-key"

# Azure
az keyvault secret set \
  --vault-name your-vault \
  --name GEMINI-API-KEY \
  --value "new-api-key"
```

#### 2. Update Application
```javascript
// Our secret manager automatically gets latest version
const apiKey = await secretManager.getSecret('GEMINI_API_KEY');
```

#### 3. Verify New Key Works
```bash
# Test the application
npm test
```

#### 4. Revoke Old Key
```bash
# Disable old key in cloud provider
# Monitor for any errors
```

### Automated Rotation

```javascript
// Example: Rotate keys every 90 days
import cron from 'node-cron';

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  const keyAge = await getKeyAge('GEMINI_API_KEY');
  
  if (keyAge > 90) {
    console.log('Key is older than 90 days, rotating...');
    await rotateKey('GEMINI_API_KEY');
    await notifyTeam('Key rotated successfully');
  }
});
```

---

## Security Checklist

### ✅ Before Committing Code

- [ ] No hardcoded secrets in code
- [ ] No `.env` files in commit
- [ ] All secrets in Secret Manager
- [ ] `.gitignore` includes `.env`, `*.key`, `*.pem`
- [ ] Reviewed `git diff` for sensitive data

### ✅ Before Deploying

- [ ] All secrets loaded from Secret Manager
- [ ] Budget alerts configured
- [ ] Hard spending caps enabled
- [ ] Monitoring and logging enabled
- [ ] Rate limiting configured
- [ ] Error handling doesn't leak secrets

### ✅ Production Checklist

- [ ] Using cloud Secret Manager (not env vars)
- [ ] Short-lived credentials (IAM roles, not API keys)
- [ ] Budget alerts at 50%, 80%, 100%
- [ ] Automatic shutdown on budget breach
- [ ] GitHub secret scanning enabled
- [ ] Push protection enabled
- [ ] Keys rotated every 90 days
- [ ] Access logs monitored
- [ ] Incident response plan documented

### ✅ Monthly Security Review

- [ ] Review access logs for anomalies
- [ ] Check budget spending trends
- [ ] Rotate keys if needed
- [ ] Update dependencies (`npm audit fix`)
- [ ] Review and revoke unused API keys
- [ ] Test budget alert system
- [ ] Review IAM permissions (principle of least privilege)

---

## Emergency Response

### If You Detect Unauthorized Usage

1. **Immediately revoke the compromised key**
2. **Enable billing alerts if not already enabled**
3. **Contact cloud provider support**
4. **Review access logs to identify scope**
5. **Generate incident report**
6. **Implement additional security measures**

### If You Get a Huge Bill

1. **Contact cloud provider immediately**
   - Google Cloud: https://cloud.google.com/support
   - AWS: https://aws.amazon.com/contact-us/
   - Azure: https://azure.microsoft.com/support/

2. **Explain the situation**
   - Accidental key leak
   - Unauthorized usage
   - Request bill review/forgiveness

3. **Provide evidence**
   - Timeline of events
   - Access logs
   - Steps taken to remediate

4. **Note**: AWS is known to be more forgiving than Google Cloud in these situations

---

## Additional Resources

- [Google Cloud Secret Manager Docs](https://cloud.google.com/secret-manager/docs)
- [AWS Secrets Manager Docs](https://docs.aws.amazon.com/secretsmanager/)
- [Azure Key Vault Docs](https://docs.microsoft.com/azure/key-vault/)
- [GitHub Secret Scanning](https://docs.github.com/code-security/secret-scanning)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## Summary

**The Golden Rules:**

1. 🔐 **Never commit secrets** - Use Secret Manager
2. 💰 **Set budget caps** - Prevent runaway costs
3. 🔍 **Enable secret scanning** - Catch leaks early
4. 🔄 **Rotate keys regularly** - Limit exposure
5. 🚨 **Monitor and alert** - Detect issues fast
6. 📝 **Document everything** - Incident response ready

**Remember**: The $55k incident could have been prevented with these practices. Don't let it happen to you!
