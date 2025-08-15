---
description: analyze libsource completeness vs original repo
argument-hint: [lib-name]
---

## libsource-inspect command function

This command analyzes how completely a libsource file represents the original GitHub repository source code.

### Usage

`/libsource-inspect [lib-name]`

### Function

When you run `/libsource-inspect vite`, I will:

1. **Load the libsource file** - Read `libsource-[lib-name].txt` from `.membank/gitingest/`
2. **Parse file structure** - Extract directory structure and file listings
3. **Analyze content coverage** - Count files, assess language breakdown, identify file types
4. **Compare with GitHub repo** - Use GitHub API to get repository statistics and structure
5. **Generate inspection report** with:
   - Overall completeness score (0-100%)
   - File coverage analysis
   - Content type breakdown (source, docs, tests, configs)
   - Language distribution
   - Missing file types and potential gaps
   - Recommendations for improving libsource captures

### Example Output

```
📊 Libsource Inspection Report: vite
================================================
🔗 Repository: https://github.com/vitejs/vite
📁 Libsource File: libsource-vite.txt (3.8 MB)

📈 Completeness Analysis:
✅ Source Code Coverage: 85%
✅ Documentation Coverage: 95%
⚠️  Test Coverage: 60%
✅ Configuration Coverage: 90%

🎯 Overall Score: 83% (Very Good)

📋 Libsource Details:
- LOC: 1.000
- Files included: 2,210 / ~2,600 (85%)
- Languages: TypeScript (90%), JavaScript (5%), Other (5%)
- Critical files: ✅ All present
- Missing: Large test fixtures, some binary assets

💡 Recommendations:
- Consider increasing --max-size limit for test files
- Binary assets filtered appropriately for LLM use
```

This analysis helps you understand how well your libsource files capture the essence of the original codebases and identifies areas for improvement in your libsource collection process.

### Config Update Prompt

After displaying the inspection report, I will prompt you:

**"Would you like me to update the config file with the quality analysis for [lib-name]? (y/N)"**

If you confirm, I will update the `.gitingest-config.json` file with the calculated quality score, making it available for future reference and display in `/libsource-list`.
