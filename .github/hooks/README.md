# Git Hooks Setup

This directory contains Git hooks to enhance security and code quality.

## Available Hooks

### pre-commit
Prevents committing secrets and sensitive files.

**Features:**
- Scans for API keys, passwords, and private keys
- Blocks .env files from being committed
- Blocks key files (.key, .pem, etc.)
- Provides helpful error messages

## Installation

### Automatic Installation (Recommended)

Run this command from the project root:

```bash
# Windows (PowerShell)
Copy-Item .github/hooks/pre-commit .git/hooks/pre-commit

# Linux/Mac
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Manual Installation

1. Copy the hook file:
   ```bash
   copy .github\hooks\pre-commit .git\hooks\pre-commit
   ```

2. Make it executable (Linux/Mac only):
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

## Usage

Once installed, the hook runs automatically before every commit.

### Normal Commit
```bash
git add .
git commit -m "Your message"
# Hook runs automatically
```

### Bypass Hook (Use with Caution!)
```bash
git commit --no-verify -m "Your message"
```

**⚠️ WARNING**: Only bypass the hook if you're absolutely sure there are no secrets!

## What Gets Detected

The pre-commit hook scans for:

- API keys (Google, AWS, Stripe, etc.)
- Secret keys and passwords
- Private keys (RSA, EC, etc.)
- JWT tokens
- Slack tokens
- Database connection strings
- .env files
- Key files (.key, .pem, .p12, etc.)

## False Positives

If the hook incorrectly flags something:

1. **Review carefully** - Make sure it's really safe
2. **Update the pattern** in the hook if needed
3. **Use --no-verify** only if absolutely necessary

## Troubleshooting

### Hook Not Running

Make sure the file is:
1. In the correct location: `.git/hooks/pre-commit`
2. Executable (Linux/Mac): `chmod +x .git/hooks/pre-commit`
3. Named correctly (no `.sh` extension)

### Hook Blocking Valid Commit

If you're sure there are no secrets:
```bash
git commit --no-verify -m "Your message"
```

But **always double-check first!**

## Additional Security

This hook is just one layer of security. Also:

1. ✅ Enable GitHub secret scanning
2. ✅ Use Secret Manager in production
3. ✅ Set budget alerts
4. ✅ Review commits before pushing
5. ✅ Read [SECURITY.md](../../SECURITY.md)

## Learn More

- [SECURITY.md](../../SECURITY.md) - Complete security guide
- [QUICKSTART.md](../../QUICKSTART.md) - Setup guide
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
