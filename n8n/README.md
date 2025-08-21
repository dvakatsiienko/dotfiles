# n8n Workflows for Dotfiles

This directory contains n8n workflow automations for managing and monitoring your dotfiles repository.

## Workflows

### 1. Dotfiles Health Monitor (`dotfiles-monitor.json`)

A daily automation that monitors your dotfiles repository and sends email notifications about changes.

**Features:**
- 📅 Runs daily at 9 AM (configurable)
- 🔍 Checks for recent commits in the last 24 hours
- ⚠️ Identifies changes to critical configuration files
- 📧 Sends a beautifully formatted HTML email report
- 📊 Includes commit statistics and summaries

## Setup Instructions

### Prerequisites

1. **n8n Installation**
   ```bash
   # Install n8n globally
   npm install -g n8n
   
   # Or run with npx
   npx n8n
   ```

2. **GitHub Personal Access Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` scope
   - Save the token for configuration

3. **Email SMTP Credentials**
   
   **For Gmail:**
   - Enable 2-factor authentication
   - Generate an [App Password](https://support.google.com/accounts/answer/185833)
   - Use your Gmail address and app password

   **For other providers:**
   - Get SMTP credentials from your email service provider
   - Common providers: SendGrid, Mailgun, Amazon SES, etc.

### Configuration

1. **Copy environment variables template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your credentials:**
   ```bash
   # Required configurations:
   GITHUB_TOKEN=your_github_token
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_TO=your-email@example.com
   ```

3. **Start n8n:**
   ```bash
   # Start n8n
   n8n start
   
   # Or with custom port
   n8n start --port 5679
   ```

4. **Import the workflow:**
   - Open n8n UI (default: http://localhost:5678)
   - Click "Import from File" 
   - Select `dotfiles-monitor.json`

5. **Configure credentials in n8n:**
   - Go to Credentials → Add Credential
   - Add SMTP credentials:
     - Type: SMTP
     - Host: Your SMTP host
     - Port: Your SMTP port  
     - User: Your email
     - Password: Your app password
   - Update the email node to use your email address

6. **Activate the workflow:**
   - Click the toggle switch to activate
   - The workflow will now run automatically

## Testing the Workflow

1. **Manual trigger:**
   - Click "Execute Workflow" to test immediately
   - Check your email for the report

2. **View execution history:**
   - Click "Executions" tab to see past runs
   - Debug any issues from execution logs

## Customization Options

### Change Schedule
Edit the Schedule Trigger node to modify timing:
- Change from daily to hourly/weekly
- Adjust the trigger time
- Add multiple schedules

### Modify Critical Files List
Edit the Code node to track different files:
```javascript
const criticalFiles = ['.zshrc', '.gitconfig', '.vimrc', 'your-file.conf'];
```

### Customize Email Template
Modify the HTML template in the Code node for different styling or content.

### Add More Notifications
- Add Slack node for Slack notifications
- Add Discord webhook for Discord alerts
- Add SMS via Twilio for critical changes

## Troubleshooting

### Common Issues

1. **GitHub API rate limits:**
   - Ensure you're using a personal access token
   - Check your rate limit status

2. **Email not sending:**
   - Verify SMTP credentials
   - Check spam folder
   - For Gmail, ensure app password is used

3. **Workflow not triggering:**
   - Ensure workflow is activated
   - Check n8n is running
   - Verify schedule settings

### Debug Mode

Run n8n in debug mode for more details:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

## Additional Workflow Ideas

- **Backup Automation**: Weekly backup of dotfiles to cloud storage
- **Symlink Checker**: Daily validation of all symlinks
- **Config Validator**: Test configuration files for syntax errors
- **Dependency Updates**: Check for outdated dependencies in package.json
- **Security Scanner**: Scan for exposed secrets or sensitive data

## Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [Workflow Templates](https://n8n.io/workflows)

## License

Part of the dotfiles repository - see main LICENSE file.