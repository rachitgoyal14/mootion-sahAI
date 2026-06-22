TASK: Make Explain It misconception data ("conceptual misunderstandings") visible end-to-end on the teacher dashboard. Scope is Explain It ONLY — do not touch Recall It / quiz misconception generation in this pass.

CONTEXT YOU ALREADY HAVE CONFIRMED:
- Explain It submission flow: POST /api/analytics/submit-explanation → LLM generates `gaps` (misconceptions, JSON array) → stored on the ConceptScore table.
- GET /teachers/classes/{class_id}/analytics/overview already correctly reads ConceptScore.gaps and works.
- GET /teachers/classes/{class_id}/chapters/{chapter_id}/analytics currently returns hardcoded mock top_misconceptions.
- GET /teachers/students/{student_id}/analytics currently returns hardcoded mock values (streak, misconceptions_history, prediction_accuracy).
- GET /teachers/classes/{class_id}/students/analytics currently parses StudentAttempt.ai_feedback instead of ConceptScore.gaps.
- Backend file: backend/app/api/teachers.py
- Backend file: backend/app/services/model_finder.py has the existing query_llm helper (Azure OpenAI) if any LLM call is needed — should NOT be needed for this pass since gaps are already generated at submission time.

STEP 0 — INVESTIGATE BEFORE TOUCHING CODE (do this first, report findings before changing anything):
1. Search the frontend (frontend/src/) for every call site hitting:
   - /teachers/classes/{class_id}/analytics/overview
   - /teachers/classes/{class_id}/chapters/{chapter_id}/analytics
   - /teachers/students/{student_id}/analytics
   - /teachers/classes/{class_id}/students/analytics
2. For each, identify: which dashboard page/component renders it, and whether it's actually wired into a visible UI element or dead/unused code.
3. Report back: which of these 3 broken endpoints are ACTUALLY consumed by a live dashboard screen, and which (if any) are unused/orphaned. This determines what we fix vs skip.
4. Do not write any backend code until this investigation is reported.

STEP 1 — FIX THE ENDPOINTS THAT ARE ACTUALLY CONSUMED (based on Step 0 findings):
For each confirmed-live endpoint among the three, replace hardcoded mocks with real ConceptScore.gaps-based logic:

- Chapter analytics (top_misconceptions):
  - Query ConceptScore rows for that chapter_id.
  - Collect gaps from rows where gaps is non-empty.
  - Flatten the list, count frequency of each distinct misconception string, sort descending, take top 3.
  - Return as list of {"text": <misconception>, "count": <int>, "percentage": <float, count/total_gaps*100>}.
  - If zero gaps exist for the chapter, return an empty list — do not fall back to mock data.

- Student analytics:
  - misconceptions_history: fetch all ConceptScore rows for this student ordered by created_at, extract gaps. For each gap, mark "resolved" if a later ConceptScore row exists for the same chapter_id with a score > 7, otherwise "unresolved". Return list of {misconception, status}.
  - streak: compute from real activity (StudentAttempt / StudentDoubt / StudentAiChatThread timestamps) — count consecutive active days in the last 30 days. If this is not feasible within this pass, return 0, NEVER a hardcoded non-zero number.
  - prediction_accuracy: if there's no real way to compute this from current data, remove the field entirely from the response rather than hardcoding a number.

- Class students analytics:
  - Replace StudentAttempt.ai_feedback parsing with a per-student aggregation of their ConceptScore.gaps.
  - Keep all other existing computed fields (avg scores, progress%) untouched — do not refactor things that aren't broken.

STEP 2 — VALIDATION:
- Confirm no endpoint returns mock/placeholder data under any code path (search for the actual hardcoded values mentioned above and make sure they're deleted, not just unreachable).
- Confirm dual-write to StudentAttempt is untouched — do not modify the Explain It submission flow itself, only the read/aggregation side.
- For any endpoint Step 0 found to be unused/orphaned, leave it alone — do not waste time fixing dead code, just note it in your report.

STEP 3 — DELIVERABLE:
- List of files changed with the actual diffs.
- Confirmation, per endpoint, of: (a) whether it was live or orphaned per Step 0, (b) what real data source now backs it if fixed.
- Manual test steps: which assignment to submit, which endpoint to curl/hit, what real (non-mock) response shape to expect.

CONSTRAINTS:
- Do not touch Recall It, quiz submission, or quiz-based misconception generation — that's explicitly out of scope for this pass.
- Do not add new LLM calls — gaps are already generated at Explain It submission time; this is purely a read/aggregation fix.
- Do not modify ConceptScore schema or the submit-explanation endpoint.
- If something in this plan turns out to be based on a wrong assumption about the schema or existing code, stop and report the discrepancy rather than guessing and proceeding.