# Arroyo Marketing: Local Agent Audit & Roadmap

This document outlines the critical fixes, optimizations, and feature additions required to transform the current **Local Manus Agent** into a high-leverage revenue system for Arroyo Marketing.

---

## 🚀 High Priority: Immediate Impact
These items directly affect the reliability and core functionality of the lead generation system.

| Category | Finding | Location | Why it matters |
| :--- | :--- | :--- | :--- |
| **Reliability** | **Fragile Web Scraping:** Current tools use regex for HTML parsing. | `server/tools.ts` | Regex breaks easily when websites update. Switching to a robust parser like **Cheerio** ensures stable lead data collection. |
| **Scalability** | **Hardcoded Ollama Host:** Locked to `localhost:11434`. | `todo.md` | Prevents running the AI on a separate, more powerful machine. Needs an `OLLAMA_HOST` environment variable. |
| **Functionality** | **Missing Claude Integration:** Chat router only supports Ollama. | `server/routers.ts` | Claude is often superior for complex reasoning and copywriting. Integrating it provides a higher-quality "brain" for the agent. |
| **UX / Data** | **Truncated Research Results:** Findings are cut off at 500 chars. | `client/src/pages/Research.tsx` | Carson can't see the full research data, making the "Research" feature low-leverage in its current state. |
| **Database** | **Missing User Association:** `conversations` table lacks `userId`. | `drizzle/schema.ts` | Prevents multi-user support and personalized history, which is essential for scaling the agency team. |

---

## 📈 Medium Priority: Optimization & Scale
These improvements focus on system efficiency and better user feedback.

| Category | Finding | Location | Recommendation |
| :--- | :--- | :--- | :--- |
| **UX** | **Silent Model Pulling:** No progress reporting for downloads. | `server/ollama.ts` | Implement real-time progress (percentage/speed) so you aren't left guessing if a download is stuck. |
| **UX** | **Hardcoded Model Size UI:** Progress bar capped at 10GB. | `client/src/pages/Dashboard.tsx` | Make the max size dynamic. Larger models will currently show as "100% full" even if they aren't. |
| **Logic** | **Claude Prompt Structure:** Uses basic string prepending. | `server/claude.ts` | Refactor to use Claude's native `messages` array format for better multi-turn conversation handling. |
| **DevOps** | **Static Dependencies:** Exact versions in `package.json`. | `package.json` | Move to a more flexible versioning strategy to automatically receive security patches and performance boosts. |
| **UX** | **Truncated Tool Logs:** Tool results are capped at 500 chars. | `client/src/pages/Home.tsx` | Add an "Expand" option to view full logs for debugging complex automation failures. |

---

## 🛠 Strategic Roadmap for Arroyo Marketing

### 1. The "Lead System" Upgrade
*   **Fix:** Replace regex scraping with a headless browser or robust parser.
*   **Add:** A "Lead Verification" tool that cross-references scraped data with Google Maps or LinkedIn.

### 2. Multi-Model Intelligence
*   **Add:** A toggle in the UI to switch between **Ollama (Local/Private)** and **Claude (High Intelligence)** depending on the task complexity.

### 3. Infrastructure for Growth
*   **Fix:** Move from a single Mac mini bottleneck to a distributed setup using the `OLLAMA_HOST` fix.
*   **Add:** Automated backup for the Drizzle database to ensure lead data is never lost.

---

> **Note:** This audit was performed using **Wide Research (Parallel Processing)** to analyze the codebase, configuration, and documentation simultaneously. Every recommendation is geared toward **leverage, scalability, and speed**.
