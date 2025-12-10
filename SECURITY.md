# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in this project, please report it immediately by contacting the maintainers. We take security issues seriously and will respond promptly to fix verified issues.

## Security Best Practices

### 1. Secret Management
- **Never commit API keys, secrets, or passwords** to the repository
- Always use environment variables for sensitive data
- Use `.env` files for local development (and add them to `.gitignore`)
- Use `.env.example` with placeholder values for documentation

### 2. Environment Files
```bash
# Good: .env.example with placeholder values
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET_KEY=your_jwt_secret_key
```

### 3. Git Security
- Always review changes before committing
- Use `.gitignore` to prevent sensitive files from being committed
- Regularly audit your repository for accidentally committed secrets
- Use tools like GitGuardian or similar to scan for exposed secrets

### 4. API Key Management
- Rotate API keys regularly
- Use different keys for different environments
- Restrict API key permissions to minimum required scope
- Store production keys in secure secret management systems

### 5. Incident Response
If a secret is accidentally committed:
1. Rotate the exposed key immediately
2. Update all environment files to use new placeholders
3. Remove the sensitive data from git history
4. Document the incident and lessons learned
5. Update security procedures to prevent recurrence

## Prevention Tools

Consider using these tools to prevent secret exposure:
- Pre-commit hooks with secret scanning
- Git hooks to scan for common secret patterns
- CI/CD security scanning tools
- Regular automated security audits

## Current Status

This project follows security best practices:
- All sensitive data is stored in environment variables
- Production secrets are not stored in the repository
- Environment files contain only placeholder values
- Proper `.gitignore` configuration is in place