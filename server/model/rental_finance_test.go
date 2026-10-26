package model

import (
	"testing"
)

func TestParseAmountCents(t *testing.T) {
	tests := []struct {
		input string
		want  int64
		valid bool
	}{
		{input: "25000", want: 2500000, valid: true},
		{input: "25000.5", want: 2500050, valid: true},
		{input: "0.01", want: 1, valid: true},
		{input: "1.001", valid: false},
		{input: "-1", valid: false},
		{input: "one hundred", valid: false},
	}
	for _, test := range tests {
		got, err := ParseAmountCents(test.input)
		if test.valid && (err != nil || got != test.want) {
			t.Errorf("ParseAmountCents(%q) = %d, %v; want %d, nil", test.input, got, err, test.want)
		}
		if !test.valid && err == nil {
			t.Errorf("ParseAmountCents(%q) succeeded; want invalid amount", test.input)
		}
	}
}
