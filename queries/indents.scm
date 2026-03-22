; Dafny indentation rules for tree-sitter

; ── Indent ────────────────────────────────────────────────────
; Increase indent after opening braces and certain keywords

[
  (block_statement)
  (module_body)
  (function_body)
  (class_decl)
  (trait_decl)
  (calc_statement)
] @indent

; ── Outdent ───────────────────────────────────────────────────
; Decrease indent at closing braces

"}" @outdent

; ── Specification clauses indent under their parent ───────────

[
  (requires_clause)
  (ensures_clause)
  (modifies_clause)
  (reads_clause)
  (decreases_clause)
  (invariant_clause)
] @indent

; ── Match/case ────────────────────────────────────────────────

(case_stmt_clause) @indent
(case_expr_clause) @indent

; ── If/while/for with blocks ──────────────────────────────────

(if_statement) @indent
(while_statement) @indent
(for_statement) @indent
(forall_statement) @indent
