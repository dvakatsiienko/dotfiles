# Quick Start Commands

## For Claude Code
```bash
# Navigate to your NextJS docs project
cd /path/to/your/nextjs-docs-app

# Initialize with this task specification
claude-code --task="/Users/dima/.dotfiles/.clauderc/claude-workflow/claude-code-task.md" --context="/Users/dima/.dotfiles/.clauderc/claude-workflow/init.md"
```

## Manual Implementation
If using without Claude Code:

```bash
# Install dependencies
npm install ai openai better-sqlite3 @types/better-sqlite3

# Create required directories
mkdir -p lib components scripts pages/api

# Set up environment
echo "OPENAI_API_KEY=your_key_here" > .env.local
echo "DATABASE_URL=./docs-chatbot.db" >> .env.local
```

## Project Structure Expected
```
your-nextjs-app/
├── docs/                 # Your existing markdown docs
├── lib/
│   ├── vector-store.ts
│   ├── embeddings.ts
│   └── openai.ts
├── components/
│   └── ChatWidget.tsx
├── pages/api/
│   └── chat.ts
├── scripts/
│   └── preprocess-docs.ts
└── docs-chatbot.db      # Generated SQLite database
```

## First Steps After Setup
1. Configure OpenAI API key
2. Run preprocessing script to build vector index
3. Test chat API endpoint
4. Integrate chat widget into your app
5. Deploy to Vercel

The specification prioritizes getting a working MVP quickly while maintaining production quality.
