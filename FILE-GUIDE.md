# File Guide - What Each File Does

## 📂 Directory Structure

```
smartemail/
├── n8n-email-negotiator-workflow.json     [IMPORT THIS TO N8N]
├── investment-criteria-config.json        [REFERENCE/CUSTOMIZE]
├── PROJECT-SUMMARY.md                     [START HERE]
├── QUICK-START.md                         [SETUP GUIDE]
├── README.md                              [COMPLETE DOCS]
├── WORKFLOW-DIAGRAM.md                    [VISUAL GUIDE]
├── example-emails.md                      [TEST SCENARIOS]
└── FILE-GUIDE.md                          [THIS FILE]
```

## 🎯 Quick Navigation

### "I want to get started fast"
→ **Read:** `QUICK-START.md`
→ **Import:** `n8n-email-negotiator-workflow.json`
→ **Test with:** `example-emails.md`

### "I want to understand how it works"
→ **Read:** `PROJECT-SUMMARY.md` first
→ **Then:** `WORKFLOW-DIAGRAM.md`
→ **Details:** `README.md`

### "I want to customize it"
→ **Reference:** `investment-criteria-config.json`
→ **Guide:** `README.md` (Customization section)
→ **Modify:** The workflow JSON directly in n8n

### "I want to test it"
→ **Use:** `example-emails.md`
→ **Follow:** `QUICK-START.md` (Step 7)

## 📄 Detailed File Descriptions

### 1. n8n-email-negotiator-workflow.json
**Size:** 25 KB | **Type:** n8n Workflow | **Priority:** CRITICAL

**What it is:**
The complete n8n workflow configuration with all nodes, connections, and AI prompts.

**What to do with it:**
1. Import into your n8n instance
2. Configure credentials (email, OpenAI)
3. Activate the workflow
4. DON'T edit the JSON manually - use n8n's visual editor

**Contains:**
- 20+ workflow nodes
- Email trigger configuration
- 3 AI analysis prompts
- Deal structure logic
- Validation rules
- Email sending setup
- Logging integrations

**Status:** Ready to use (just needs your credentials)

---

### 2. investment-criteria-config.json
**Size:** 9.8 KB | **Type:** Configuration Reference | **Priority:** IMPORTANT

**What it is:**
A structured reference document showing all the deal structures, criteria, and rules used by the AI.

**What to do with it:**
1. Read to understand the logic
2. Use as reference when customizing
3. Copy sections when modifying AI prompts
4. Keep it updated as you change workflow

**Contains:**
- Investment criteria settings
- All 7 deal structure definitions
- Communication style guides
- Signal detection keywords
- Auto-approval rules
- n8n connection requirements

**Status:** Reference only (not directly used by workflow, but informs it)

---

### 3. PROJECT-SUMMARY.md
**Size:** 16 KB | **Type:** Overview | **Priority:** START HERE

**What it is:**
High-level overview of the entire project - what it does, why it's useful, and how to get started.

**What to do with it:**
1. Read first to understand scope
2. Use as reference for features
3. Share with team members
4. Review ROI calculations

**Contains:**
- Feature overview
- What's included
- Architecture summary
- Cost breakdown
- Success metrics
- Next steps

**Status:** Read-only documentation

---

### 4. QUICK-START.md
**Size:** 9.9 KB | **Type:** Setup Guide | **Priority:** CRITICAL

**What it is:**
Step-by-step 30-minute setup guide to get you from zero to sending your first AI email.

**What to do with it:**
1. Follow sequentially during setup
2. Check off each step
3. Use troubleshooting section if stuck
4. Refer back for credential setup

**Contains:**
- Prerequisites checklist
- 8 setup steps with time estimates
- Credential configuration
- Testing procedure
- Common issues & fixes
- Daily operation guide

**Status:** Follow during initial setup

---

### 5. README.md
**Size:** 16 KB | **Type:** Complete Documentation | **Priority:** IMPORTANT

**What it is:**
Comprehensive documentation covering everything about the system.

**What to do with it:**
1. Skim after reading QUICK-START
2. Deep dive into sections as needed
3. Reference when customizing
4. Use troubleshooting section

**Contains:**
- Detailed feature descriptions
- Installation guide
- Customization instructions
- Deal structure playbook
- API integration info
- Best practices
- Advanced features
- Legal disclaimers

**Status:** Reference documentation

---

### 6. WORKFLOW-DIAGRAM.md
**Size:** 22 KB | **Type:** Visual Guide | **Priority:** HELPFUL

**What it is:**
Visual diagrams showing how emails flow through the system.

**What to do with it:**
1. Review to understand the logic flow
2. Use when debugging issues
3. Reference when customizing
4. Share with technical team

**Contains:**
- ASCII flowcharts
- Decision tree diagrams
- Data transformation examples
- Processing timeline
- Token usage breakdown
- Error handling flows

**Status:** Visual reference

---

### 7. example-emails.md
**Size:** 12 KB | **Type:** Test Cases | **Priority:** IMPORTANT

**What it is:**
10 realistic test emails covering different scenarios you'll encounter.

**What to do with it:**
1. Copy and send to test inbox
2. Verify AI responses
3. Use to calibrate the system
4. Add your own scenarios

**Contains:**
- 5 direct seller scenarios
- 3 realtor scenarios
- 2 follow-up scenarios
- Expected AI responses
- Testing checklist

**Status:** Testing resources

---

### 8. FILE-GUIDE.md
**Size:** This file | **Type:** Navigation | **Priority:** HELPFUL

**What it is:**
This document - helps you navigate all the files.

**What to do with it:**
You're reading it! Use it whenever you need to find something.

---

## 🔄 Workflow Files vs Documentation

### Files You Import/Use:
1. ✅ `n8n-email-negotiator-workflow.json` → Import to n8n

### Files You Read:
2. 📖 `PROJECT-SUMMARY.md` → Overview
3. 📖 `QUICK-START.md` → Setup guide
4. 📖 `README.md` → Complete docs
5. 📖 `WORKFLOW-DIAGRAM.md` → Visual guide
6. 📖 `example-emails.md` → Test cases
7. 📖 `investment-criteria-config.json` → Reference
8. 📖 `FILE-GUIDE.md` → This file

## 🎯 Common Tasks - Which File?

| Task | File to Use |
|------|-------------|
| First time setup | `QUICK-START.md` |
| Understanding features | `PROJECT-SUMMARY.md` |
| Importing workflow | `n8n-email-negotiator-workflow.json` |
| Testing the system | `example-emails.md` |
| Troubleshooting | `README.md` or `QUICK-START.md` |
| Customizing criteria | Modify workflow in n8n, refer to `investment-criteria-config.json` |
| Understanding flow | `WORKFLOW-DIAGRAM.md` |
| Sharing with team | `PROJECT-SUMMARY.md` + `README.md` |
| Adding deal types | `investment-criteria-config.json` (reference) + workflow AI prompts |

## 📋 Setup Checklist with Files

- [ ] Read `PROJECT-SUMMARY.md` (5 min)
- [ ] Follow `QUICK-START.md` (30 min)
- [ ] Import `n8n-email-negotiator-workflow.json` (2 min)
- [ ] Configure credentials per `QUICK-START.md` (15 min)
- [ ] Test using `example-emails.md` (10 min)
- [ ] Review `WORKFLOW-DIAGRAM.md` to understand flow (10 min)
- [ ] Customize using `investment-criteria-config.json` as reference (15 min)
- [ ] Deep dive into `README.md` as needed (ongoing)

## 💡 Pro Tips

**Tip 1: Print This Guide**
Keep `QUICK-START.md` open while doing initial setup.

**Tip 2: Bookmark Key Sections**
- Troubleshooting in `README.md`
- Decision trees in `WORKFLOW-DIAGRAM.md`
- Test scenarios in `example-emails.md`

**Tip 3: Customize Progressively**
1. Get it working with defaults first
2. Test with `example-emails.md`
3. Then customize using `investment-criteria-config.json` as guide

**Tip 4: Keep Config in Sync**
When you modify the workflow in n8n, update your notes in `investment-criteria-config.json` for reference.

## 🔍 Finding Specific Information

### "How do I configure OpenAI?"
→ `QUICK-START.md` - Step 3

### "What deal structures are supported?"
→ `investment-criteria-config.json` - dealStructures section
→ `README.md` - Deal Structure Playbook

### "How does the AI decide which deal type?"
→ `WORKFLOW-DIAGRAM.md` - Decision Points section
→ `investment-criteria-config.json` - idealFor conditions

### "What if emails aren't being processed?"
→ `QUICK-START.md` - Common Issues section
→ `README.md` - Troubleshooting section

### "How do I adjust investment criteria?"
→ `QUICK-START.md` - Step 6
→ `investment-criteria-config.json` - investmentCriteria section

### "What does each workflow node do?"
→ `WORKFLOW-DIAGRAM.md` - Data Flow Example
→ Open workflow in n8n and read node descriptions

### "How much will this cost?"
→ `PROJECT-SUMMARY.md` - Cost Summary
→ `README.md` - Cost Estimation

## 📱 Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  AI EMAIL NEGOTIATOR - QUICK REFERENCE      │
├─────────────────────────────────────────────┤
│  Setup:        QUICK-START.md               │
│  Overview:     PROJECT-SUMMARY.md           │
│  Docs:         README.md                    │
│  Flow:         WORKFLOW-DIAGRAM.md          │
│  Tests:        example-emails.md            │
│  Config:       investment-criteria-         │
│                config.json                  │
│  Import:       n8n-email-negotiator-        │
│                workflow.json                │
├─────────────────────────────────────────────┤
│  Support:                                   │
│  n8n:          community.n8n.io             │
│  OpenAI:       help.openai.com              │
└─────────────────────────────────────────────┘
```

## 🚀 Ready to Start?

1. **Right now:** Read `PROJECT-SUMMARY.md` (5 min)
2. **Then:** Follow `QUICK-START.md` step by step (30 min)
3. **After setup:** Test with `example-emails.md` (10 min)
4. **When confident:** Go live and monitor results!

---

**Questions about which file to use?** This guide has you covered!

**Can't find what you need?** Check the table of contents in `README.md`
