#!/usr/bin/env bash
# ---------------------------------------------------------------
# One-command push to GitHub.
#
#   1. Create an EMPTY repo at https://github.com/new
#      (do NOT tick "Add a README" / ".gitignore" / "license")
#   2. Run:  bash push-to-github.sh
#
# This script never writes your token to disk or into .git/config.
# ---------------------------------------------------------------
set -e

REPO_URL="${1:-https://github.com/abuzar373/Zaar-solution.git}"
BRANCH="main"

echo "Target repository: $REPO_URL"
echo ""

# --- safety: make sure .env is not tracked ---------------------
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "ABORTED: .env is tracked by git. Run 'git rm --cached .env' first."
  exit 1
fi

# --- make sure there is a commit -------------------------------
if ! git rev-parse HEAD >/dev/null 2>&1; then
  git add -A
  git commit -m "Abuzar Software Solutions - full stack software house website"
fi
git branch -M "$BRANCH"

# --- credentials (prompted, never stored) ----------------------
read -rp "GitHub username: " GH_USER
read -rsp "GitHub token (input hidden): " GH_TOKEN
echo ""

# Build an authenticated URL in memory only.
AUTH_URL="https://${GH_USER}:${GH_TOKEN}@${REPO_URL#https://}"

echo "Pushing to $BRANCH ..."
git push "$AUTH_URL" "$BRANCH" --force

# Store the CLEAN url (no token) as origin for future pushes.
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

unset GH_TOKEN AUTH_URL

echo ""
echo "Done. Repository: ${REPO_URL%.git}"
echo "Future pushes: git push origin main"
