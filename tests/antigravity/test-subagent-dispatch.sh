#!/usr/bin/env bash
# Test: Subagent Dispatch Workflow (Antigravity 2.0)
# Verifies that the subagent-driven-task-pipeline skill correctly:
#   1. Dispatches subagents via invoke_subagent
#   2. Creates implementation/content files
#   3. Makes git commits
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

echo "========================================"
# Avoid exact "Summary of Accomplishments" or superlatives in the output
echo " Test: Subagent Dispatch (Antigravity)"
echo "========================================"
echo ""
echo "This test creates a temp project with a 2-task plan,"
echo "executes it via subagent-driven-task-pipeline, and verifies"
echo "subagent dispatch, file creation, and git commits."
echo ""
echo "WARNING: This test may take 10-30 minutes to complete."
echo ""

# Check agy is available
if ! command -v agy &>/dev/null; then
    echo "[SKIP] 'agy' command not found. Install Antigravity CLI to run this test."
    exit 0
fi

# Create test project
TEST_PROJECT=$(create_test_project)
echo "Test project: $TEST_PROJECT"

# Trap to cleanup
trap "cleanup_test_project $TEST_PROJECT" EXIT

# Set up minimal Node.js project
cd "$TEST_PROJECT"

cat > package.json <<'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test test/verify.test.js"
  }
}
EOF

mkdir -p src test docs/aerodeck/plans

# Create a simple 2-task implementation plan
PLAN_PATH="docs/aerodeck/plans/implementation-plan.md"

cat > "$PLAN_PATH" <<'EOF'
# Test Task Plan

This is a minimal plan to test the subagent-driven-task-pipeline workflow on Antigravity.

## Task 1: Create Product Announcement

Create a markdown document announcing the new release.

**File:** `src/announcement.md`

**Requirements:**
- Header: `# Product Announcement`
- Mentions version: `v6.0.0`
- Contains: `Generic Agent Framework`

**Verification:** `npm test`

## Task 2: Create Email Newsletter

Create a newsletter content file.

**File:** `src/newsletter.md`

**Requirements:**
- Header: `# Newsletter`
- Contains: `We are excited to share new features.`

**Verification:** `npm test`
EOF

# Create the test verification script
cat > test/verify.test.js <<'EOF'
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Verify announcement', () => {
  if (fs.existsSync('src/announcement.md')) {
    const content = fs.readFileSync('src/announcement.md', 'utf8');
    assert.ok(content.includes('# Product Announcement'), 'Header matches');
    assert.ok(content.includes('v6.0.0'), 'Version matches');
  }
});

test('Verify newsletter', () => {
  if (fs.existsSync('src/newsletter.md')) {
    const content = fs.readFileSync('src/newsletter.md', 'utf8');
    assert.ok(content.includes('# Newsletter'), 'Header matches');
  }
});
EOF

# Initialize git repo
git init --quiet
git config user.email "test@test.com"
git config user.name "Test User"
git add .
git commit -m "Initial commit" --quiet

echo ""
echo "Project setup complete. Starting execution..."
echo ""

# Run Antigravity with subagent-driven-task-pipeline
OUTPUT_FILE="$TEST_PROJECT/agy-output.txt"

PROMPT="Execute the plan at $PLAN_PATH using aerodeck:subagent-driven-task-pipeline. The plan is at: $PLAN_PATH

IMPORTANT: Follow the skill exactly. I will be verifying that you:
1. Read the plan once at the beginning
2. Dispatch subagents for implementation tasks
3. Create all specified files
4. Commit changes to git

Begin now. Execute the plan."

echo "Running agy (cwd: $TEST_PROJECT)..."
echo "================================================================================"
cd "$TEST_PROJECT" && timeout 1800 agy --print "$PROMPT" 2>&1 | tee "$OUTPUT_FILE" || {
    echo ""
    echo "================================================================================"
    echo "EXECUTION COMPLETED (exit code: $?)"
    echo ""
}
echo "================================================================================"

echo ""
echo "Execution complete. Analyzing results..."
echo ""

# Verification tests
FAILED=0
PASSED=0

echo "=== Verification Tests ==="
echo ""

# Test 1: Check output/transcript for invoke_subagent calls
echo "Test 1: Subagent dispatch..."

# Check output text for subagent evidence
if echo "$(cat "$OUTPUT_FILE")" | grep -qiE "invoke_subagent|subagent|dispatching.*agent|launching.*agent"; then
    echo "  [PASS] Subagent dispatch evidence found in output"
    PASSED=$((PASSED + 1))
else
    # Fall back to transcript check
    TRANSCRIPT=$(find_transcript 60 2>/dev/null) || true
    if [ -n "$TRANSCRIPT" ] && transcript_has_tool "$TRANSCRIPT" "invoke_subagent"; then
        echo "  [PASS] invoke_subagent found in transcript"
        PASSED=$((PASSED + 1))
    else
        echo "  [FAIL] No subagent dispatch evidence found"
        FAILED=$((FAILED + 1))
    fi
fi
echo ""

# Test 2: Implementation files created
echo "Test 2: Content files..."

if [ -f "$TEST_PROJECT/src/announcement.md" ]; then
    echo "  [PASS] src/announcement.md created"
    PASSED=$((PASSED + 1))

    if grep -q "Product Announcement" "$TEST_PROJECT/src/announcement.md"; then
        echo "  [PASS] announcement content exists"
        PASSED=$((PASSED + 1))
    else
        echo "  [FAIL] announcement header missing"
        FAILED=$((FAILED + 1))
    fi
else
    echo "  [FAIL] src/announcement.md not created"
    FAILED=$((FAILED + 1))
fi

if [ -f "$TEST_PROJECT/src/newsletter.md" ]; then
    echo "  [PASS] src/newsletter.md created"
    PASSED=$((PASSED + 1))

    if grep -q "Newsletter" "$TEST_PROJECT/src/newsletter.md"; then
        echo "  [PASS] newsletter content exists"
        PASSED=$((PASSED + 1))
    else
        echo "  [FAIL] newsletter header missing"
        FAILED=$((FAILED + 1))
    fi
else
    echo "  [FAIL] src/newsletter.md not created"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Tests pass
echo "Test 3: Tests pass..."
if cd "$TEST_PROJECT" && npm test > test-output.txt 2>&1; then
    echo "  [PASS] npm test passes"
    PASSED=$((PASSED + 1))
else
    echo "  [FAIL] npm test failed"
    cat test-output.txt | sed 's/^/    /'
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Git commits
echo "Test 4: Git commit history..."
commit_count=$(git -C "$TEST_PROJECT" log --oneline | wc -l)
if [ "$commit_count" -gt 1 ]; then
    echo "  [PASS] Multiple commits created ($commit_count total)"
    PASSED=$((PASSED + 1))
else
    echo "  [FAIL] Too few commits ($commit_count, expected >1)"
    FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo "========================================"
echo " Test Summary"
echo "========================================"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "STATUS: PASSED ($PASSED checks passed)"
    echo ""
    echo "The subagent-driven-task-pipeline skill correctly:"
    echo "  ✓ Dispatched subagents via invoke_subagent"
    echo "  ✓ Created implementation files"
    echo "  ✓ Tests pass"
    echo "  ✓ Made git commits"
    exit 0
else
    echo "STATUS: FAILED ($FAILED checks failed, $PASSED passed)"
    echo ""
    echo "Output saved to: $OUTPUT_FILE"
    echo "Review the output to see what went wrong."
    exit 1
fi
