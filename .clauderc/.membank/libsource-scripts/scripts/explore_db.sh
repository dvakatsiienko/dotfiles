#!/bin/bash
# Quick database exploration script

DB="libsources.db"

echo "📊 DATABASE OVERVIEW"
echo "===================="

echo -e "\n📁 Database size:"
ls -lh $DB | awk '{print "  "$5}'

echo -e "\n📋 Tables:"
sqlite3 $DB ".tables"

echo -e "\n📈 Chunk Statistics:"
sqlite3 -column -header $DB "
  SELECT 
    library,
    COUNT(*) as chunks,
    AVG(LENGTH(content)) as avg_size,
    SUM(json_array_length(semantic_tags)) as total_tags
  FROM chunks 
  GROUP BY library;"

echo -e "\n🏷️  Most Common Semantic Tags:"
sqlite3 $DB "
  SELECT semantic_tags, COUNT(*) as occurrences 
  FROM chunks 
  WHERE semantic_tags != '[]'
  GROUP BY semantic_tags 
  ORDER BY COUNT(*) DESC 
  LIMIT 5;" | head -20

echo -e "\n🔍 Sample Chunk (first with hooks tag):"
sqlite3 $DB "
  SELECT 
    '  Library: ' || library || char(10) ||
    '  Lines: ' || start_line || '-' || end_line || char(10) ||
    '  Tags: ' || semantic_tags || char(10) ||
    '  Preview: ' || substr(content, 1, 100) || '...'
  FROM chunks 
  WHERE semantic_tags LIKE '%react_hooks%' 
  LIMIT 1;"