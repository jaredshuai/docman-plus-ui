# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview
This is the **plus-ui** frontend for the RuoYi-Vue-Plus multi-tenant admin management system, built with Vue 3 + TypeScript + Element Plus + Vite. It is a frontend-only repo; the Java/Spring Boot backend is a separate project.

### Running Services
- **Dev server**: `npm run dev` — starts Vite on port 80, proxies `/dev-api` to `http://localhost:8080` (backend)
- Port 80 requires `sudo sysctl -w net.ipv4.ip_unprivileged_port_start=0` before starting

### Scripts Reference (see `package.json`)
| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (port 80) |
| `npm run build:prod` | Production build |
| `npm run lint:eslint` | Run ESLint |
| `npm run lint:eslint:fix` | Run ESLint with auto-fix |
| `npm run prettier` | Format all files with Prettier |

### Known Issues
- `npm run build:prod` fails due to a pre-existing template error in `src/views/docman/archive/index.vue` (invalid end tag). The dev server is unaffected.
- ESLint reports many pre-existing Prettier formatting violations.

### Backend Dependency
The frontend proxies all API calls (`/dev-api`) to `http://localhost:8080`. Without the backend, the login page loads but login/API calls will fail. The backend is the separate [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus) Java project.

### Testing
- `vitest` is listed in devDependencies but no test files or `vitest.config.ts` exist in the repo.
- Lint check: `npm run lint:eslint`
