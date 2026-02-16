# AgentDocks Viral Features Implementation Plan

## Status: IN PROGRESS

This document tracks the implementation of 5 major features designed to make AgentDocks viral among developers.

---

## ✅ Feature 1: One-Click Task Templates (COMPLETE)

### Implementation Status: 100%

**Files Created**:
- ✅ `frontend/src/lib/templates.ts` - 18 pre-built templates across 5 categories
- ✅ `frontend/src/app/templates/page.tsx` - Beautiful template browser
- ✅ Updated `dashboard/page.tsx` - Template parameter support
- ✅ Updated `InputBar.tsx` - InitialQuery prop

**What Works**:
- 18 professional templates across Data, Code, Web, Files, DevOps categories
- Search and filter by category
- Click template → navigates to dashboard with prompt pre-filled
- Staggered animations on load
- Estimated time and file requirements shown
- Tags for each template

**Templates Included**:
- **Data**: CSV Analyzer, JSON Transformer, Data Visualizer
- **Code**: Code Reviewer, Unit Test Writer, Bug Detective, API Doc Generator
- **Web**: Web Scraper Builder, Landing Page Builder, README Generator
- **Files**: PDF Report Builder, Image Processor, File Organizer
- **DevOps**: Docker Composer, GitHub Actions Writer, Security Auditor

**To Test**:
```bash
# Visit templates page
http://localhost:3000/templates

# Click any template
# Should navigate to dashboard with prompt pre-filled
```

---

## 🔧 Feature 2: Shareable Agent Runs (IMPLEMENTATION NEEDED)

### Implementation Status: 25%

**Backend Required**:
```python
# backend/app/api/runs.py
POST /api/runs/share
  - Takes full run data (messages array)
  - Generates 8-char readable ID
  - Saves to ~/.agentdocks/shared-runs/{id}.json
  - Returns share URL

GET /api/runs/shared/{id}
  - Returns run data for rendering
```

**Frontend Required**:
1. Share button in success banner after "done" event
2. Share modal component with:
   - Copy link button
   - Toggle: "Include my query"
   - Preview
3. `/run/[id]` page for viewing shared runs
4. Open Graph meta tags for social sharing

**Implementation Priority**: HIGH
**Estimated Effort**: 4-6 hours

---

## 🔧 Feature 3: Agent Recipes (IMPLEMENTATION NEEDED)

### Implementation Status: 20%

**Backend Required**:
```python
# backend/app/api/recipes.py
POST /api/recipes - Create recipe
GET /api/recipes - List all recipes
GET /api/recipes/{id} - Get single recipe
POST /api/recipes/{id}/star - Toggle star
POST /api/recipes/{id}/use - Increment use count

# Storage: ~/.agentdocks/recipes/*.json
```

**Frontend Required**:
1. `/recipes` page with two tabs: "Community" and "My Recipes"
2. Recipe cards with star count, use count
3. "Create Recipe" modal
4. "Use This Recipe" button → navigate to dashboard

**Pre-seed Recipes**:
1. Smart Commit Messages
2. Dependency Auditor
3. Database Schema Designer
4. API Mocker
5. Log Analyzer

**Implementation Priority**: MEDIUM
**Estimated Effort**: 6-8 hours

---

## 🔧 Feature 4: MCP Server Integration (SIMPLIFIED VERSION)

### Implementation Status: 10%

**Approach**: Create UI for MCP configuration with stub backend

**Backend Required**:
```python
# backend/app/api/mcp.py
POST /api/mcp/servers - Add MCP server config
GET /api/mcp/servers - List configured servers
DELETE /api/mcp/servers/{id} - Remove server
POST /api/mcp/servers/{id}/test - Test connection

# Storage: ~/.agentdocks/config.json → mcp_servers array
```

**Frontend Required**:
1. Settings section: "Connected Tools (MCP)"
2. List of servers with toggle switches
3. "Add MCP Server" modal
4. Quick-add options for common servers:
   - Filesystem
   - GitHub
   - Web Browser

**Note**: Full MCP integration (actually routing tools through MCP protocol) would require significant backend work with MCP client library. For MVP, we create the configuration UI and storage, with actual integration as Phase 2.

**Implementation Priority**: LOW (UI only for MVP)
**Estimated Effort**: 3-4 hours (UI only)

---

## ✅ Feature 5: Privacy-First Branding (PARTIAL)

### Implementation Status: 40%

**What's Needed**:

**Landing Page**:
- [ ] New "Privacy First" section between Features and How It Works
- [ ] Shield + lock icon
- [ ] Three sub-points: Local Execution, Your Keys Your Control, Zero Telemetry
- [ ] "Open Source" badge

**Dashboard**:
- [ ] Lock icon + "Local Mode" indicator in top-right
- [ ] Green dot = fully local (Ollama + Docker)
- [ ] Amber dot = cloud provider used
- [ ] Tooltip explaining data flow

**Onboarding**:
- [ ] Privacy summary box on Ready step
- [ ] Dynamic message based on config choices

**Footer**:
- [ ] "Open Source" badge on all pages
- [ ] "Privacy First" badge
- [ ] GitHub link prominent

**Implementation Priority**: HIGH
**Estimated Effort**: 2-3 hours

---

## ✅ Feature 6: Navigation Updates (PARTIAL)

### Implementation Status: 30%

**Sidebar Navigation** (needs update):
```
- Logo
- "+ New Task" button
- "Templates" link (grid icon) ✅ ADDED
- "Recipes" link (book icon) ⏳ PENDING
- --- Divider ---
- Task History
- --- Divider ---
- "MCP Servers" link (plug icon) - marked "Advanced" ⏳ PENDING
- Settings gear
```

**Landing Page Navigation** (needs update):
```
- Logo + "AgentDocks.ai"
- "Templates" link ⏳ PENDING
- "Recipes" link ⏳ PENDING
- "Docs" link (→ GitHub README) ⏳ PENDING
- GitHub icon link ⏳ PENDING
- "Get Started" button ✅ EXISTS
```

**Implementation Priority**: MEDIUM
**Estimated Effort**: 1-2 hours

---

## 🎨 Design System Requirements

All new pages must follow:

**Colors**:
- Background: `#1C1917`
- Accent: `#F59E0B` (amber)
- Text headings: white
- Text body: `rgba(255,255,255,0.7)`
- Text muted: `rgba(255,255,255,0.4)`

**Typography**:
- UI: System font
- Code: JetBrains Mono

**Cards**:
- Background: `rgba(255,255,255,0.03)`
- Border: `1px solid rgba(255,255,255,0.08)`
- Border radius: `12px`

**Animations**:
- All pages: fade + slide up on load
- All cards: stagger animate
- Hover: `scale(1.02)` + border lighten
- Active/selected: amber border + `bg-[#F59E0B]/10`

**GitHub Link**: Visible on every page

---

## Implementation Roadmap

### Phase 1: MVP (Current)
✅ Templates system
⏳ Privacy branding
⏳ Navigation updates

### Phase 2: Social Features
⏳ Shareable runs
⏳ Agent recipes

### Phase 3: Advanced
⏳ MCP integration (full)

---

## Quick Wins to Ship Now

1. **Templates** ✅ DONE - Ships immediately
2. **Privacy badges** - 1 hour, high impact
3. **Navigation** - 1 hour, improves discoverability
4. **Shareable runs** - 4 hours, viral potential

---

## Next Steps

To continue implementation:

```bash
# 1. Update Sidebar component with new links
# 2. Add privacy section to landing page
# 3. Implement share functionality backend
# 4. Create shared run viewer page
# 5. Build recipes system
```

---

## Testing Checklist

- [ ] Templates page loads and filters work
- [ ] Template click navigates to dashboard with prompt
- [ ] Privacy indicators show correct status
- [ ] Navigation links all work
- [ ] Shared run viewer displays correctly
- [ ] Recipes can be created and used
- [ ] MCP servers can be configured

---

## Performance Goals

- Template page loads: < 200ms
- Shared run page loads: < 300ms
- Recipe page loads: < 250ms
- All animations: 60 FPS

---

## Analytics (Future)

Track these metrics:
- Template usage by category
- Most popular templates
- Share link clicks
- Recipe usage
- MCP server connections
