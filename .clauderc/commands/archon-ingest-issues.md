---
description: convert Jira issues into structured Archon tasks with resolution plans
argument-hint: [project-key] [issue-count] [archon-project-id]
---

## Usage

Execute without arguments to process **10 recent issues** assigned to current user into the **sb-ui Archon project**:
```bash
/archon-ingest-issues
```

With arguments to customize processing:
```bash
/archon-ingest-issues BETSYBE 15 0768e702-fa50-4701-9eae-2d9a079b4606
```

## Argument Processing

**$ARG1 [project-key]**: Jira project key to filter issues (default: all assigned issues)
**$ARG2 [issue-count]**: Number of recent issues to process (default: 10)  
**$ARG3 [archon-project-id]**: Target Archon project UUID (default: sb-ui project)

## Workflow Execution

### 1. Validate Connections
- Verify Jira MCP server connection: `getAccessibleAtlassianResources()`
- Verify Archon MCP server connection: `health_check()`
- If either fails, report connection issues and stop

### 2. Extract Jira Issues
```javascript
// Get assigned issues (filtered by project-key if provided)
searchJiraIssuesUsingJql({
  jql: `assignee = currentUser() ${projectKey ? `AND project = ${projectKey}` : ''} ORDER BY updated DESC`,
  maxResults: issueCount,
  fields: ["key", "summary", "description", "status", "priority", "attachments"]
})
```

### 3. Process Each Issue
For each Jira issue:
- **Extract details**: Get full issue data including attachments
- **Transform language**: Translate to English, make actionable
- **Map priority**: High=13, Medium=8-10, Low=5-7, Lowest=3-5
- **Categorize feature**: search-ui, video-player, responsive-design, performance
- **Create resolution plan**: 6-10 step implementation roadmap

### 4. Create Archon Tasks
```javascript
manage_task({
  action: "create",
  project_id: archonProjectId,
  title: "Fix [specific problem] on [environment]",
  description: `
**Problem:** Clear problem statement from Jira

**Environment:**
- URLs: ${extractedUrls}
- Device: ${deviceSpecs}
- Configuration: ${partnerSettings}

**Reproduction Steps:**
${reproductionSteps}

**Resolution Plan:**
1. Analyze current implementation
2. Identify root cause
3. Implement fix
4. Add regression tests
5. Validate across environments
6. Update documentation
  `,
  assignee: "AI IDE Agent",
  task_order: calculatedPriority,
  feature: categorizedFeature,
  sources: [{ url: jiraIssueKey, type: "jira_issue", relevance: "Original bug report" }]
})
```

## Feature Categorization Logic

**Automatic mapping** based on Jira issue content:
- **search-ui**: Search, filters, overlays, positioning
- **video-player**: Streams, fullscreen, player controls  
- **responsive-design**: Mobile, tablet, cross-device issues
- **performance**: Loading, lazy-loading, optimization
- **layout**: CSS, positioning, z-index conflicts

## Priority Calculation

```javascript
const basePriority = {
  "Highest": 15, "High": 13, "Medium": 9, "Low": 6, "Lowest": 4
}

// Adjustments:
// +2 for "Dev Test OK" (ready for review)
// +1 for "foundByMainTest" label (QA validated)  
// -1 for "In Progress" (currently being worked)
```

## Success Validation

After processing, verify:
- [ ] All issues transformed to English task titles
- [ ] Archon tasks created with comprehensive descriptions
- [ ] Priority mapping applied correctly
- [ ] Feature categories assigned appropriately
- [ ] Resolution plans include 6+ actionable steps
- [ ] Source references link back to original Jira issues

## Error Handling

**Jira connection fails**: Report MCP server status and authentication requirements
**Archon connection fails**: Report session ID issues and suggest server restart
**Issue processing fails**: Log failed issue keys and continue with remaining
**Task creation fails**: Report Archon API errors and project access permissions

## References

**Full workflow documentation**: `.clauderc/.membank/jira-to-archon-workflow.md`
**Example transformations**: See Implementation Results Summary in workflow docs
**Asset extraction details**: Screenshots and environment specs in workflow guide