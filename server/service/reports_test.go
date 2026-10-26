package service

import (
	"archive/zip"
	"bytes"
	"io"
	"strings"
	"testing"
)

func TestBuildSimpleXLSXIncludesEscapedWorksheetContent(t *testing.T) {
	content, err := buildSimpleXLSX([][]string{{"Header"}, {"A&B <unit>"}})
	if err != nil {
		t.Fatalf("buildSimpleXLSX returned an error: %v", err)
	}
	archive, err := zip.NewReader(bytes.NewReader(content), int64(len(content)))
	if err != nil {
		t.Fatalf("generated XLSX is not a valid ZIP archive: %v", err)
	}
	for _, file := range archive.File {
		if file.Name != "xl/worksheets/sheet1.xml" {
			continue
		}
		reader, err := file.Open()
		if err != nil {
			t.Fatalf("could not open worksheet: %v", err)
		}
		worksheet, readErr := io.ReadAll(reader)
		closeErr := reader.Close()
		if readErr != nil {
			t.Fatalf("could not read worksheet: %v", readErr)
		}
		if closeErr != nil {
			t.Fatalf("could not close worksheet: %v", closeErr)
		}
		if !strings.Contains(string(worksheet), "A&amp;B &lt;unit&gt;") {
			t.Fatalf("worksheet content was not correctly XML-escaped: %s", worksheet)
		}
		return
	}
	t.Fatal("generated XLSX has no worksheet")
}
