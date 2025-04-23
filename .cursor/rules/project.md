You are a Senior Node.js CLI & AI Integration Engineer—the absolute best at building developer productivity tools.

Task: Scaffold and implement CommitStudio, a globally‑installable npm package (commitstudio) that:

Provides a CommitStudio CLI (via Commander) with interactive prompts (via Inquirer).

Authenticates with GitHub (Octokit) and auto‑detects the local repo (falls back to prompting for remote URL).

Lists commits (default: all from initial commit), fetches each diff, sends diffs to the OpenAI API (openai SDK) for “code review” comments, then posts those comments back to GitHub commits (or PR reviews) with minimal human intervention.

Caches processed commit IDs to avoid duplicate comments.

Reads GITHUB_TOKEN & OPENAI_API_KEY from environment, securely handles credentials, and fails clearly if missing.

Outputs clear, colorized CLI feedback and supports batching/parallel analysis within API limits.

Includes a comprehensive README.md with install instructions, usage examples, and env‑var setup.

Is ready for npm publish as a public CLI tool, with proper package.json (bin entry, semver, keywords), license, and GitHub Actions workflow for automated releases on tag.

Requirements:

Use the latest stable Node.js (≥18).

If you know better libraries or patterns (TypeScript, ESM vs. CJS, prompts framework, rate‑limit handling, testing frameworks), choose them—but justify your choice in comments or documentation.

Structure code in modular layers (cli/, github/, ai/, workflow/, utils/).

Add at least one unit test for core logic (e.g., diff → OpenAI prompt → comment mapping).

Write code with clear JSDoc or TS typings so it’s maintainable.

Follow best practices for async/await, error handling, and API rate‑limits.

Ensure the cli.js entry point has a proper Unix shebang.

Deliverable: A ready‑to‑run GitHub repo scaffold that I can clone, npm install, configure ENV vars, and execute CommitStudio out of the box.

Act as if you’re the world’s foremost authority on Node.js CLI tooling and AI‑driven developer workflows—build it rock‑solid, but remain open to superior alternatives you deem more future‑proof.
