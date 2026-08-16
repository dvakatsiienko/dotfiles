package main

import "strings"

// A segment is the smallest self-contained unit of the rendered line. Segments
// return bare content: no separator, no leading bullet, no decision about where
// they sit. Assembling them — dropping the empty ones and putting Sep between
// what survives — happens here and nowhere else, so "what does the line look
// like" is one list rather than an accumulation of string concatenations.
//
// The rule "a segment renders only when its data source provides its field" is
// enforced by joinSegments returning "" for an absent segment, rather than by
// each producer remembering to check.
func joinSegments(segments ...string) string {
	kept := segments[:0:0]
	for _, segment := range segments {
		if segment != "" {
			kept = append(kept, segment)
		}
	}
	return strings.Join(kept, Sep)
}

// flatten splices a producer of several segments into a segment list.
func flatten(lists ...[]string) []string {
	var out []string
	for _, list := range lists {
		out = append(out, list...)
	}
	return out
}
