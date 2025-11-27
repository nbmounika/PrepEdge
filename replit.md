# PrepEdge - MBA Interview Preparation Platform

## Overview

PrepEdge is an AI-powered mock interview partner designed specifically for BITSoM (Birla Institute of Technology School of Management) MBA students. The application conducts realistic, technical interview simulations across multiple business domains (Marketing, Finance, Operations & General Management, and Consulting) to help students prepare for MBA placements. Built with Next.js and deployed on Vercel, it leverages AI language models, vector database search, PDF parsing, and content moderation to deliver a comprehensive interview preparation experience.

**Latest Feature**: CV Upload functionality allows students to upload their resume PDFs for personalized CV-based interview questions and feedback.

## User Preferences

Preferred communication style: Simple, everyday language.
Feature requests: Four control buttons (End Interview, Change Domain, Change Topic, Upload CV) must always be visible during chat.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14+ with App Router
- Server-side rendering (SSR) and React Server Components (RSC) enabled
- TypeScript for type safety
- Custom CSS using Tailwind CSS v4 with dark mode theming

**UI Component Library**: Radix UI primitives with shadcn/ui styling
- Comprehensive set of accessible, customizable components
- Custom AI-specific components in `components/ai-elements/` for chat interfaces, tool displays, and reasoning visualization
- Message rendering system with specialized components for user messages, assistant messages, and tool calls

**State Management**:
- React hooks for local state
- `useChat` hook from Vercel AI SDK for chat state management
- localStorage for message persistence across sessions

**Key Design Decisions**:
- **Single-page application**: All chat interaction happens on the main page (`app/page.tsx`)
- **Real-time streaming**: UI updates as AI responses stream in
- **Persistent chat history**: Messages and reasoning durations stored in browser localStorage
- **Custom message components**: Separate rendering logic for user messages, assistant messages, tool calls, and reasoning parts

### Backend Architecture

**API Routes**: Next.js API routes in `app/api/` directory
- `/api/chat/route.ts`: Main chat endpoint handling message streaming
- `/api/parse-cv/route.ts`: PDF parsing endpoint for CV extraction
- Tool-specific endpoints in `app/api/chat/tools/`

**PDF Parsing**: 
- Uses `pdf-parse` library for extracting text from PDF files
- Validates PDF file format and extracts readable text content
- Configured with `serverExternalPackages` in Next.js config to handle Node.js dependencies

**AI Integration**: Vercel AI SDK
- Multiple AI provider support (@ai-sdk/openai, @ai-sdk/fireworks, @ai-sdk/groq, @ai-sdk/deepseek, @ai-sdk/xai)
- Currently configured to use OpenAI's GPT-4.1 model
- Streaming responses with tool calling capabilities
- Reasoning middleware for extracting chain-of-thought processing

**System Prompts & Configuration**:
- `config.ts`: Application-wide settings (AI name, owner, welcome messages, moderation messages)
- `prompts.ts`: AI behavior instructions, interview flow logic, domain/topic selection rules, guardrails, and CV analysis logic
  - `CV_ANALYSIS_PROMPT`: Handles CV summarization and personalized question generation based on resume content
  - Includes instructions for behavioral, experience-specific, and skill demonstration questions

**Content Moderation**:
- OpenAI Moderation API integration (`lib/moderation.ts`)
- Category-specific denial messages for flagged content
- Special handling for dangerous content (self-harm, violence) with mental health resources

**Tool System**:
- Extensible tool architecture with individual tool files in `app/api/chat/tools/`
- Each tool has:
  - Backend implementation (tool definition and execution)
  - Frontend display component in `components/messages/tool-call.tsx`
  - Custom UI rendering based on tool type

### Data Storage Solutions

**Vector Database**: Pinecone
- Stores BITSoM's internal interview repository (transcripts, casebooks, primers)
- Semantic search for relevant interview questions and concepts
- Configuration in `lib/pinecone.ts`
- Index name and top-K results configurable via `config.ts`
- Custom search result processing with context extraction (`lib/sources.ts`)

**Client-side Storage**: Browser localStorage
- Chat message history persistence
- Reasoning duration tracking for performance insights
- Automatic data structure with messages and duration metadata

**Key Design Decisions**:
- **No traditional database**: Application is stateless on the server; all persistence is client-side or in Pinecone
- **Vector-first approach**: Interview content retrieval relies entirely on semantic search rather than keyword matching
- **Source aggregation**: Search results are processed into chunks, then aggregated into sources with metadata

### Authentication and Authorization

**Current State**: No authentication system implemented
- Open access to all users
- No user accounts or session management
- No rate limiting or usage tracking

**Implications**:
- Suitable for internal/trusted environment deployment
- Would require authentication layer for public deployment

### External Dependencies

**AI Services**:
- OpenAI API (primary LLM provider)
- OpenAI Moderation API (content safety)
- Alternative AI providers available: Fireworks, Groq, DeepSeek, xAI

**Vector Database**:
- Pinecone (vector search and storage)
- Requires API key and index configuration

**Deployment Platform**:
- Vercel (hosting and deployment)
- Automatic deployments on git push
- Edge network distribution

**Key Libraries**:
- `ai` (Vercel AI SDK): Chat streaming, tool calling, reasoning extraction
- `@ai-sdk/*`: AI provider integrations
- `@pinecone-database/pinecone`: Vector database client
- `react-hook-form` + `zod`: Form handling and validation
- `sonner`: Toast notifications
- `streamdown`: Markdown rendering with streaming support
- `react-syntax-highlighter`: Code block rendering
- `@xyflow/react`: Flow/graph visualization capabilities

**Environment Variables Required**:
- `PINECONE_API_KEY`: Pinecone authentication
- `OPENAI_API_KEY`: OpenAI services (implicit from AI SDK usage)

**Customization Philosophy**:
- Most behavioral changes require only editing `config.ts` and `prompts.ts`
- No code changes needed for AI personality, domain configuration, or welcome messages
- Tool additions require code changes but follow documented pattern in `AGENTS.md`