#!/usr/bin/env bash
# Publish web/build to the gh-pages branch, which GitHub Pages serves at /divi/.
#
#   ./scripts/deploy.sh            build and stage the deploy locally, push nothing
#   ./scripts/deploy.sh --push     ...and push it live
#
# Staging without --push leaves a real commit on the local gh-pages branch, so the
# deploy can be inspected (and diffed against what is live) before anyone sees it.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
PUSH="${1:-}"

# A deploy has to be traceable to a commit, or there is no way back to the source
# that produced it. This is exactly how the previous live build became unrecoverable.
if [ -n "$(git status --porcelain)" ]; then
  echo "refusing to deploy: the working tree is dirty. Commit or stash first." >&2
  git status --short >&2
  exit 1
fi

SOURCE_SHA="$(git rev-parse --short HEAD)"
SOURCE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

git fetch --quiet origin gh-pages || true
ROLLBACK="$(git rev-parse --short origin/gh-pages 2>/dev/null || echo 'none')"

echo "==> building"
npm --prefix web run build

# GitHub Pages runs Jekyll unless told not to, and Jekyll drops _-prefixed paths.
# The build does not emit this file, so it is added on every deploy.
touch web/build/.nojekyll

echo "==> staging onto gh-pages"
WORKTREE="$(mktemp -d)"
cleanup() { git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true; }
trap cleanup EXIT

if git show-ref --quiet refs/heads/gh-pages; then
  git worktree add --quiet "$WORKTREE" gh-pages
else
  git worktree add --quiet -b gh-pages "$WORKTREE" origin/gh-pages
fi

# Replace the published tree wholesale; a stale file left behind is still served.
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -r web/build/. "$WORKTREE"/

git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "nothing to deploy: the built output is identical to what is published."
  exit 0
fi

git -C "$WORKTREE" commit -q -m "Deploy ${SOURCE_SHA} from ${SOURCE_BRANCH}"
DEPLOY_SHA="$(git -C "$WORKTREE" rev-parse --short HEAD)"

echo
echo "  staged   ${DEPLOY_SHA}  (built from ${SOURCE_BRANCH} ${SOURCE_SHA})"
echo "  live now ${ROLLBACK}"
echo

if [ "$PUSH" = "--push" ]; then
  git -C "$WORKTREE" push origin gh-pages
  echo "==> pushed. Live in ~1 minute at https://rajbhanderi107-droid.github.io/divi/"
  echo
  echo "    to roll back:  git push --force origin ${ROLLBACK}:gh-pages"
else
  echo "==> staged only. To publish:"
  echo
  echo "    ./scripts/deploy.sh --push"
  echo
  echo "    to roll back after publishing:  git push --force origin ${ROLLBACK}:gh-pages"
fi
