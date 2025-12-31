Commit Manifest
==============

This file lists the checklist that must be reviewed before each commit.

How to use
----------
- Install the repository hooks once:

  ```bash
  bash tools/install_commit_hook.sh
  ```

- On every `git commit`, the pre-commit hook will print this file and the staged files,
  then prompt you to type `I AGREE` to proceed. To bypass locally, set:

  ```bash
  export SKIP_COMMIT_MANIFEST=1
  ```

Checklist (suggested)
---------------------
- [ ] No server mode, push on git to do the test
- [ ] No new console.log / debug statements
- [ ] Update the file README.md and RELEASE.md for the new feature (not for fixed)
- [ ] Update the file REPOSITORY.md with all files added
- [ ] Commit message follows convention

Custom notes
------------
You can edit this file to fit your workflow. The pre-commit hook simply prints it —
adjust the text to reflect repository-specific checks.
