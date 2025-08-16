---
description: read libsource with targeted prompt analysis
argument-hint: [lib-name] "prompt"
---

## libsource-read command function

This command instructs me to read a specific libsource file and extract targeted information based on your custom prompt instructions.

### Usage

`/libsource-read [lib-name] "prompt"`

### Function

When you run `/libsource-read mobx "how to create observable arrays"`, I will:

1. **Load libsource file** - Read `libsource-[lib-name].txt` from `.membank/gitingest/`
2. **Parse with prompt context** - Analyze the libsource content with your specific prompt in mind
3. **Extract relevant information** - Focus on sections, patterns, and code examples that match your query
4. **Provide targeted response** - Return actionable information specific to your prompt

### Prompt Categories

#### Implementation Patterns
- `/libsource-read react "hooks patterns for state management"`
- `/libsource-read mobx "observable decorators vs makeObservable"`
- `/libsource-read vite "plugin development API"`

#### Configuration Examples
- `/libsource-read webpack "code splitting configuration"`
- `/libsource-read biome "ESLint migration rules mapping"`
- `/libsource-read vite "TypeScript setup patterns"`

#### API Usage
- `/libsource-read lodash "performance-optimized array methods"`
- `/libsource-read react "context API best practices"`
- `/libsource-read mobx "computed values optimization"`

#### Architecture Insights
- `/libsource-read webpack "loader system architecture"`
- `/libsource-read react "fiber reconciliation patterns"`
- `/libsource-read vite "dev server hot reload mechanism"`

#### Migration Guidance
- `/libsource-read react "class to hooks conversion patterns"`
- `/libsource-read mobx "v5 to v6 migration breaking changes"`
- `/libsource-read webpack "v4 to v5 upgrade requirements"`

#### Performance Optimization
- `/libsource-read react "rendering optimization techniques"`
- `/libsource-read vite "build performance optimizations"`
- `/libsource-read lodash "bundle size reduction strategies"`

### Advanced Prompt Techniques

#### Comparative Analysis
```
/libsource-read react "compare useState vs useReducer for complex state"
/libsource-read webpack "compare webpack vs vite for large projects"
```

#### Implementation Deep Dive
```
/libsource-read mobx "internal implementation of makeObservable"
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
📚 Libsource Analysis: mobx - "observable decorators vs makeObservable"

🎯 Direct Answer:
Starting MobX v6, decorators are legacy. makeObservable() is the modern approach 
offering better TypeScript support and explicit observable definitions.

📋 Key Differences:
// Legacy (decorators)
class TodoStore {
  @observable todos = []
  @action addTodo(todo) { this.todos.push(todo) }
}

// Modern (makeObservable)
class TodoStore {
  todos = []
  constructor() {
    makeObservable(this, {
      todos: observable,
      addTodo: action
    })
  }
  addTodo(todo) { this.todos.push(todo) }
}

💡 Implementation Notes:
- makeObservable() provides compile-time safety
- Decorators require experimental TypeScript features
- makeObservable allows selective observable properties
- Better tree-shaking with makeObservable approach

📁 References:
- /src/core/observable.ts (lines 156-203)
- /docs/observable-state.md
- /packages/mobx/src/api/makeObservable.ts

🔗 Related Patterns:
- makeAutoObservable() for simpler syntax
- runInAction() for batched updates
- Observer component optimization
```

### Available Libraries

Current libsource files you can query:
- **biome** - Modern linter/formatter (1MB, 35K LOC, quality: 88%)
- **lodash** - Utility functions (154KB, 5K LOC, quality: 79%)
- **mobx** - State management (1.9MB, 68K LOC, quality: 85%)
- **react** - UI framework (17MB, 610K LOC, quality: 83%)
- **vite** - Build tool (3.8MB, 124K LOC, quality: 83%)
- **webfonts-loader** - Font generation (40KB, 1.4K LOC, quality: 96%)
- **webpack** - Build system (8.9MB, 290K LOC, quality: 78%)

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
✅ "MobX computed values performance optimization in large stores"
✅ "Webpack dev server proxy configuration for microservices"

❌ "how React works"
❌ "MobX tutorial"
❌ "Webpack help"
```

This command transforms your libsource collection into an interactive knowledge base, allowing you to extract precise, implementation-focused information for your current development needs.