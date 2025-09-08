# NextJS Documentation Chatbot MVP

## Project Overview
Create a minimal effort, high-performance AI chatbot for a NextJS documentation app with RAG (Retrieval Augmented Generation) capabilities.

## Feature Requirements

### Core Features
- **AI Chat Interface**: Clean, floating chat widget integrated into existing docs site
- **RAG Document Search**: Semantic search through documentation content with LLM responses
- **Real-time Streaming**: Fast response streaming for better UX
- **Context Awareness**: Chatbot understands and references specific documentation sections
- **Markdown Support**: Proper rendering of code blocks and formatting in responses

### Technical Requirements
- **Framework**: NextJS (existing app)
- **Minimal Dependencies**: Use Vercel AI SDK + OpenAI for simplicity
- **Fast Performance**: Sub-2s response times, optimized embedding search
- **Low Complexity**: Single vector store, simple preprocessing pipeline
- **Production Ready**: Error handling, rate limiting, proper API structure

## Implementation Architecture

### Tech Stack
- **Frontend**: NextJS + React + Tailwind CSS
- **AI/LLM**: OpenAI GPT-3.5-turbo + text-embedding-3-small
- **Vector Store**: SQLite with vector extension (simple, local, fast)
- **Streaming**: Vercel AI SDK for real-time responses
- **Deployment**: Vercel (seamless with NextJS)

### System Architecture
```
Docs Content → Preprocessing → Embeddings → SQLite Vector DB
                                                     ↓
User Query → Embedding → Similarity Search → Context + LLM → Streaming Response
```

### File Structure
```
/lib/
  ├── embeddings.ts      # Embedding generation utilities
  ├── vector-store.ts    # SQLite vector operations
  ├── preprocessing.ts   # Docs content processing
  └── openai.ts         # OpenAI client configuration

/pages/api/
  ├── chat.ts           # Main chat endpoint with RAG
  └── setup-docs.ts     # One-time docs preprocessing endpoint

/components/
  ├── ChatWidget.tsx    # Main chat interface
  ├── ChatMessage.tsx   # Individual message component
  └── ChatInput.tsx     # Input with submit handling

/scripts/
  └── preprocess-docs.ts # Script to build initial vector index

/docs/ (existing)
  └── *.md             # Your existing documentation files
```

## Implementation Tasks

### Phase 1: Core Setup (Priority: High)
1. **Project Dependencies**
   - Install Vercel AI SDK, OpenAI, better-sqlite3
   - Configure environment variables for OpenAI API
   - Set up TypeScript types for chat messages and docs

2. **Vector Store Implementation**
   - Create SQLite database schema for documents and embeddings
   - Implement embedding storage and retrieval functions
   - Add cosine similarity search functionality

3. **Document Preprocessing**
   - Build markdown parser for existing docs
   - Create chunking strategy (500-1000 tokens per chunk)
   - Generate and store embeddings for all doc chunks
   - Create metadata indexing (file path, section headers, etc.)

### Phase 2: Chat API (Priority: High)
1. **RAG Pipeline**
   - Implement query embedding generation
   - Build similarity search with configurable top-k results
   - Create context assembly for LLM prompts
   - Add response streaming with proper error handling

2. **API Endpoints**
   - `/api/chat` - Main chat endpoint with RAG
   - `/api/setup-docs` - One-time preprocessing trigger
   - Add rate limiting and input validation

### Phase 3: Frontend Interface (Priority: Medium)
1. **Chat Widget Component**
   - Floating chat interface (bottom-right corner)
   - Collapsible/expandable design
   - Message history with proper scrolling
   - Loading states and error handling

2. **Message Components**
   - User message styling
   - AI response with markdown rendering
   - Code block syntax highlighting
   - Source document references

3. **Integration**
   - Add chat widget to existing NextJS app layout
   - Responsive design for mobile/desktop
   - Keyboard shortcuts and accessibility

### Phase 4: Optimization (Priority: Low)
1. **Performance**
   - Implement response caching for common queries
   - Optimize embedding search performance
   - Add request deduplication

2. **UX Enhancements**
   - Suggested questions based on current page
   - Document section linking in responses
   - Chat history persistence

## Technical Specifications

### API Design
```typescript
// POST /api/chat
interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
}

interface ChatResponse {
  // Streaming response via Server-Sent Events
  content: string;
  sources?: { file: string; section: string; score: number }[];
}
```

### Database Schema
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY,
  file_path TEXT NOT NULL,
  section_title TEXT,
  content TEXT NOT NULL,
  embedding BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_embedding ON documents(embedding);
```

### Environment Variables
```env
OPENAI_API_KEY=sk-...
DATABASE_URL=./docs-chatbot.db
NODE_ENV=production
```

## Success Criteria
- [ ] Chat widget integrates seamlessly with existing docs site
- [ ] Response time under 2 seconds for 95% of queries
- [ ] Accurate responses citing relevant documentation sections
- [ ] Clean, professional UI matching existing site design
- [ ] Production-ready error handling and rate limiting
- [ ] Simple deployment process to Vercel

## Getting Started
1. Clone/navigate to your existing NextJS docs project
2. Run the setup script to install dependencies
3. Configure OpenAI API key in environment variables
4. Run preprocessing script to build initial vector index
5. Start development server and test chat functionality

## Notes for Claude Code
- Prioritize simplicity and performance over feature completeness
- Use existing NextJS patterns and don't over-engineer
- Ensure proper TypeScript types throughout
- Add comprehensive error handling for production use
- Focus on making the chat feel fast and responsive
- Keep the vector store simple but scalable for future needs
