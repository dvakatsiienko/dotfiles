# Claude Code Implementation Task

## Objective
Implement a production-ready AI chatbot with RAG capabilities for a NextJS documentation site. Focus on minimal complexity while maintaining high performance and user experience.

## Current Context
- **Target**: Existing NextJS documentation application
- **Goal**: Add AI chatbot that can search and discuss documentation content
- **Constraints**: Minimal effort, maximum performance, production-ready

## Implementation Priority Order

### 1. Core Infrastructure (Start Here)
**Task**: Set up the foundational systems
- Install and configure dependencies (Vercel AI SDK, OpenAI, better-sqlite3)
- Create vector store implementation with SQLite
- Build document preprocessing pipeline
- Implement embedding generation and storage

**Deliverables**:
- `lib/vector-store.ts` - SQLite operations with vector similarity search
- `lib/embeddings.ts` - OpenAI embedding generation utilities
- `scripts/preprocess-docs.ts` - Script to process existing markdown docs
- Database schema and initial data population

### 2. RAG API Implementation
**Task**: Build the chat API with retrieval-augmented generation
- Create `/api/chat` endpoint with streaming responses
- Implement semantic search pipeline
- Add context assembly and LLM prompting
- Include proper error handling and rate limiting

**Deliverables**:
- `pages/api/chat.ts` - Main chat endpoint
- RAG pipeline with configurable similarity search
- Response streaming implementation
- Source citation in responses

### 3. Frontend Chat Interface
**Task**: Create user-facing chat widget
- Build floating chat widget component
- Implement message rendering with markdown support
- Add proper loading states and error handling
- Integrate with existing NextJS app

**Deliverables**:
- `components/ChatWidget.tsx` - Main chat interface
- `components/ChatMessage.tsx` - Message rendering component
- Integration with existing app layout
- Responsive design for all screen sizes

## Technical Specifications

### Dependencies to Install
```json
{
  "ai": "^3.0.0",
  "openai": "^4.0.0",
  "better-sqlite3": "^9.0.0",
  "@types/better-sqlite3": "^7.6.0"
}
```

### Key Files to Create

1. **`lib/vector-store.ts`**
   - SQLite database setup with vector operations
   - Document storage and retrieval functions
   - Cosine similarity search implementation

2. **`lib/embeddings.ts`**
   - OpenAI embedding generation wrapper
   - Batch processing for multiple texts
   - Error handling for API limits

3. **`pages/api/chat.ts`**
   - RAG pipeline implementation
   - Streaming response using Vercel AI SDK
   - Context window management

4. **`components/ChatWidget.tsx`**
   - Complete chat interface
   - Message history and input handling
   - Integration with chat API

5. **`scripts/preprocess-docs.ts`**
   - Markdown file processing
   - Content chunking strategy
   - Embedding generation and storage

### Architecture Decisions Made
- **Vector Store**: SQLite with vector extension (simple, local, fast)
- **Chunking**: 500-1000 tokens per chunk with overlap
- **Embedding Model**: text-embedding-3-small (cost-effective)
- **LLM**: GPT-3.5-turbo (fast, reliable)
- **UI Pattern**: Floating widget (non-intrusive)

### Performance Requirements
- Response time: < 2 seconds for 95% of queries
- Vector search: < 500ms for similarity search
- UI responsiveness: Immediate feedback, streaming responses
- Memory usage: Efficient embedding storage and retrieval

## Implementation Notes

### Vector Search Implementation
Use cosine similarity with SQLite JSON functions for embedding comparison. Store embeddings as JSON arrays for simplicity.

### Context Assembly Strategy
- Retrieve top 3-5 most similar document chunks
- Include document metadata (file path, section title)
- Assemble context with clear source attribution
- Limit total context to fit within model limits

### Error Handling Priority
1. OpenAI API failures (rate limits, timeouts)
2. Vector store connection issues
3. Malformed user inputs
4. Empty search results

### UI/UX Considerations
- Chat should feel integrated, not bolted-on
- Messages should stream in real-time
- Include source links back to documentation
- Graceful handling of long responses

## Quality Gates
Before considering complete:
- [ ] Chat responds accurately to documentation questions
- [ ] Responses include relevant source citations
- [ ] UI is responsive and matches site design
- [ ] Error states are handled gracefully
- [ ] Performance meets specified requirements
- [ ] Code is properly typed and documented

## Suggested Development Workflow
1. Start with vector store and embedding utilities
2. Build preprocessing script and populate initial data
3. Implement chat API with basic RAG pipeline
4. Create minimal frontend interface
5. Test end-to-end functionality
6. Polish UI and add error handling
7. Performance optimization and final testing

## Environment Setup Required
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=./docs-chatbot.db
NODE_ENV=development
```

Focus on getting a working end-to-end system first, then iterate on improvements. The goal is a production-ready MVP that can be deployed immediately.
