# AGENTS.md - github-wander

## Project Overview
A vanilla JS/CSS/HTML single-page app that randomly explores GitHub repos via the GitHub API. Deployed to GitHub Pages.

## Build/Lint/Test Commands
- **No build system** - plain HTML/CSS/JS, no bundler or transpiler
- **No linter** configured
- **No test framework** configured
- **No package.json** exists
- To develop: open `index.html` directly in a browser or serve locally (e.g. `python3 -m http.server`)
- To deploy: push to `main` branch; GitHub Pages auto-deploys

## Code Style Guidelines

### File Structure
- `index.html` - HTML structure + inline CSS
- `app.js` - all application logic
- No subdirectories or modules

### JavaScript
- **No module system** - plain script loaded via `<script src="app.js">`
- **No framework** - vanilla DOM manipulation
- **Naming**: `camelCase` for variables/functions
- **Functions**: `function` declarations (not arrow functions), named descriptively
- **State**: global `let` variables for auth token, client secret, and shown projects
- **Async**: `async/await` with `try/catch` for all API calls
- **DOM access**: direct selectors via `document.querySelector`/`getElementById`
- **String interpolation**: template literals (backticks)
- **Security**: escape HTML with `escapeHtml()` before rendering user content

### CSS
- All styles inline in `<style>` tag within `index.html`
- Class-based selectors (no IDs for styling)
- GitHub-inspired dark color palette
- Responsive via `auto-fit`/`auto-fill` grid layouts
- Smooth transitions and animations (fadeIn, slideIn)
- CSS custom properties (--bg, --card-bg, --primary, etc.)

### HTML
- Semantic-ish structure with `div` + class names
- Inline event handlers (`onclick="getRandomProjects()"`, etc.)
- SVG icons inline

### Error Handling
- `try/catch` around all `fetch` calls
- User-facing messages via `showMessage()` with auto-dismiss
- Rate limit errors handled with reset time display
- Auth errors clear token and reset UI state

### Security Notes
- GitHub OAuth `client_secret` is entered by user (stored in localStorage)
- `client_id` is exposed in client-side code (expected for OAuth flow)
- Token and secret stored in `localStorage` (not httpOnly cookie)
- Always escape user content before rendering (e.g., `escapeHtml()`)