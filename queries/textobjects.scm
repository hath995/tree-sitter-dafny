; Dafny textobjects for Helix and Neovim
; Enables motions like vaf (select around function), vib (select inside block), etc.

; ── Functions ─────────────────────────────────────────────────
; `af` = around function, `if` = inside function

(method_decl) @function.around
(method_decl (block_statement) @function.inside)

(function_decl) @function.around
(function_decl (function_body) @function.inside)

(constructor_decl) @function.around
(constructor_decl (block_statement) @function.inside)

(iterator_decl) @function.around
(iterator_decl (block_statement) @function.inside)

; Lemmas are method_decl nodes starting with "lemma"
; (covered by method_decl above)

; ── Classes ───────────────────────────────────────────────────
; `ac` = around class, `ic` = inside class

(class_decl) @class.around
(class_decl "{" . (_)* @class.inside . "}")

(trait_decl) @class.around
(trait_decl "{" . (_)* @class.inside . "}")

(datatype_decl) @class.around

(newtype_decl) @class.around

(module_definition) @class.around
(module_definition (module_body) @class.inside)

; ── Parameters ────────────────────────────────────────────────
; `aa` = around argument/parameter, `ia` = inside argument

(formal) @parameter.around

(formals "(" . (formal) @parameter.inside . ")")

; ── Comments ──────────────────────────────────────────────────

(line_comment) @comment.around
(block_comment) @comment.around
