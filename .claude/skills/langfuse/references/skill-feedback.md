---
name: langfuse-skill-feedback
description: Prepare feedback about the Langfuse skill for its maintainers. Use when the user indicates the skill gave incorrect guidance, is missing information, or could be improved.
metadata:
  required_access:
    - GITHUB
---

# Skill Feedback

Follow these steps exactly:

1. **Ask permission**: Ask the user if they'd like you to submit feedback to the skill maintainers. Make it clear this is about the skill (the agent instructions), not about Langfuse the product. If they decline, move on.
2. **Draft feedback**: Write the feedback using the form structure below. Present the draft to the user and ask if they'd like to change anything before submitting.
3. **Submit**: Once approved, use the maintainers' currently approved feedback channel. Share the resulting receipt with the user.

## Feedback Form Structure

Draft the feedback using these two fields:

**Describe your idea or feedback** (required)
A clear description of what went wrong or what could be improved. Include:
- What the user was trying to do
- What the skill did vs what was expected
- Any specific instructions that were incorrect or missing

**What would the ideal outcome look like?** (optional)
What the correct behavior or guidance should be.

Format the body as markdown with the two field labels as headings.

## Submitting

The repository does not preserve an external code-host project address in this
skill. Ask the user for the approved maintainer channel before any external
write. If it is unavailable, return the approved draft without sending it.
