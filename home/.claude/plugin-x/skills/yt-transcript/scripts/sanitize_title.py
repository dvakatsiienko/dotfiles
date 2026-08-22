#!/usr/bin/env python3
import sys, re
UNSAFE = re.compile(r'[/:*?"<>|]')
WHITESPACE = re.compile(r'\s+')
def sanitize(title, max_len=100):
    cleaned = UNSAFE.sub('', title)
    cleaned = WHITESPACE.sub(' ', cleaned).strip()
    cleaned = cleaned.rstrip('. ')
    if len(cleaned) > max_len:
        truncated = cleaned[:max_len]
        last_space = truncated.rfind(' ')
        if last_space > max_len - 20:
            truncated = truncated[:last_space]
        cleaned = truncated.rstrip('. ')
    return cleaned
if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python3 sanitize_title.py "<title>"', file=sys.stderr)
        sys.exit(1)
    print(sanitize(sys.argv[1]))
