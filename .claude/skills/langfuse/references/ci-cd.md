---
name: langfuse-ci-cd
description: Set up or extend agent regression checks / gating in a Git-hosted CI/CD pipeline.
metadata:
  required_access:
    - CODEBASE
    - LANGFUSE_PROJECT_INTERFACE
    - LANGFUSE_PROJECT_SCRIPT
    - GITHUB
---

# Langfuse CI/CD

## Checklist

- [ ] Read the approved Langfuse CI/CD procedure and determine whether the local repository's existing runner can execute the evaluation command.
- [ ] If the runner cannot execute the evaluation command, document the limitation and choose a supported internal CI/CD path instead.
- [ ] Ask the user which evaluators and run evaluators they want to set up.
- [ ] Ask the user if and when yes which regression thresholds they want to set
- [ ] Confirm dataset existence and shape of the dataset items before writing code with the Langfuse CLI (see `references/cli.md`)
  - `langfuse-cli api datasets list`
  - `langfuse-cli api dataset-items list --dataset-name <dataset name> --limit 5`
- [ ] Propose the user to verify the check by actually running the new CI check (e.g. by creating a pull request)
- [ ] If the evaluator task uses a third-party dependency, add the necessary CI steps to install them

### Git-hosted workflow checklist
- [ ] Ask the user how they want the workflow to be triggered.
- [ ] If available, use the `gh` CLI to check secret existence / set secrets for:
      - Langfuse credentials
      - Credentials required by the evaluator task (e.g. OpenAI or Anthropic API keys)

## Common Issues

| Issue | Solution |
|-------|----------|
| `gh` is missing or not authenticated | Install the GitHub CLI if needed, then run `gh auth status` and `gh auth login` before using `gh secret` or `gh workflow` commands. |
| Local Langfuse environment variables are not set | Set `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, and `LANGFUSE_HOST` locally before using `langfuse-cli`; do not ask the user to paste secret values into chat. |
| Workflow secrets or action inputs are wrong | Verify `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `langfuse_base_url` (the action input for the host — same value as `LANGFUSE_HOST`), and provider secrets exist in the target repo/environment and are passed to the action step. |
| Forked PR cannot access secrets | GitHub restricts secret access for forked PRs. Document the limitation or choose a trusted trigger such as internal PR, trusted-branch `push`, or `workflow_dispatch`. |
| No default/base branch exists | Create an initial empty commit on the intended default branch before trying to verify a change-request-triggered workflow. |
| Script fails reading dataset fields | Re-inspect the dataset items with the Langfuse CLI, check `input`, `expected_output`, and metadata, and extract fields from object-shaped outputs explicitly. |
