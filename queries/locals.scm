; Scopes

(method_decl) @local.scope
(function_decl) @local.scope
(constructor_decl) @local.scope
(iterator_decl) @local.scope
(block_statement) @local.scope
(if_expression) @local.scope
(match_expression) @local.scope
(quantifier_expression) @local.scope
(lambda_expression) @local.scope
(let_expression) @local.scope
(forall_expression) @local.scope

; Definitions

(formal name: (identifier) @local.definition)
(local_var_decl name: (identifier) @local.definition)
(quantifier_var (identifier) @local.definition)
(case_pattern (identifier) @local.definition)

; References

(name_segment (identifier) @local.reference)
