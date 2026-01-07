# AI Real Estate Email Negotiator for n8n

An intelligent n8n workflow that automatically reads seller emails, analyzes situations, selects optimal deal structures, and generates personalized negotiation emails - all while staying within your investment criteria.

## What This System Does

This AI-powered workflow handles your real estate email negotiations automatically:

1. **Reads incoming emails** from sellers and realtors
2. **Analyzes the seller's situation** using AI (motivation, urgency, property condition, etc.)
3. **Detects sender type** (realtor vs direct seller) and adapts approach accordingly
4. **Recommends best deal structure** (seller finance, subject-to, cash, lease option, etc.)
5. **Calculates acceptable terms** based on your investment criteria
6. **Generates personalized negotiation emails** that match your communication style
7. **Validates against your criteria** before sending (auto-approve or manual review)
8. **Logs all negotiations** to Google Sheets or CRM for tracking

## Features

### Intelligent Email Analysis
- Detects motivation level (high/medium/low)
- Identifies urgency and timeline constraints
- Extracts property details and seller situation
- Recognizes distress signals (foreclosure, divorce, probate, etc.)
- Analyzes equity position and financial constraints

### Dual Communication Strategy
- **Direct Seller Mode**: Empathetic, problem-solving tone with simple language
- **Realtor Mode**: Professional, business-like tone with proper terminology

### Smart Deal Structure Selection
Automatically recommends the best strategy from:
- Seller Finance
- Subject-To
- Cash Purchase
- Lease Option
- Novation
- Wrap Mortgage
- Wholesaling/Assignment

### Investment Criteria Validation
- Minimum profit margin: $30,000
- Maximum ARV ratio: 75%
- Risk assessment
- Auto-approval for qualifying deals
- Manual review queue for edge cases

### Deal Tracking
- Optional Google Sheets logging
- Optional Airtable CRM integration
- Complete audit trail of all negotiations

## Installation & Setup

### Prerequisites

1. **n8n Instance** (self-hosted or n8n cloud)
2. **OpenAI API Key** (GPT-4 recommended for best results)
3. **Email Account** (Gmail, IMAP, or any email service)

### Step 1: Import the Workflow

1. Open your n8n instance
2. Click "Add Workflow" → "Import from File"
3. Select `n8n-email-negotiator-workflow.json`
4. The workflow will be imported with all nodes

### Step 2: Configure Credentials

You'll need to set up these credentials in n8n:

#### Required Credentials

**1. Email Account (IMAP)**
- Go to Settings → Credentials → Add Credential
- Choose "IMAP"
- Enter your email credentials:
  - Host: `imap.gmail.com` (for Gmail)
  - Port: `993`
  - User: `your-email@gmail.com`
  - Password: Your app password (not regular password)
  - Enable SSL: Yes
- Save as "Your Email Account"

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use this password in n8n

**2. OpenAI API**
- Go to Settings → Credentials → Add Credential
- Choose "OpenAI API"
- Enter your OpenAI API key from https://platform.openai.com/api-keys
- Save as "OpenAI Account"

**3. Email Sending (Gmail OAuth2)**
- Go to Settings → Credentials → Add Credential
- Choose "Gmail OAuth2 API"
- Follow the OAuth flow to connect your Gmail account
- Save as "Gmail Account"

#### Optional Credentials

**4. Google Sheets** (for deal logging)
- Go to Settings → Credentials
- Choose "Google Sheets OAuth2 API"
- Follow OAuth flow
- Save as "Google Sheets Account"

Then create a Google Sheet with these columns:
- Timestamp
- Sender
- Sender Type
- Deal Type
- Approval Status
- Estimated Profit
- Confidence
- Original Subject
- Response Sent

Get the Sheet ID from the URL (the long string after `/d/`) and update the "Log to Google Sheets" node.

**5. Airtable** (for CRM tracking)
- Create an Airtable base with a "Deals" table
- Add these fields: Seller Email, Sender Type, Deal Structure, Status, Estimated Profit, Motivation Level, Property Address, Notes
- Get your Airtable API key and Base ID
- Configure in n8n credentials
- Update the "Create Deal in CRM" node with your Base ID

### Step 3: Configure the Workflow

#### Update Email Trigger Node
1. Click on "Email Trigger (IMAP)" node
2. Select your email credential
3. Set polling interval (default: every minute)
4. Choose folders to monitor (INBOX)

#### Configure AI Model
The workflow uses GPT-4 Turbo by default. If you want to use a different model:
1. Click on any "AI" node (blue chat bubble icons)
2. Change `model` parameter to:
   - `gpt-4-turbo-preview` (recommended)
   - `gpt-4` (slower but very accurate)
   - `gpt-3.5-turbo` (faster but less accurate)

#### Adjust Investment Criteria
Open the "Validate Investment Criteria" node and modify the criteria object:

```javascript
const criteria = {
  minProfit: 30000,        // Minimum acceptable profit
  maxARVRatio: 0.75,       // Maximum purchase price as % of ARV
  minHoldTime: 6,          // Minimum hold time in months
  maxHoldTime: 24,         // Maximum hold time in months
  minCashReserves: 10000   // Minimum cash reserves required
};
```

### Step 4: Test the Workflow

1. **Activate the workflow** using the toggle in the top right
2. **Send a test email** to your configured inbox with content like:

```
Subject: Need to Sell House Fast

Hi, I need to sell my house at 123 Main St as soon as possible.
I'm behind on payments and facing foreclosure. The house needs
some repairs but is in a decent neighborhood. I owe about $150k
on the mortgage. Please help!
```

3. **Monitor execution** in the "Executions" tab
4. **Check your sent email** to see the generated response

### Step 5: Review and Adjust

After testing:

1. Check the tone and content of generated emails
2. Adjust AI prompts if needed (in the AI nodes)
3. Fine-tune investment criteria
4. Set up manual review notifications (Slack, email, etc.)

## How to Use

### Automatic Mode (Recommended)

Once activated, the workflow runs automatically:
1. New emails arrive in your inbox
2. AI analyzes them every minute
3. Qualifying deals get automatic responses
4. Edge cases go to manual review queue
5. All activity logged to your tracking system

### Manual Review Queue

Deals requiring review are flagged when:
- Confidence score < 60%
- Estimated profit < $30,000
- High risk level detected
- Multiple red flags present

To handle manual reviews:
1. Check the "Add to Manual Review Queue" node
2. Review the deal details
3. Manually send or skip the email

### Monitoring Performance

Track your negotiation pipeline:
- **Google Sheets**: See all negotiations in one spreadsheet
- **Airtable**: Manage deals through your pipeline stages
- **n8n Executions**: View detailed workflow runs and debug issues

## Customization Guide

### Modifying Communication Style

Edit the "Generate Negotiation Email" AI node to adjust tone:

```javascript
// For more casual tone
"Your writing style should be friendly and conversational..."

// For more professional tone
"Your writing style should be formal and business-oriented..."

// For aggressive negotiations
"Your writing style should be direct and focused on value..."
```

### Adding New Deal Structures

1. Open `investment-criteria-config.json`
2. Add new deal type under `dealStructures`:

```json
"yourNewDealType": {
  "name": "Your New Deal Type",
  "idealFor": ["situation 1", "situation 2"],
  "requiredConditions": ["condition 1"],
  "typicalTerms": {},
  "profitStrategy": "description",
  "riskLevel": "low/medium/high"
}
```

3. Update the AI prompts to include this new option

### Adjusting Auto-Approval Logic

Modify the "Validate Investment Criteria" node:

```javascript
// More conservative (fewer auto-approvals)
if (validation.passedCriteria && validation.warnings.length === 0 && dealStructure.confidence >= 0.8) {
  validation.approvalStatus = "auto_approved";
}

// More aggressive (more auto-approvals)
if (validation.passedCriteria && dealStructure.confidence >= 0.6) {
  validation.approvalStatus = "auto_approved";
}
```

### Adding Notification Channels

To get notified of new deals or reviews needed:

1. Add a Slack node after "Check if Approved"
2. Configure webhook or OAuth
3. Send messages for manual reviews:

```json
{
  "text": "New deal requires review: {{$json.dealStructure.recommendedDealType}} for {{$json.from}}"
}
```

## Deal Structure Playbook

### When to Use Each Strategy

#### Seller Finance
**Best for:**
- Seller owns free and clear or low balance
- Seller wants monthly income
- Not in rush
- Wants tax advantages

**Typical Terms:**
- 10-20% down
- 6-10% interest
- 15-30 year term
- 30-60 day close

**Profit Strategy:**
Buy low with seller financing, then:
- Sell high with owner financing (spread)
- Rent and cashflow
- Refinance and pull equity

#### Subject-To
**Best for:**
- Existing mortgage in place
- Behind on payments
- Facing foreclosure
- Needs immediate relief
- Little/no equity

**Typical Terms:**
- Minimal/no down payment
- Take over existing payments
- 7-21 day close

**Profit Strategy:**
- Control with little money down
- Rent for cashflow
- Sell with owner financing
- Hold and refinance

**Risks:**
- Due-on-sale clause
- Mortgage servicing required
- Title seasoning considerations

#### Cash Purchase
**Best for:**
- Highly motivated sellers
- Distressed properties
- Quick close needed
- Below 75% ARV
- Estate/probate sales

**Typical Terms:**
- 100% cash
- 7-14 day close
- As-is condition

**Profit Strategy:**
- Quick flip
- BRRRR method
- Wholesale to another investor

#### Lease Option
**Best for:**
- Seller wants full price eventually
- Property needs minor work
- Seller can wait
- Flexible timeline
- Rental income potential

**Typical Terms:**
- 3-5% option fee
- Market or below market rent
- 1-3 year term
- Fixed or escalating option price

**Profit Strategy:**
- Sandwich lease (re-lease with option)
- Find tenant-buyer
- Exercise option if market rises
- Cashflow during option period

## API Integration for n8n

If you want to connect this to n8n (the automation platform mentioned in your requirements), you can expose API endpoints:

### Create Webhook Endpoint in n8n

1. Add a "Webhook" node at the start of the workflow
2. Set HTTP Method to POST
3. Set path to `/chat`
4. This creates an endpoint like: `https://your-n8n-instance.com/webhook/chat`

### API Request Format

```json
POST /webhook/chat
{
  "message": "Write a follow-up email for a seller who wants seller financing",
  "source_priority": "high",
  "context": {
    "propertyAddress": "123 Main St",
    "sellerName": "John Doe",
    "previousEmail": "..."
  }
}
```

### Response Format

```json
{
  "answer": "Generated email content...",
  "sources": ["deal analysis", "investment criteria"],
  "tokenCount": 450,
  "confidence": 0.85,
  "dealType": "seller_finance",
  "estimatedProfit": 45000
}
```

## Troubleshooting

### Emails Not Being Processed

**Check:**
1. Email credential is valid (test connection)
2. Polling interval is set (not manual trigger)
3. Email folder is correct (INBOX)
4. No errors in execution log

### AI Not Generating Good Responses

**Solutions:**
1. Upgrade to GPT-4 if using GPT-3.5
2. Increase temperature for more creative responses (0.7-0.9)
3. Provide more context in prompts
4. Add example emails to system prompts

### Too Many Manual Reviews

**Adjust:**
1. Lower confidence threshold (from 0.7 to 0.6)
2. Reduce minimum profit requirement
3. Add more deal structure options
4. Improve signal detection keywords

### Emails Sending Too Fast

**Add delays:**
1. Insert "Wait" nodes between sends
2. Add rate limiting logic
3. Batch process every few hours instead of real-time

### Wrong Deal Type Selected

**Improve analysis:**
1. Add more signal detection keywords in config
2. Provide example scenarios in AI prompts
3. Increase temperature for creativity
4. Add more context about your market

## Best Practices

### 1. Start with Manual Review Mode

- Set all deals to require manual review initially
- Review AI suggestions for first 20-30 emails
- Adjust prompts and criteria based on results
- Gradually enable auto-approval for high-confidence deals

### 2. Build Your Knowledge Base

The AI gets better with examples. Add to system prompts:
- Your actual successful negotiation emails
- Common scenarios in your market
- Your specific communication style
- Market-specific terminology

### 3. Monitor and Optimize

- Review sent emails weekly
- Track response rates
- Adjust criteria based on which deals close
- A/B test different communication styles

### 4. Maintain Your Reputation

- Don't send to everyone automatically at first
- Review high-value deals manually
- Personalize responses for repeat contacts
- Monitor for AI hallucinations or errors

### 5. Compliance and Legal

- Consult with a real estate attorney about creative financing disclosures
- Ensure emails comply with CAN-SPAM Act
- Include proper disclaimers about not being licensed realtor (if applicable)
- Document all communications for legal protection

## Advanced Features

### Add Personality Modes

Create multiple email personalities for different situations:

```javascript
const personalities = {
  professional: "Formal business tone, focus on credentials",
  friendly: "Casual and approachable, focus on relationship",
  direct: "No-nonsense, focus on solving problems fast",
  consultative: "Educational tone, position as advisor"
};

// Select based on sender type and situation
const selectedPersonality = (senderType === 'realtor') ? 'professional' : 'friendly';
```

### Multi-Language Support

Add translation nodes for international markets:

```javascript
// Detect language
const detectedLanguage = detectLanguage($json.plainTextBody);

// Translate if needed
if (detectedLanguage !== 'en') {
  // Translate to English for analysis
  // Translate response back to original language
}
```

### Property Valuation Integration

Connect to Zillow, Redfin, or Propstream APIs:

1. Extract address from email
2. Look up property data
3. Get estimated value and comps
4. Use in deal analysis
5. Calculate more accurate offers

### Follow-Up Sequences

Add automated follow-up logic:

```javascript
// After 3 days, if no response
if (daysSinceLastEmail > 3 && !receivedResponse) {
  // Send follow-up email
  // Adjust approach based on original email
}

// After 7 days
if (daysSinceLastEmail > 7 && !receivedResponse) {
  // Send final follow-up
  // Or mark as cold lead
}
```

## Cost Estimation

### OpenAI API Costs

Using GPT-4 Turbo:
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens

Average email processing:
- Analysis: ~1,500 tokens input, 500 tokens output = $0.03
- Deal structure: ~2,000 tokens input, 800 tokens output = $0.044
- Email generation: ~2,500 tokens input, 600 tokens output = $0.043

**Total per email: ~$0.12**

For 100 emails/month: ~$12/month in AI costs

### n8n Costs

- Self-hosted: Free (hosting costs only)
- n8n Cloud Starter: $20/month
- n8n Cloud Pro: $50/month

### Total Monthly Cost Estimate

- 100 emails/month: $12 (AI) + $20 (n8n Cloud) = **$32/month**
- 500 emails/month: $60 (AI) + $50 (n8n Cloud) = **$110/month**

## Support and Updates

### Getting Help

1. Check n8n community forum: https://community.n8n.io
2. OpenAI API documentation: https://platform.openai.com/docs
3. Review execution logs in n8n for errors

### Updating the Workflow

When updating:
1. Export your current workflow as backup
2. Import new version
3. Reconfigure credentials
4. Test thoroughly before activating

### Version History

- v1.0 (2026-01-03): Initial release with core functionality

## Legal Disclaimer

This tool is for informational and automation purposes only. It does not constitute legal, financial, or real estate advice. Always:

- Consult with licensed professionals
- Verify all AI-generated content before sending
- Comply with local real estate laws and regulations
- Ensure proper disclosures and licensing
- Monitor automated communications for accuracy

The creators assume no liability for deals, negotiations, or communications generated by this system.

## License

This workflow is provided as-is for your use. Feel free to modify and adapt to your specific needs.

---

**Built for real estate investors who want to scale their deal flow without sacrificing quality.**

Questions? Issues? Suggestions? Open an issue or contribute to the project!
# AI-Brain
