## Anti-Loop Debugging Policy

When fixing a bug, follow these rules strictly.

### 1. Diagnose before editing

- Inspect the relevant code, logs, stack traces, configuration, and recent changes.
- Reproduce the exact reported failure before proposing a fix.
- Establish a specific test or command that can prove the bug is fixed.
- If reproduction is impossible, explain why and request the missing evidence instead of guessing.

### 2. Track every attempt

For each attempt, record:

- Hypothesis about the root cause.
- Evidence supporting the hypothesis.
- Files changed and the reason for each change.
- Verification command and its actual output.
- Whether the result improved, regressed, or remained unchanged.

### 3. Enforce retry limits

- Maximum 3 distinct fix attempts per bug.
- Never repeat an identical edit or an identical failed strategy.
- After 2 unsuccessful attempts, stop editing and reassess the root cause.
- If the third attempt fails, stop autonomous debugging and report the findings.
- Do not reset the retry count simply because the conversation continues.

### 4. Change strategy when progress stalls

- Generate and rank at least 3 plausible root-cause hypotheses.
- Test one hypothesis at a time using evidence.
- Check dependencies, runtime configuration, API contracts, database state, and environment differences when relevant.
- Do not make unrelated changes to hide the symptom.
- Do not rewrite working components without evidence that they cause the bug.

### 5. Verify before declaring success

- Run the test that reproduced the original failure.
- Run relevant regression tests and the appropriate build, type-check, or lint command.
- Inspect the final diff for unintended changes.
- Never claim success without actual verification evidence.

### 6. Stop conditions

Stop immediately when:

- The original bug is verified as fixed.
- The same failure persists after the retry limit.
- No reliable reproduction or verification method can be established.
- A required external service, permission, or user decision is unavailable.

When stopping, report the root-cause hypotheses, attempts made, test outputs, changed files, remaining uncertainty, and the next recommended diagnostic step.

Do not launch nested agents, autonomous loops, or repeated commands without an explicit need and a bounded execution plan.