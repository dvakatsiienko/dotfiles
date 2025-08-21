# Questions & Answers

## QA Status

- Claude Desktop: ✅ (all questions answered)
- Claude Code: ✅ (all questions answered)

## claude-code qa

**Q1:** The research mentions ~28GB for Qwen 2.5 Coder 14B model download. Given our M4 Pro system
specs, should we start with the 7B model (~6GB) for faster initial development and testing before
scaling to 14B?

**A1 by claude desktop:** Yes, absolutely start with Qwen 2.5 Coder 7B for initial development. The
7B model provides excellent semantic annotation capabilities with only ~6GB requirements, perfect
for rapid iteration. You can validate the entire pipeline with 7B, then optionally upgrade to 14B
for production if quality gains justify the extra resources. The performance difference is often
marginal for semantic tagging tasks.

**Q2:** For Phase 1 implementation, what's the recommended order of libsource processing? Should we
start with a smaller libsource (like bubbletea or lipgloss) to validate the pipeline before
processing larger ones (like react or webpack)?

**A2 by claude desktop:** Recommended processing order for validation:

1. **Start smallest**: `libsource-bubbletea.txt` or similar small library (~1-5MB)
2. **Medium complexity**: `libsource-vite.txt` or `libsource-react.txt` (~10-20MB)
3. **Large validation**: `libsource-webpack.txt` or similar complex library (~50MB+)

This progression lets you catch pipeline issues early and optimize performance before processing
large files. Small libraries also make manual quality assessment easier.

**Q3:** The research shows BM25F indexing as the final step. Should the enhanced .txt files remain
human-readable for manual inspection, or can they include binary/compressed semantic metadata for
efficiency?

**A3 by claude desktop:** Keep enhanced .txt files **human-readable** for the MVP. Use structured
comments for semantic metadata (as shown in research examples with `# @semantic_metadata {...}`).
This maintains:

- ✅ Manual inspection capability
- ✅ Git diff readability
- ✅ LLM compatibility
- ✅ Debugging simplicity

Binary optimization can come later if file sizes become problematic.

**Q4:** Pattern-based semantic tagging is marked as "HACKY" for Phase 1. What specific patterns
should we prioritize for the MVP (API calls, data transformations, I/O operations)?

**A4 by claude desktop:** Priority patterns for Phase 1 "hacky" semantic tagging:

1. **API/Function calls**: `function_name()`, `object.method()`, `import statements`
2. **Data flow**: `input → processing → output` patterns
3. **Error handling**: `try/catch`, `if error`, `throw`, `return error`
4. **I/O operations**: `read`, `write`, `fetch`, `save`, `load` patterns
5. **Configuration**: `config`, `options`, `settings`, `env` references

These patterns are regex-detectable and provide immediate semantic value for search improvement.
More sophisticated analysis comes with LLM integration in Phase 2.

## claude-desktop qa

_No questions from Claude Desktop at this time._
