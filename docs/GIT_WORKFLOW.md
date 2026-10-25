# 🌍 World Pulse

# Team Git & GitHub Handbook

> **Read this before making your first contribution.**
>
> This document defines how all four members of the World Pulse team will work with Git and GitHub.

---

# 1. Project Structure

```text
world-pulse/

├── apps/
│   ├── web/
│   ├── api/
│   └── collectors/
│
├── packages/
│   ├── shared-types/
│   ├── shared-utils/
│   └── shared-ui/
│
├── docs/
├── docker/
└── .github/
```

---

# 2. Team Responsibilities

We have four members.

The project is divided into four primary workstreams, but **everyone also contributes to testing, documentation, code review, and integration**.

---

# 👤 Member 1 — Team Leader / Core Integration

### Primary Responsibility

**Core Architecture + Integration + DevOps**

### Main Areas

```text
packages/shared-types/
packages/shared-utils/
apps/api/
.github/
docker/
docs/
```

### Responsibilities

* Project architecture
* Shared TypeScript types
* Unified Event model
* Event validation
* WebSocket architecture
* Event processing pipeline
* Error handling
* GitHub Actions
* Docker configuration
* Integration testing
* Code review
* GitHub project management
* Release management
* Final integration

### Example Tasks

```text
Create Event interface
Create API contracts
Implement Socket.IO broadcasting
Implement event validation
Configure CI/CD
Configure Docker
Maintain architecture documentation
```

### GitHub Responsibilities

* Manage issues
* Assign tasks
* Review Pull Requests
* Maintain `develop`
* Coordinate weekly integration
* Merge approved PRs
* Manage releases

---

# 👤 Member 2 — Frontend & Visualization

### Primary Responsibility

**Frontend + User Interface + 3D Visualization**

### Main Area

```text
apps/web/
```

### Responsibilities

* React application
* TypeScript UI
* Dashboard
* Login/Register UI
* Navigation
* Event feed
* Search UI
* Filters
* Charts
* 3D globe
* Event markers
* Responsive design
* Frontend testing

### Example Tasks

```text
Dashboard layout
Login page
Event feed
Globe
Globe markers
Charts
Filters
Search interface
Responsive UI
```

---

# 👤 Member 3 — Backend & Database

### Primary Responsibility

**Backend API + Database + Authentication**

### Main Areas

```text
apps/api/
```

and

```text
prisma/
```

if the Prisma schema is kept at the repository root.

### Responsibilities

* Express server
* REST APIs
* PostgreSQL
* Prisma
* Database schema
* Authentication
* JWT
* Password hashing
* Authorization
* Search APIs
* Event APIs
* Source APIs
* Notification APIs
* Backend testing

### Example Tasks

```text
User registration
Login
JWT authentication
Event API
Search API
Source API
Database schema
Prisma migrations
API validation
```

---

# 👤 Member 4 — Collectors & Analytics

### Primary Responsibility

**Data Collection + Normalization + Analytics**

### Main Areas

```text
apps/collectors/
```

and analytics-related backend code.

### Responsibilities

* External API integration
* Data collection
* Data normalization
* Collector scheduling
* Error handling for external APIs
* GitHub collector
* USGS collector
* NASA collector
* Wikimedia collector
* News collector
* CoinGecko collector
* Analytics
* Trending calculations
* Historical replay
* Data testing

### Example Tasks

```text
GitHub collector
USGS collector
NASA collector
News collector
Event normalization
Event statistics
Trending events
Replay
```

---

# 3. Equal Contribution Policy

We are NOT trying to make everyone have exactly the same number of commits.

Instead, everyone must make **meaningful contributions**.

Every member should contribute to:

```text
Feature Development
        +
Testing
        +
Documentation
        +
Code Review
        +
Integration
```

A contribution can be:

* Feature
* Bug fix
* Test
* Refactoring
* Documentation
* Integration
* Performance improvement
* Security improvement
* Code review

---

# 4. Branch Structure

We use:

```text
main
│
└── develop
      │
      ├── feature/issue-12-login
      ├── feature/issue-15-event-api
      ├── feature/issue-18-github-collector
      └── feature/issue-21-dashboard
```

---

# 5. What Are `main` and `develop`?

## `main`

The stable/release branch.

Nobody works directly here.

```text
❌ No direct coding
❌ No direct pushing
❌ No force pushing
✅ Pull Requests only
```

---

## `develop`

The team's integration branch.

All completed features eventually enter here.

```text
❌ Don't directly develop features
❌ Don't randomly push unfinished work
✅ Features enter through Pull Requests
```

---

# 6. Feature Branches

Every task gets its own branch.

Example:

```text
feature/issue-21-dashboard
```

The branch should be created from the latest `develop`.

---

# 7. Before Starting Work

Every member must do this.

Open Terminal:

```bash
cd world-pulse
```

Check your branch:

```bash
git branch
```

---

# 8. Get Latest `develop`

Before starting a new task:

```bash
git checkout develop
```

Then:

```bash
git pull origin develop
```

This is extremely important.

It makes sure you have everyone's latest approved work.

---

# 9. Create Your Feature Branch

Suppose your GitHub Issue is:

```text
#21 Dashboard Layout
```

Create:

```bash
git checkout -b feature/issue-21-dashboard
```

Push the branch:

```bash
git push -u origin feature/issue-21-dashboard
```

Now the branch exists on GitHub.

---

# 10. Work on Your Task

Now you can write code.

Example for frontend:

```text
apps/web/
```

Example for backend:

```text
apps/api/
```

Example for collectors:

```text
apps/collectors/
```

Do not modify unrelated parts of the project unless you coordinate with the owner.

---

# 11. Check Your Changes

After working:

```bash
git status
```

Then:

```bash
git diff
```

Review what you changed.

---

# 12. Add Your Changes

You can add everything:

```bash
git add .
```

Or specific files:

```bash
git add apps/web/src/components/EventCard.tsx
```

---

# 13. Commit Your Work

Use meaningful commits.

Format:

```text
type(scope): description
```

Examples:

```text
feat(globe): add realtime event markers

feat(auth): add login form

feat(api): add events endpoint

feat(collector): add USGS collector

fix(search): handle empty search query

test(auth): add login tests

docs(api): document event endpoints

refactor(events): simplify normalization
```

---

# 14. Push Your Work

After committing:

```bash
git push
```

For the first push:

```bash
git push -u origin feature/issue-21-dashboard
```

---

# 15. Multiple Commits Are Fine

A feature can have several meaningful commits.

Example:

```text
feature/issue-21-dashboard

commit 1
feat(ui): create dashboard layout

commit 2
feat(ui): add event statistics

commit 3
feat(ui): add live event feed

commit 4
test(ui): add dashboard tests
```

This is good.

---

# 16. Do NOT Make Fake Commits

Never do:

```text
update
changes
final
final2
test
hello
small change
```

Don't create commits just to increase GitHub contribution numbers.

The teacher should be able to understand what you actually contributed.

---

# 17. When Your Task Is Complete

Before creating your PR:

Run the project's checks.

For example:

```bash
npm run lint
npm run test
npm run build
```

Use the actual commands configured in the repository.

Then:

```bash
git status
```

Commit anything remaining:

```bash
git add .
git commit -m "test(ui): complete dashboard tests"
```

Push:

```bash
git push
```

---

# 18. Create Pull Request

Go to GitHub.

Open:

```text
Pull Requests
```

Click:

```text
New Pull Request
```

Set:

```text
base: develop

compare: feature/issue-21-dashboard
```

---

# 19. Pull Request Title

Use the same convention:

```text
feat(ui): add dashboard
```

---

# 20. Pull Request Description

Use:

```markdown
## Description

What does this PR do?

## Related Issue

Closes #21

## Changes

- Added dashboard layout
- Added event statistics
- Added live event feed

## Testing

- [x] Tested locally
- [x] Lint passes
- [x] Tests pass
- [x] Build passes

## Screenshots

Add screenshots if this is a UI change.

## Checklist

- [x] No secrets committed
- [x] Code formatted
- [x] Tests added
- [x] Documentation updated
```

---

# 21. Code Review

The developer who wrote the code should NOT be the only person approving it.

Recommended review rotation:

| PR Author   | Primary Reviewer |
| ----------- | ---------------- |
| Team Leader | Member 2         |
| Member 2    | Member 3         |
| Member 3    | Member 4         |
| Member 4    | Team Leader      |

For important PRs, a second reviewer can also be added.

---

# 22. What Should the Reviewer Check?

### Functionality

Does it actually work?

### Code Quality

Is it readable and maintainable?

### Architecture

Is the code in the correct module?

### Security

Are API keys/passwords/secrets protected?

### Testing

Are important cases tested?

### Performance

Is there unnecessary processing?

---

# 23. If Reviewer Requests Changes

Stay on the same branch.

Make the changes:

```bash
git add .
git commit -m "fix(ui): address dashboard review comments"
git push
```

The Pull Request automatically updates.

---

# 24. Merging

A PR can be merged when:

```text
✅ Feature works
✅ Reviewer approves
✅ Tests pass
✅ Build passes
✅ No critical conflicts
```

Then merge:

```text
feature/issue-21-dashboard
             ↓
          develop
```

---

# 25. After Your PR Is Merged

Update your local repository:

```bash
git checkout develop
git pull origin develop
```

Delete your old local branch:

```bash
git branch -d feature/issue-21-dashboard
```

The GitHub branch can also be deleted after the PR is merged.

---

# 26. Starting Your Next Task

Always start from the latest `develop`.

```bash
git checkout develop
git pull origin develop
```

Then:

```bash
git checkout -b feature/issue-30-event-search
```

Work normally.

---

# 27. What If Someone Else Changed `develop`?

Suppose you're working on:

```text
feature/issue-21-dashboard
```

and several other PRs have merged.

Before finishing your feature:

```bash
git checkout develop
git pull origin develop
```

Then return:

```bash
git checkout feature/issue-21-dashboard
```

Merge the latest development code:

```bash
git merge develop
```

If there are no conflicts, continue.

---

# 28. Merge Conflicts

If Git says:

```text
CONFLICT
```

run:

```bash
git status
```

Open the conflicted file.

You'll see:

```text
<<<<<<< HEAD

Your changes

=======

Changes from develop

>>>>>>> develop
```

Decide which code should remain.

Remove the conflict markers.

Then:

```bash
git add .
```

```bash
git commit -m "fix: resolve merge conflict"
```

```bash
git push
```

---

# 29. If You Don't Understand a Conflict

DO NOT randomly delete code.

Ask the person who owns that module.

For example:

```text
Frontend conflict
→ Ask Member 2

Backend conflict
→ Ask Member 3

Collector conflict
→ Ask Member 4

Shared architecture conflict
→ Team discussion
```

---

# 30. Daily Workflow — Every Member

Everyone follows this:

```text
START
  ↓
git checkout develop
  ↓
git pull origin develop
  ↓
Create feature branch
  ↓
Write code
  ↓
Test
  ↓
git status
  ↓
git diff
  ↓
git add .
  ↓
git commit
  ↓
git push
  ↓
Continue work
  ↓
Feature complete
  ↓
Pull Request
  ↓
Code Review
  ↓
Merge into develop
```

---

# 31. Weekend Integration

The weekend is when the team checks whether everyone's work actually works together.

---

## Friday — Feature Freeze

Everyone should:

1. Finish their current task.
2. Push their branch.
3. Open their Pull Request.
4. Make sure tests pass.

Avoid starting large new features late Friday.

---

# 32. Saturday — PR Review

Review all open PRs.

Example:

```text
Member 2
Dashboard PR
      ↓
Member 3 reviews

Member 3
Backend PR
      ↓
Member 4 reviews

Member 4
Collector PR
      ↓
Team Leader reviews

Team Leader
Core PR
      ↓
Member 2 reviews
```

Fix review comments.

Merge approved PRs into:

```text
develop
```

---

# 33. Saturday — Integration Testing

Once approved PRs are merged:

```bash
git checkout develop
git pull origin develop
```

Start the complete application.

Test:

```text
Frontend
   ↓
Backend
   ↓
Database
   ↓
Collectors
   ↓
WebSockets
```

---

# 34. Weekend Integration Checklist

```text
[ ] Frontend starts
[ ] Backend starts
[ ] Database connects
[ ] Redis connects
[ ] Authentication works
[ ] REST APIs work
[ ] Collectors work
[ ] Events enter database
[ ] WebSockets broadcast events
[ ] Dashboard receives events
[ ] Globe displays events
[ ] Search works
[ ] Analytics work
[ ] No critical console errors
[ ] No critical API errors
```

---

# 35. If Integration Fails

Create a GitHub Issue.

Example:

```text
fix: USGS events not appearing on globe
```

Labels:

```text
bug
collector
frontend
```

Assign it to the appropriate members.

Create a bug branch:

```bash
git checkout develop
git pull origin develop

git checkout -b fix/issue-45-usgs-globe
```

Fix → Commit → Push → PR → Review → Merge.

---

# 36. Sunday — Release Candidate

After all bugs are fixed:

```text
develop
   ↓
Full Testing
   ↓
Release Candidate
```

The team leader verifies:

```text
✅ Features
✅ Tests
✅ Build
✅ Database
✅ APIs
✅ Collectors
✅ UI
```

---

# 37. Release to `main`

When the project is stable:

Create:

```text
develop → main
```

Pull Request.

Title:

```text
release: Sprint 1
```

After approval, merge.

---

# 38. Create a Version Tag

After merging into `main`:

```bash
git checkout main
git pull origin main
```

Create:

```bash
git tag -a v0.1.0 -m "Sprint 1 release"
```

Push:

```bash
git push origin v0.1.0
```

---

# 39. Version Plan

```text
v0.1.0
Project foundation

v0.2.0
Authentication + Database

v0.3.0
Collectors + WebSockets

v0.4.0
Dashboard + Globe

v0.5.0
Analytics + Search

v1.0.0
Final project release
```

---

# 40. Team Leader's Responsibilities

The Team Leader is responsible for:

### GitHub

* Repository management
* Branch rules
* Issues
* Labels
* Project board
* Pull Requests
* Releases

### Technical

* Architecture
* Integration
* Shared types
* CI/CD
* Docker
* Final testing

### Team Management

* Assign issues
* Track progress
* Identify blockers
* Coordinate reviews
* Organize weekend integration

The Team Leader should NOT do everyone's work.

---

# 41. Member 2 Responsibilities

Member 2 owns:

```text
apps/web/
```

Responsible for:

* React
* Dashboard
* Globe
* Charts
* Filters
* Search UI
* Responsive design
* Frontend testing

---

# 42. Member 3 Responsibilities

Member 3 owns:

```text
apps/api/
```

Responsible for:

* Express
* REST APIs
* PostgreSQL
* Prisma
* Authentication
* Authorization
* Backend testing

---

# 43. Member 4 Responsibilities

Member 4 owns:

```text
apps/collectors/
```

Responsible for:

* External APIs
* Collectors
* Normalization
* Scheduling
* Analytics
* Replay
* Data testing

---

# 44. Everyone's Responsibilities

Regardless of role, everyone must:

```text
✅ Write meaningful code
✅ Write tests
✅ Document their work
✅ Review another member's PR
✅ Attend integration testing
✅ Fix bugs in their module
✅ Follow Git rules
```

---

# 45. GitHub Issue Workflow

Every task starts as:

```text
GitHub Issue
```

Example:

```text
#21 Add Dashboard Event Feed
```

Then:

```text
Issue
 ↓
Branch
 ↓
Code
 ↓
Commit
 ↓
Push
 ↓
Pull Request
 ↓
Review
 ↓
Merge
 ↓
Done
```

---

# 46. Definition of Done

An issue is **DONE** only when:

```text
[ ] Feature implemented
[ ] Code tested
[ ] Lint passes
[ ] Build passes
[ ] Documentation updated
[ ] Meaningful commit created
[ ] Pull Request created
[ ] Code reviewed
[ ] PR merged into develop
[ ] Integration verified
```

Only then move the issue to:

```text
DONE
```

---

# 47. Important Git Commands

### Check status

```bash
git status
```

### Check branches

```bash
git branch
```

### Switch branch

```bash
git checkout develop
```

### Create branch

```bash
git checkout -b feature/issue-21-dashboard
```

### Pull latest code

```bash
git pull origin develop
```

### Stage changes

```bash
git add .
```

### Commit

```bash
git commit -m "feat(ui): add dashboard"
```

### Push

```bash
git push
```

### View history

```bash
git log --oneline
```

---

# 48. Commands to Avoid

Do not use these unless you understand exactly what they do:

```bash
git push --force
```

```bash
git reset --hard
```

```bash
git clean -fd
```

These commands can destroy work.

---

# 49. Never Commit Secrets

Never commit:

```text
.env
API keys
Passwords
JWT secrets
Database credentials
Private tokens
```

Use:

```text
.env.example
```

Example:

```env
DATABASE_URL=
JWT_SECRET=
REDIS_URL=
NEWS_API_KEY=
```

The actual `.env` must be in `.gitignore`.

---

# 50. Golden Rule

Everyone should remember this:

```text
              ISSUE
                ↓
              BRANCH
                ↓
               CODE
                ↓
              COMMIT
                ↓
               PUSH
                ↓
                PR
                ↓
              REVIEW
                ↓
              DEVELOP
                ↓
       WEEKEND INTEGRATION
                ↓
              TESTING
                ↓
               MAIN
```

# 51. Final Team Rule

> **Do not try to make commit counts equal. Make contributions meaningful and reasonably balanced.**

The goal is not:

```text
Member 1 → 50 commits
Member 2 → 50 commits
Member 3 → 50 commits
Member 4 → 50 commits
```

The goal is:

```text
Member 1 → meaningful architecture + integration work
Member 2 → meaningful frontend + visualization work
Member 3 → meaningful backend + database work
Member 4 → meaningful collector + analytics work
```

All four members should have:

```text
Features
Tests
Documentation
Reviews
Bug fixes
Integration work
```

This gives the team a clean, transparent GitHub history that accurately represents everyone's contribution.
