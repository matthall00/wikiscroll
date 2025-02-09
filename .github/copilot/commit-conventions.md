# Commit Message Format

## Structure
```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `ci`: Changes to CI configuration files and scripts

## Scope
The scope should be one of these project areas:
- `feed` - Feed component and related features
- `nav` - Navigation components
- `ui` - Common UI components
- `storage` - Storage services
- `api` - API services
- `accessibility` - Accessibility features
- `test` - Testing infrastructure
- `deps` - Dependencies
- `config` - Configuration files

## Subject
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No dot (.) at the end

## Body
- Use the imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Should explain the "what" and "why" of the change

## Footer
- Breaking changes should start with `BREAKING CHANGE:`
- Reference issues and PRs: `Closes #123, #456`
- Include co-authors if pair programming: `Co-authored-by: name <email>`

## Examples
```
feat(feed): add pull-to-refresh functionality

Implement pull-to-refresh gesture in feed container to allow users to 
manually refresh article content. Includes loading indicator and haptic
feedback.

Closes #123
```

```
fix(api): handle rate limiting in Wikipedia API calls

Add exponential backoff retry logic to prevent API rate limit errors.
Previous implementation would fail immediately on 429 responses.

Closes #456
```

```
refactor(storage): migrate to IndexedDB from localStorage

BREAKING CHANGE: Storage service now uses IndexedDB instead of localStorage.
This change improves performance and allows storing larger amounts of data.

Migration script included to move existing data.
Closes #789
```