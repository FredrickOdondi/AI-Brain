# AI Email Negotiator - Workflow Diagram

## Visual Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EMAIL ARRIVES IN INBOX                              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  📧 EMAIL TRIGGER (IMAP)                                                     │
│  • Polls inbox every minute                                                  │
│  • Retrieves unread emails                                                   │
│  • Marks as read after processing                                            │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔧 PARSE EMAIL DATA                                                         │
│  • Extract sender, subject, body                                             │
│  • Convert HTML to plain text                                                │
│  • Prepare for AI analysis                                                   │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  🤖 AI EMAIL ANALYSIS                                                        │
│  • Determine sender type (realtor vs direct seller)                          │
│  • Extract property details                                                  │
│  • Assess motivation level (high/medium/low)                                 │
│  • Identify urgency and timeline                                             │
│  • Detect problems (foreclosure, repairs, etc.)                              │
│  • Analyze equity position                                                   │
│  • Calculate confidence score                                                │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 PARSE AI ANALYSIS                                                        │
│  • Convert AI response to structured data                                    │
│  • Extract JSON from response                                                │
│  • Merge with original email data                                            │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────┴────────────┐
                    │   ROUTE BY SENDER TYPE   │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
    ┌───────────────────────┐         ┌──────────────────────┐
    │  👔 REALTOR PATH      │         │  🏠 DIRECT SELLER    │
    │                       │         │      PATH            │
    │  Deal Types:          │         │                      │
    │  • Cash Offer         │         │  Deal Types:         │
    │  • Conventional       │         │  • Seller Finance    │
    │  • Seller Concessions │         │  • Subject-To        │
    │  • Creative Financing │         │  • Cash              │
    │                       │         │  • Lease Option      │
    │  Tone: Professional   │         │  • Novation          │
    │  Focus: Credentials   │         │  • Wrap Mortgage     │
    │                       │         │  • Wholesaling       │
    └───────────┬───────────┘         │                      │
                │                     │  Tone: Empathetic    │
                │                     │  Focus: Problem-     │
                │                     │         solving      │
                │                     └──────────┬───────────┘
                │                                │
                └────────────────┬───────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  🤖 AI DEAL STRUCTURE RECOMMENDATION                                         │
│  • Analyze seller situation                                                  │
│  • Match situation to ideal deal type                                        │
│  • Calculate estimated terms                                                 │
│  • Project potential profit                                                  │
│  • Assess risk level                                                         │
│  • Identify red flags                                                        │
│  • Provide alternative deal options                                          │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 PARSE DEAL STRUCTURE                                                     │
│  • Extract recommendation from AI                                            │
│  • Structure terms data                                                      │
│  • Prepare for validation                                                    │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ VALIDATE INVESTMENT CRITERIA                                             │
│  • Check minimum profit ($30k+)                                              │
│  • Verify ARV ratio (<75%)                                                   │
│  • Assess confidence score                                                   │
│  • Review red flags                                                          │
│  • Evaluate risk level                                                       │
│  • Determine approval status:                                                │
│    - Auto Approved (high confidence, meets criteria)                         │
│    - Manual Review (medium confidence or edge case)                          │
│    - Rejected (doesn't meet minimums)                                        │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────┴────────────┐
                    │   CHECK IF APPROVED     │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
    ❌ REJECTED │                                 │ ✅ APPROVED
                │                                 │
                ▼                                 ▼
    ┌───────────────────────┐         ┌──────────────────────┐
    │  🚫 REJECTED PATH     │         │  ✉️ GENERATE EMAIL    │
    │                       │         │                      │
    │  • Stop processing    │         │  AI creates:         │
    │  • Send notification  │         │  • Personalized      │
    │  • Log as rejected    │         │    response          │
    │                       │         │  • Appropriate tone  │
    └───────────────────────┘         │  • Deal explanation  │
                                      │  • Next steps        │
                                      │  • Value proposition │
                                      └──────────┬───────────┘
                                                 │
                                                 ▼
                                      ┌──────────────────────┐
                                      │  📝 PREPARE RESPONSE │
                                      │                      │
                                      │  • Format email body │
                                      │  • Create subject    │
                                      │  • Add metadata      │
                                      └──────────┬───────────┘
                                                 │
                                                 ▼
                                      ┌──────────────────────┐
                                      │  📤 SEND EMAIL       │
                                      │                      │
                                      │  • Send via Gmail    │
                                      │  • Include signature │
                                      │  • Thread properly   │
                                      └──────────┬───────────┘
                                                 │
                                                 ▼
                                ┌────────────────┴────────────────┐
                                │                                 │
                                ▼                                 ▼
                    ┌────────────────────┐          ┌─────────────────────┐
                    │  📊 LOG TO SHEETS  │          │  🗄️ CREATE CRM      │
                    │                    │          │     RECORD          │
                    │  • Timestamp       │          │                     │
                    │  • Sender          │          │  • New deal entry   │
                    │  • Deal type       │          │  • Status tracking  │
                    │  • Estimated profit│          │  • Follow-up needed │
                    │  • Confidence      │          │  • Contact info     │
                    └────────────────────┘          └─────────────────────┘
```

## Decision Points Explained

### 1. Sender Type Detection
**Question:** Is this email from a realtor or direct seller?

**Signals for REALTOR:**
- Email signature with brokerage
- MLS references
- Real estate license number
- Professional email domain
- Words: "listing agent", "representing", "broker"

**Signals for DIRECT SELLER:**
- Personal email (Gmail, Yahoo, etc.)
- First-person language ("my house", "I need")
- No professional signature
- Emotional language
- Direct property ownership mentioned

### 2. Deal Structure Selection

**The AI evaluates:**

```
IF seller has high motivation + existing mortgage + facing foreclosure
  → RECOMMEND: Subject-To

ELSE IF seller owns free & clear + wants income + not rushed
  → RECOMMEND: Seller Finance

ELSE IF property distressed + needs quick close + below ARV
  → RECOMMEND: Cash

ELSE IF seller flexible timeline + wants future value + rental potential
  → RECOMMEND: Lease Option

ELSE IF realtor + standard transaction + good condition
  → RECOMMEND: Cash or Conventional
```

### 3. Validation Decision Tree

```
START
  │
  ├─ Estimated Profit < $15,000?
  │   YES → REJECT
  │   NO → Continue
  │
  ├─ Confidence < 0.3?
  │   YES → REJECT
  │   NO → Continue
  │
  ├─ Estimated Profit < $30,000?
  │   YES → MANUAL REVIEW
  │   NO → Continue
  │
  ├─ Confidence < 0.6?
  │   YES → MANUAL REVIEW
  │   NO → Continue
  │
  ├─ Risk Level = High?
  │   YES → MANUAL REVIEW
  │   NO → Continue
  │
  ├─ Red Flags > 2?
  │   YES → MANUAL REVIEW
  │   NO → Continue
  │
  └─ All Criteria Met?
      YES → AUTO APPROVE
      NO → MANUAL REVIEW
```

## Data Flow Example

Let's trace a real email through the system:

### Input Email
```
From: sarah.martinez@gmail.com
Subject: Need to sell house ASAP

I'm 3 months behind on my mortgage and facing foreclosure.
I owe $185,000 on my house at 456 Oak Street. I think it's
worth around $250,000. Need to sell in 30 days. Please help!
```

### After Email Analysis
```json
{
  "senderType": "direct_seller",
  "sellerSituation": {
    "motivation": "high",
    "urgency": "immediate",
    "propertyAddress": "456 Oak Street",
    "constraints": ["must close in 30 days", "behind on payments"],
    "problems": ["foreclosure", "behind on mortgage"],
    "equityPosition": "medium",
    "owedAmount": "$185,000",
    "askingPrice": null
  },
  "confidence": 0.92
}
```

### After Deal Structure Selection
```json
{
  "recommendedDealType": "Subject-To",
  "reasoning": "High motivation, existing mortgage, foreclosure threat, immediate timeline - perfect for Subject-To takeover of existing mortgage",
  "estimatedTerms": {
    "purchasePrice": "Take over existing mortgage",
    "downPayment": "$5,000-$10,000 to seller",
    "monthlyPayment": "Existing mortgage payment",
    "closingTimeframe": "14-21 days"
  },
  "profitProjection": {
    "estimatedProfit": "$45,000",
    "riskLevel": "medium",
    "timeToProfit": "12-18 months"
  },
  "confidence": 0.88
}
```

### After Validation
```json
{
  "approvalStatus": "auto_approved",
  "passedCriteria": true,
  "warnings": [],
  "shouldProceed": true
}
```

### Generated Email
```
Subject: Re: Need to sell house ASAP

Hi Sarah,

Thank you for reaching out. I understand you're in a difficult
situation with the mortgage payments, and I want you to know
there are solutions available that could help you avoid
foreclosure while moving forward with your life.

I specialize in helping homeowners in situations exactly like
yours. Based on what you've shared, I have a solution that
could work well:

Instead of a traditional sale, I can take over your existing
mortgage payments immediately. This means:

• You stop foreclosure proceedings right away
• No need to wait 60-90 days for a traditional sale
• I can close in 14-21 days
• You walk away with some cash in your pocket
• Your credit is protected from foreclosure

Here's what I'm proposing:
• I take over your $185,000 mortgage and make all payments
• I'll give you $5,000-$10,000 at closing to help with your
  next steps
• We can close in 2-3 weeks, well before your 30-day deadline
• You're released from all liability on the property

This is called a "Subject-To" purchase, and it's specifically
designed for situations like yours where time is critical and
you need immediate relief.

Would you be available for a quick 15-minute call this week
to discuss the details? I can explain exactly how this works
and answer any questions you have.

I'm here to help you through this.

Best regards,
[Your Name]
[Your Contact Info]
```

## Processing Timeline

```
Email Received                    → 0 seconds
  ↓
Email Parsed                      → 1-2 seconds
  ↓
AI Analysis (GPT-4)              → 5-10 seconds
  ↓
Parse Analysis                    → 1 second
  ↓
Route by Sender Type             → <1 second
  ↓
AI Deal Structure (GPT-4)        → 5-10 seconds
  ↓
Parse Deal Structure             → 1 second
  ↓
Validate Criteria                → 1-2 seconds
  ↓
Generate Email (GPT-4)           → 10-15 seconds
  ↓
Prepare & Send                   → 2-3 seconds
  ↓
Log to Tracking                  → 2-3 seconds

TOTAL: 30-45 seconds
```

## Token Usage Breakdown

**Per Email Processing:**

1. Email Analysis: ~1,500 input + 500 output = 2,000 tokens
2. Deal Structure: ~2,000 input + 800 output = 2,800 tokens
3. Email Generation: ~2,500 input + 600 output = 3,100 tokens

**Total: ~7,900 tokens per email**

**Cost Calculation (GPT-4 Turbo):**
- Input: 6,000 tokens × $0.01/1k = $0.06
- Output: 1,900 tokens × $0.03/1k = $0.057
- **Total per email: ~$0.12**

## Error Handling Flow

```
┌─────────────┐
│  Any Node   │
└──────┬──────┘
       │
       │ Error occurs?
       │
       ▼
   ┌───────┐
   │  YES  │
   └───┬───┘
       │
       ▼
┌──────────────────┐
│  Retry Logic     │
│  • Try 3 times   │
│  • Wait 5 sec    │
└────────┬─────────┘
         │
         │ Still failing?
         │
         ▼
    ┌────────┐
    │  YES   │
    └───┬────┘
        │
        ▼
┌──────────────────────┐
│  Error Notification  │
│  • Log to console    │
│  • Save to manual    │
│    review queue      │
│  • Alert admin       │
└──────────────────────┘
```

## Optimization Points

**Speed Optimizations:**
1. Use GPT-3.5-turbo for simple analysis (3x faster)
2. Reduce token limits in prompts
3. Parallel processing where possible
4. Cache common responses

**Cost Optimizations:**
1. Filter out spam before AI processing
2. Use cheaper model for initial classification
3. Batch process during off-peak hours
4. Cache property valuations

**Quality Optimizations:**
1. A/B test different prompts
2. Track response rates by deal type
3. Collect feedback on email quality
4. Refine based on closed deals

---

This workflow processes emails from **raw inbox message** to **personalized negotiation email sent** in under 60 seconds, with full deal analysis and validation.
