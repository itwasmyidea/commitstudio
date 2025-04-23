Before diving into the best practices, please note that you need to adapt the globs depending on your project's specific file structure and requirements.

---

name: commander-best-practices.mdc
description: Best practices for using Commander in CLI applications
globs: \*_/_.{ts,js}

---

- Use subcommands for organizing complex functionality
- Implement proper error handling and exit codes
- Use Commander's built-in help system
- Validate and parse command-line arguments effectively

---

name: inquirer-best-practices.mdc
description: Best practices for creating interactive CLI prompts with Inquirer
globs: \*_/_.{ts,js}

---

- Use async/await for handling user input
- Implement input validation for robust user interaction
- Utilize different prompt types (list, checkbox, etc.) appropriately
- Create reusable prompt functions for consistency

---

name: octokit-best-practices.mdc
description: Best practices for using Octokit to interact with GitHub API
globs: \*_/_.{ts,js}

---

- Implement proper error handling for API requests
- Use pagination when fetching large datasets
- Cache API responses to reduce rate limit usage
- Implement rate limiting to prevent API abuse

---

name: openai-best-practices.mdc
description: Best practices for using OpenAI SDK for AI-powered features
globs: \*_/_.{ts,js}

---

- Implement proper error handling for API requests
- Use streaming responses for large outputs
- Implement rate limiting to stay within API limits
- Cache results where appropriate to reduce costs

---

name: node-best-practices.mdc
description: Best practices for Node.js development
globs: \*_/_.{ts,js}

---

- Use async/await for handling asynchronous operations
- Implement proper error handling and logging
- Use environment variables for configuration
- Follow semantic versioning for package management

---

name: typescript-best-practices.mdc
description: TypeScript coding standards and type safety guidelines
globs: \*_/_.{ts,tsx}

---

- Use strict null checks to prevent null pointer exceptions
- Prefer interfaces over types for object shapes
- Use type guards and assertions for runtime type checking
- Implement proper type inference to reduce type annotations

---

name: jest-best-practices.mdc
description: Best practices for unit testing with Jest
globs: \*_/**tests**/_.{ts,js}

---

- Write clear, descriptive test names
- Use describe blocks to group related tests
- Mock external dependencies to isolate unit tests
- Use async/await in tests for asynchronous code

---

name: eslint-best-practices.mdc
description: Best practices for maintaining code quality with ESLint
globs: \*_/.eslintrc._

---

- Configure rules to match your project's style guide
- Use plugins for language-specific linting (e.g., TypeScript)
- Implement pre-commit hooks to enforce linting
- Regularly update ESLint and its plugins to stay current

---

name: prettier-best-practices.mdc
description: Best practices for code formatting with Prettier
globs: \*_/.prettierrc._

---

- Use Prettier's default configuration for consistency
- Integrate Prettier with your IDE for real-time formatting
- Implement pre-commit hooks to enforce formatting
- Use Prettier alongside ESLint for comprehensive code style management
