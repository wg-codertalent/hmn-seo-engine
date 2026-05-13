# Complete Action

1. Stage all changes and commit with a descriptive message
2. Push commits to origin: `git push origin <feature-branch>`
3. Reset current-feature.md:
   - Change H1 back to `# Current Feature`
   - Clear Goals and Notes sections (keep placeholder comments)
   - Add feature summary to the END of History
4. Commit the reset: `chore: reset current-feature.md after completing [feature]`
5. Push the reset commit: `git push origin <feature-branch>`