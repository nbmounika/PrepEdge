# PrepEdge – BITSoM Mock Interview Prep Chatbot

PrepEdge is a specialized AI-powered mock interview assistant created exclusively for BITSoM students. It simulates realistic interview environments using BITSoM's internal repository of interview transcripts, casebooks, primers, and formulas, enabling students to practice domain-specific interviews with structured evaluation and personalized feedback.

PrepEdge is deployed on Vercel and designed to be easily customizable with minimal technical knowledge. Most changes can be made by editing just two files: config.ts and prompts.ts.

## ⭐ Overview

PrepEdge enables BITSoM students to:

- Practice domain-specific interviews (Marketing, Finance, Consulting, Operations & General Management)
- Select a specific topic within a domain (e.g., Profitability, Valuations, Pricing, Market Entry)
- Answer questions sourced strictly from BITSoM's internal documents
- Receive structured performance feedback, including scoring and improvement suggestions
- View citations that link directly to the exact file used (not a folder)
- Benefit from built-in content moderation and safety guardrails

*PrepEdge does not use generic MBA interview questions or external interview content.*

---

## 🔑 Key Files to Customize

### config.ts — Core Application Settings

This is the main configuration file. You can modify:

- *AI Identity*
  - AI_NAME — The chatbot's name
  - OWNER_NAME — The creator or organization

- *Welcome Message*
  - Displayed automatically when the chat opens

- *UI Text*
  - CLEAR_CHAT_TEXT (text for "New Chat" button)

- *Moderation Messages*
  - Custom responses to harmful or unsafe content

- *Model Selection*
  - MODEL — The AI model used in the backend

- *Vector Database Settings*
  - PINECONE_TOP_K
  - PINECONE_INDEX_NAME

*Example:*

typescript
export const AI_NAME = "PrepEdge";
export const OWNER_NAME = "BITSoM";
export const WELCOME_MESSAGE = `Hello! I'm ${AI_NAME}, your BITSoM mock interview assistant.`;


### prompts.ts — AI Behavior & Interview Logic

This file defines how the chatbot behaves. You control:

- Identity (who the AI is)
- Domain & topic selection logic
- Safety guardrails
- Tone and communication style
- Rules for selecting questions from internal sources
- Evaluation workflow
- Final feedback structure
- Citation rules (direct file links only)

The SYSTEM_PROMPT combines all sub-prompts into a single behavioral instruction set.

*Example customization:*

typescript
export const TONE_STYLE_PROMPT = `
- Maintain a formal, interviewer-style tone.
- Avoid casual language.
- Focus on evaluating reasoning clarity and structured thinking.
`;


---

## 📁 Project Structure


PrepEdge/
├── app/
│   ├── api/chat/                 # Chat API backend
│   │   ├── route.ts              # Main chat handler
│   │   └── tools/                # Vector search & related tools
│   ├── page.tsx                  # Main chat interface
│   ├── parts/                    # UI components
│   └── terms/                    # Terms of Use page
├── components/
│   ├── messages/                 # Message rendering components
│   ├── ai-elements/              # Markdown & reasoning display
│   └── ui/                       # Shared UI components
├── lib/
│   ├── moderation.ts             # Content moderation
│   ├── pinecone.ts               # Vector DB integration
│   ├── sources.ts                # Link + citation logic
│   └── utils.ts                  # Utilities
├── types/                        # TypeScript types
├── prompts.ts                    # Behavior + Interview logic
├── config.ts                     # Core configuration
└── package.json                  # Dependencies


---

## 📚 Important Files Explained

### Core Application Logic

#### app/api/chat/route.ts

The main chat controller:
- Receives user messages
- Applies moderation rules
- Passes the conversation to the AI model
- Executes tools (vector search)
- Streams responses to the UI

#### app/page.tsx

The main UI:
- Shows messages
- Handles user input
- Sends chat requests
- Displays streaming responses

### Tools

#### app/api/chat/tools/search-vector-database.ts

Allows the AI to search only BITSoM's internal repository via Pinecone.

*PrepEdge never uses general web search.*

### UI Components

- **components/messages/message-wall.tsx** — Displays the list of messages
- **components/messages/assistant-message.tsx** — Formats assistant messages, reasoning, and tool output
- **components/messages/tool-call.tsx** — Shows tool call events
- **components/ai-elements/response.tsx** — Renders Markdown responses

---

## ⚙ Environment Setup (Vercel)

Configure these environment variables in the Vercel dashboard:

| Variable | Purpose |
|----------|---------|
| OPENAI_API_KEY | Required for AI model + moderation |
| PINECONE_API_KEY | Required for vector search |
| PINECONE_INDEX_NAME | Name of your Pinecone index |

**Only OPENAI_API_KEY is mandatory; the others enable vector search.**

---

## 🛠 Customization Guide

### ✔ Change Assistant Name and Identity

Edit:
- AI_NAME
- OWNER_NAME
- WELCOME_MESSAGE

in config.ts.

### ✔ Change Behavior (Interview Logic)

Edit:
- IDENTITY_PROMPT
- INTERVIEW_FLOW_PROMPT
- FEEDBACK_AND_SCORING_PROMPT

in prompts.ts.

### ✔ Modify Moderation Rules

In config.ts, update:
- MODERATION_DENIAL_MESSAGE_*

### ✔ Change the Model

In config.ts:

typescript
export const MODEL = openai("gpt-4.1");


Switch to another model as needed.

### ✔ Update Data Sources

To adjust vector search behavior:
- Update Pinecone index name in config.ts
- Use lib/pinecone.ts to configure embedding logic
- Use lib/sources.ts for direct file link formatting

---

## 🔧 Troubleshooting

### AI Not Responding

Check:
- OPENAI_API_KEY exists in Vercel
- Vercel build logs
- Browser console for frontend errors

### Questions Not Relevant to BITSoM

Ensure:
- Vector DB is populated with BITSoM content
- DATA_SCOPE_AND_RESTRICTIONS_PROMPT is intact
- No web-search tools are enabled

### Feedback Not Appearing

Verify:
- User typed END INTERVIEW
- FEEDBACK_AND_SCORING_PROMPT is not altered incorrectly

---

## 🚀 Next Steps

1. Update AI_NAME, OWNER_NAME, and welcome message
2. Customize prompts for interview behavior
3. Upload BITSoM transcripts/casebooks to Pinecone
4. Test domain + topic selection
5. Deploy to Vercel

---

## 📘 Support

For deeper technical adjustments, refer to:
- AGENTS.md for tool configuration details
- Vercel logs for deployment troubleshooting
- config.ts + prompts.ts for functionality tuning

---

## 📄 License

Add your license information here

## 👥 Contributors

Add contributor information here
