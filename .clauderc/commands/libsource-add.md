---
description: add new library to libsource collection
argument-hint: [library-name]
---

## libsource-add command function

This command adds a new library to your libsource collection using the existing gitingest Python script, then prompts for quality evaluation.

### Usage
`/libsource-add [library-name]`

### Function
When you run `/libsource-add vue`, I will:

1. **Execute gitingest script** - Run `python3 ~/.claude/scripts/gitingest.py [library-name]`
2. **Monitor the process** - Track the download and registration process
3. **Verify completion** - Ensure the library was successfully added to config
4. **Calculate metrics** - LOC and file size are automatically calculated
5. **Prompt for quality evaluation**:

```
🎉 Library '[library-name]' added successfully!
📊 File: libsource-[library-name].txt (X.X MB, XXX,XXX lines)

Would you like me to run /gitingest-inspect [library-name] to evaluate 
its quality and save the score to config? (y/N)
```

### What Happens If You Say Yes:
- I'll automatically run `/gitingest-inspect [library-name]`
- Generate a comprehensive quality analysis report
- Calculate the overall quality score (0-100%)
- Update the config file with the quality rating
- Your new library will be fully analyzed and ready for use

### What Gets Added:
```json
{
  "library-name": {
    "url": "https://github.com/org/repo",
    "filename": "libsource-library-name.txt",
    "last_updated": "2025-XX-XX",
    "file_size": 12345,
    "loc": 45678,
    "quality": 85
  }
}
```

### Benefits:
- **Streamlined workflow** - Add and evaluate libraries in one flow
- **Complete metadata** - All fields populated immediately  
- **Quality tracking** - Know which libsources are most comprehensive
- **Consistent process** - Same evaluation standards for all libraries

This command provides a seamless way to expand your libsource collection with full quality analysis!