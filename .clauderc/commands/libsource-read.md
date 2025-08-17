---
description: read libsource with targeted prompt analysis
argument-hint: [lib-name] "prompt"
---

## libsource-read command function

This command instructs me to read a specific libsource file and extract targeted information based on your custom prompt instructions.

### Usage

`/libsource-read [lib-name] "prompt"`

### Function

When you run `/libsource-read next "server-side rendering patterns"`, I will:

1. **Load libsource file** - Read `libsource-[lib-name].txt` from `.membank/libsource/`
2. **Parse with prompt context** - Analyze the libsource content with your specific prompt in mind
3. **Extract relevant information** - Focus on sections, patterns, and code examples that match your query
4. **Provide targeted response** - Return actionable information specific to your prompt

### Prompt Categories

#### Implementation Patterns
- `/libsource-read react "hooks patterns for state management"`
- `/libsource-read next "app router vs pages router patterns"`
- `/libsource-read vite "plugin development API"`

#### Configuration Examples
- `/libsource-read webpack "code splitting configuration"`
- `/libsource-read biome "ESLint migration rules mapping"`
- `/libsource-read vite "TypeScript setup patterns"`

#### API Usage
- `/libsource-read react "context API best practices"`
- `/libsource-read next "API routes with middleware"`
- `/libsource-read vite "plugin development patterns"`

#### Architecture Insights
- `/libsource-read webpack "loader system architecture"`
- `/libsource-read react "fiber reconciliation patterns"`
- `/libsource-read vite "dev server hot reload mechanism"`

#### Migration Guidance
- `/libsource-read react "class to hooks conversion patterns"`
- `/libsource-read next "pages to app router migration patterns"`
- `/libsource-read webpack "v4 to v5 upgrade requirements"`

#### Performance Optimization
- `/libsource-read react "rendering optimization techniques"`
- `/libsource-read vite "build performance optimizations"`
- `/libsource-read webpack "bundle size optimization strategies"`

### Advanced Prompt Techniques

#### Comparative Analysis
```
/libsource-read react "compare useState vs useReducer for complex state"
/libsource-read webpack "compare webpack vs vite for large projects"
```

#### Implementation Deep Dive
```
/libsource-read next "server components implementation patterns"
/libsource-read vite "how plugin system resolves dependencies"
```

#### Error Handling Patterns
```
/libsource-read react "error boundary implementation patterns"
/libsource-read webpack "build error handling and recovery"
```

#### Testing Strategies
```
/libsource-read react "testing hooks with custom render"
/libsource-read vite "testing Vite plugins and configurations"
```

### Response Format

I will provide:

1. **Direct Answer** - Immediate response to your specific prompt
2. **Code Examples** - Relevant code snippets from the libsource
3. **Implementation Notes** - Key considerations and gotchas
4. **References** - Point to specific files/sections in the libsource
5. **Related Patterns** - Connected concepts worth exploring

### Example Output

```
📚 Libsource Analysis: next - "app router vs pages router patterns"

🎯 Direct Answer:
App Router is Next.js 13+ modern approach using React Server Components and nested layouts. 
Pages Router is the legacy file-based routing system still supported but not recommended for new projects.

📋 Key Differences:
// Pages Router (legacy)
// pages/api/users.js
export default function handler(req, res) {
  res.json({ users: [] })
}

// pages/users/[id].js
export default function UserPage({ user }) {
  return <div>{user.name}</div>
}

// App Router (modern)
// app/api/users/route.js
export async function GET() {
  return Response.json({ users: [] })
}

// app/users/[id]/page.js
export default function UserPage({ params }) {
  return <div>User {params.id}</div>
}

💡 Implementation Notes:
- App Router supports React Server Components by default
- Nested layouts with app/layout.js
- Co-located loading.js, error.js, and not-found.js
- Better TypeScript support with generateStaticParams

📁 References:
- /packages/next/src/server/app-render (lines 234-567)
- /docs/app/building-your-application/routing
- /packages/next/src/client/components/app-router.tsx

🔗 Related Patterns:
- Server Components for data fetching
- Streaming with Suspense boundaries
- Route handlers for API endpoints
```

### Available Libraries

Current libsource files you can query:
- **biome** - Modern linter/formatter (1MB, 35K LOC)
- **next** - React framework (12MB, 450K LOC)
- **react** - UI framework (17MB, 610K LOC)
- **vite** - Build tool (3.8MB, 124K LOC)
- **webfonts-loader** - Font generation (40KB, 1.4K LOC)
- **webpack** - Build system (8.9MB, 290K LOC)

### Best Practices

#### Effective Prompts
- **Be specific** - "error boundary patterns" vs "error handling"
- **Include context** - "for TypeScript projects" or "in production builds"
- **Target implementation** - "show code examples" vs "explain concepts"

#### Prompt Structure
- **What**: Specific feature/pattern you need
- **Context**: Your use case or constraints
- **Depth**: Implementation details vs overview

#### Examples of Good Prompts
```
✅ "React Suspense implementation for data fetching with TypeScript"
✅ "Next.js app router data fetching with TypeScript"
✅ "Webpack dev server proxy configuration for microservices"

❌ "how React works"
❌ "Next.js tutorial"
❌ "Webpack help"
```

This command transforms your libsource collection into an interactive knowledge base, allowing you to extract precise, implementation-focused information for your current development needs.