# Quick Start Guide - AI Email Negotiator

Get your AI real estate email negotiator running in 30 minutes.

## Prerequisites

Before you begin, have these ready:

- [ ] n8n account (sign up at https://n8n.io or self-host)
- [ ] OpenAI API key (get at https://platform.openai.com)
- [ ] Gmail account (or any IMAP email)
- [ ] $20-50 for n8n Cloud (or server for self-hosting)

## Step-by-Step Setup (30 Minutes)

### 1. Set Up n8n (5 minutes)

**Option A: n8n Cloud (Easiest)**
1. Go to https://app.n8n.cloud
2. Sign up for an account
3. Choose Starter plan ($20/month)
4. Verify your email

**Option B: Self-Hosted (Free)**
```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at http://localhost:5678
```

### 2. Import the Workflow (2 minutes)

1. Download `n8n-email-negotiator-workflow.json` from this folder
2. In n8n, click "Add Workflow" (top right)
3. Click "Import from File"
4. Select the JSON file
5. Click "Save" (but don't activate yet!)

### 3. Configure OpenAI (3 minutes)

1. Get your API key:
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (you won't see it again!)

2. Add to n8n:
   - Click "Credentials" in left sidebar
   - Click "Add Credential"
   - Search for "OpenAI"
   - Paste your API key
   - Name it "OpenAI Account"
   - Click "Save"

3. Add $10 credit to OpenAI account:
   - Go to https://platform.openai.com/settings/organization/billing
   - Add payment method
   - Add $10 credit to start

### 4. Configure Email (10 minutes)

**For Gmail (Recommended):**

1. **Enable IMAP in Gmail:**
   - Go to Gmail Settings → Forwarding and POP/IMAP
   - Enable IMAP
   - Save changes

2. **Create App Password:**
   - Go to Google Account → Security
   - Enable 2-Step Verification (if not already)
   - Go to App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "n8n Email Bot"
   - Copy the 16-character password

3. **Add IMAP Credential in n8n:**
   - Click "Credentials" → "Add Credential"
   - Search for "IMAP"
   - Enter:
     - Host: `imap.gmail.com`
     - Port: `993`
     - User: `your-email@gmail.com`
     - Password: [Your app password]
     - SSL: Enable
   - Name it "Your Email Account"
   - Click "Save"

4. **Add Gmail OAuth for Sending:**
   - Click "Credentials" → "Add Credential"
   - Search for "Gmail OAuth2"
   - Click "Connect my account"
   - Follow Google OAuth flow
   - Allow n8n access
   - Name it "Gmail Account"
   - Click "Save"

### 5. Connect Credentials to Workflow (5 minutes)

1. Open your imported workflow
2. Click on "Email Trigger (IMAP)" node
3. In "Credential to connect with" dropdown, select "Your Email Account"
4. Click on "Analyze Email with AI" node
5. Select "OpenAI Account" credential
6. Repeat for all AI nodes (there are 3 total)
7. Click on "Send Email Response" node
8. Select "Gmail Account" credential
9. Click "Save" (top right)

### 6. Customize Investment Criteria (3 minutes)

1. Click on "Validate Investment Criteria" node
2. Find this section in the code:

```javascript
const criteria = {
  minProfit: 30000,        // Your minimum profit
  maxARVRatio: 0.75,       // Your max purchase % of ARV
  minHoldTime: 6,          // Your minimum hold time
  maxHoldTime: 24,         // Your maximum hold time
  minCashReserves: 10000   // Your cash reserves needed
};
```

3. Adjust numbers to match YOUR criteria
4. Click outside the node to save

### 7. Test with Sample Email (5 minutes)

1. **Activate the workflow:**
   - Toggle "Inactive" to "Active" (top right)

2. **Send test email to yourself:**
   - From any email account, send to your configured Gmail:

```
Subject: Need to sell house fast

Hi, I'm behind on my mortgage payments and need to sell my house
at 123 Main Street quickly. I owe about $150,000 and think it's
worth around $220,000. Can you help?

Thanks,
Test Seller
```

3. **Watch it work:**
   - Go to "Executions" tab (left sidebar)
   - You should see a new execution within 1-2 minutes
   - Click on it to see the workflow in action
   - Check your Gmail sent folder for the AI response!

4. **Review the response:**
   - Did it identify this as a Subject-To opportunity?
   - Is the tone appropriate?
   - Does the response make sense?

### 8. Adjust Settings (2 minutes)

Based on your test, you may want to:

**Make responses more professional:**
- Edit "Generate Negotiation Email" node
- Adjust the system prompt tone

**Speed up polling:**
- Edit "Email Trigger" node
- Change from "Every minute" to "Every 30 seconds"

**Add manual approval:**
- Initially, disconnect the "Send Email" node
- Review all emails manually first
- Reconnect once confident

## Optional: Add Deal Tracking

### Google Sheets Logging (5 minutes)

1. Create new Google Sheet
2. Name it "Deal Pipeline"
3. Add column headers (row 1):
   - Timestamp | Sender | Sender Type | Deal Type | Approval Status | Estimated Profit | Confidence | Original Subject | Response Sent

4. Get Sheet ID from URL:
   - `https://docs.google.com/spreadsheets/d/[THIS-IS-THE-SHEET-ID]/edit`

5. Add Google Sheets credential in n8n:
   - Credentials → Add → "Google Sheets OAuth2"
   - Connect your account

6. Update "Log to Google Sheets" node:
   - Replace "YOUR_GOOGLE_SHEET_ID" with your actual ID
   - Select your credential

7. Save and test!

## Verification Checklist

Before going live, verify:

- [ ] Test email was processed successfully
- [ ] AI response was generated and sent
- [ ] Response quality is acceptable
- [ ] Sender type detected correctly (if testing with realtor email)
- [ ] Deal structure makes sense for the scenario
- [ ] Investment criteria validation working
- [ ] No errors in execution log
- [ ] Emails are being marked as read (to avoid reprocessing)

## Common Issues & Quick Fixes

### "Could not connect to email server"
- **Fix:** Check IMAP is enabled in Gmail settings
- **Fix:** Verify app password is correct (no spaces)
- **Fix:** Ensure port is 993 and SSL is enabled

### "OpenAI API error"
- **Fix:** Check API key is valid
- **Fix:** Ensure you have credits in OpenAI account
- **Fix:** Verify you're not hitting rate limits

### "No emails being processed"
- **Fix:** Check workflow is activated (toggle on)
- **Fix:** Send fresh email (not old one)
- **Fix:** Check "Executions" tab for errors
- **Fix:** Verify polling is enabled (not manual trigger)

### "Email response not sending"
- **Fix:** Check Gmail OAuth is connected
- **Fix:** Re-authenticate Gmail if needed
- **Fix:** Check "Send Email" node is connected in workflow

### "Wrong deal type selected"
- **Fix:** Review AI analysis in execution details
- **Fix:** Add more context to email
- **Fix:** Adjust AI temperature (try 0.3-0.5 for more consistent results)

## Next Steps

Once your test is successful:

1. **Test with more scenarios:**
   - Use examples from `example-emails.md`
   - Test realtor vs direct seller
   - Test different deal types

2. **Refine responses:**
   - Review first 10-20 AI-generated emails
   - Adjust prompts to match your style
   - Add specific phrases you like to use

3. **Set up monitoring:**
   - Create Slack/Discord webhook for notifications
   - Set up Google Sheets tracking
   - Monitor daily executions

4. **Go live gradually:**
   - Week 1: Manual review all emails
   - Week 2: Auto-send high-confidence (>80%) deals
   - Week 3: Auto-send medium-confidence (>60%) deals
   - Week 4: Full automation with manual review queue

5. **Optimize for your market:**
   - Track which deal types close
   - Adjust confidence thresholds
   - Add market-specific keywords
   - Refine investment criteria based on results

## Cost Monitoring

Keep track of your costs:

**n8n Cloud:** $20/month (Starter) or $50/month (Pro)

**OpenAI API:**
- Per email: ~$0.10-0.15
- 100 emails: ~$12/month
- 500 emails: ~$60/month

**Total for 100 emails/month:** ~$32/month

Set up billing alerts:
- OpenAI: Settings → Billing → Usage limits
- Set monthly cap at $25-50 to start

## Getting Help

**n8n Issues:**
- Community forum: https://community.n8n.io
- Documentation: https://docs.n8n.io

**OpenAI Issues:**
- Help center: https://help.openai.com
- Status page: https://status.openai.com

**Workflow Issues:**
- Check execution logs in n8n
- Review AI responses for patterns
- Test with simpler emails first

## Daily Operation

Once live, your daily routine:

1. **Morning (5 min):**
   - Check "Executions" tab for overnight runs
   - Review any manual review queue items
   - Approve or edit flagged emails

2. **Midday (2 min):**
   - Quick check for errors
   - Review response quality on new emails

3. **Evening (5 min):**
   - Check for seller responses
   - Update deal status in CRM/sheets
   - Handle any follow-ups manually

4. **Weekly (30 min):**
   - Review metrics (response rate, deal quality)
   - Adjust criteria if needed
   - Refine AI prompts based on results
   - Check costs and usage

## Success Metrics to Track

After first month, evaluate:

1. **Email Processing:**
   - Emails received: ___
   - Emails processed: ___
   - Success rate: ___%

2. **Deal Quality:**
   - Responses sent: ___
   - Seller replies: ___
   - Appointments booked: ___
   - Deals closed: ___

3. **AI Accuracy:**
   - Correct sender type detection: ___%
   - Appropriate deal type selection: ___%
   - Acceptable response quality: ___%

4. **Efficiency:**
   - Time saved per week: ___ hours
   - Cost per processed email: $___
   - ROI vs manual processing: ___%

## Ready to Scale?

Once you're confident:

- Process multiple inboxes
- Add SMS/WhatsApp integration
- Build follow-up sequences
- Add property valuation APIs
- Create multi-language support
- Integrate with your CRM
- Add voice call summarization
- Build offer calculator tool

---

**You're ready to go!** Send that test email and watch the magic happen.

Questions during setup? Check the full README.md for detailed troubleshooting.

**Pro Tip:** Start conservative with manual reviews, then gradually increase automation as you gain confidence in the AI's decisions.
