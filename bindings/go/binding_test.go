package tree_sitter_dafny_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_dafny "github.com/tree-sitter/tree-sitter-dafny/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_dafny.Language())
	if language == nil {
		t.Errorf("Error loading Dafny grammar")
	}
}
