---
description: add new library to libsource collection
argument-hint: [library-name] [github-url]
---

## libsource-add command function

This command adds a new library to your libsource collection using the existing gitingest Python
script, then prompts for quality evaluation.

### Usage

- `/libsource-add [library-name]` - Prompts for GitHub URL
- `/libsource-add [library-name] [github-url]` - Full automation (no prompts)

### Function

**Single argument mode** - When you run `/libsource-add vue`, I will:

1. **Execute libsource script** - Run `python3 ~/.dotfiles/.clauderc/scripts/libsource-add.py vue`
2. **Prompt for URL** - Script will ask: "Enter GitHub repo URL for 'vue': "
3. **Monitor the process** - Track the download and registration process
4. **Verify completion** - Ensure the library was successfully added to config
5. **Calculate metrics** - LOC and file size are automatically calculated
6. **Prompt for quality evaluation**:

**Two argument mode** - When you run `/libsource-add next https://github.com/vercel/next.js`, I will:

1. **Execute libsource script** - Run `python3 ~/.dotfiles/.clauderc/scripts/libsource-add.py next https://github.com/vercel/next.js`
2. **Skip URL prompt** - Script uses the provided URL directly
3. **Process immediately** - No user interaction required
4. **Monitor the process** - Track the download and registration process
5. **Verify completion** - Ensure the library was successfully added to config
6. **Calculate metrics** - LOC and file size are automatically calculated
7. **Prompt for quality evaluation**:

```
🎉 Library '[library-name]' added successfully!
📊 File: libsource-[library-name].txt (X.X MB, XXX,XXX lines)

Would you like me to run /libsource-inspect [library-name] to evaluate
its quality and save the score to config? (y/N)
```

### What Happens If You Say Yes:

- I'll automatically run `/libsource-inspect [library-name]`
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

### Examples

**Interactive mode (prompts for URL):**
```
/libsource-add tailwind
→ Script asks: "Enter GitHub repo URL for 'tailwind': "
→ User types: https://github.com/tailwindlabs/tailwindcss
→ Proceeds with download and registration
```

**Automation mode (no prompts):**
```
/libsource-add next https://github.com/vercel/next.js
→ Processes immediately without any user input
→ Perfect for batch operations or when you know the URL
```

### Benefits:

- **Cross-directory compatible** - Works from any directory using absolute paths
- **Flexible usage** - Choose interactive or automated mode as needed
- **Streamlined workflow** - Add and evaluate libraries in one flow
- **Complete metadata** - All fields populated immediately
- **Quality tracking** - Know which libsources are most comprehensive
- **Consistent process** - Same evaluation standards for all libraries

This command provides a seamless way to expand your libsource collection with full quality analysis!
