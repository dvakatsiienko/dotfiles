// screenshots-autoclean — moves screenshots older than 30 days to the Trash, once a day.
//
// A binary of our own rather than /usr/bin/find, because TCC gates ~/Desktop per executable
// and a system binary can never be granted: find under launchd answers
// "find: /Users/dima/Desktop/screenshots: Operation not permitted" and stops there. This one
// is ad-hoc signed with a stable identifier, so the grant survives every rebuild.
//
// 📌 It reports what it SCANNED, not only what it trashed. A folder holding nothing old
// enough and a folder it was refused both trash zero files, and that ambiguity is exactly
// how a silent TCC deny gets read as a clean run. A scan it cannot perform exits non-zero.

import Foundation

let maxAgeDays = 30
let folder = URL(fileURLWithPath: NSHomeDirectory())
    .appendingPathComponent("Desktop/screenshots")

let fileManager = FileManager.default
let cutoff = Date().addingTimeInterval(TimeInterval(-maxAgeDays * 24 * 60 * 60))

func log(_ line: String) {
    print(line)
}

func fail(_ line: String) -> Never {
    FileHandle.standardError.write(Data("\(stamp()) \(line)\n".utf8))
    exit(1)
}

func stamp() -> String {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withFullDate, .withTime, .withColonSeparatorInTime]

    return formatter.string(from: Date())
}

// .skipsHiddenFiles covers .DS_Store and every other dotfile — nothing hidden is ever a
// screenshot, and trashing one would be a surprise nobody asked for.
let entryList: [URL]
do {
    entryList = try fileManager.contentsOfDirectory(
        at: folder,
        includingPropertiesForKeys: [.isRegularFileKey, .contentModificationDateKey],
        options: [.skipsHiddenFiles]
    )
} catch {
    fail("cannot read \(folder.path): \(error.localizedDescription)")
}

var scannedCount = 0
var trashedCount = 0
var failedCount = 0

for entry in entryList {
    guard
        let values = try? entry.resourceValues(forKeys: [
            .isRegularFileKey, .contentModificationDateKey,
        ]),
        values.isRegularFile == true,
        let modifiedAt = values.contentModificationDate
    else { continue }

    scannedCount += 1

    guard modifiedAt < cutoff else { continue }

    do {
        var trashedURL: NSURL?
        try fileManager.trashItem(at: entry, resultingItemURL: &trashedURL)
        trashedCount += 1
        log("trashed \(entry.lastPathComponent)")
    } catch {
        failedCount += 1
        FileHandle.standardError.write(
            Data("\(stamp()) could not trash \(entry.lastPathComponent): \(error.localizedDescription)\n".utf8)
        )
    }
}

log(
    "\(stamp()) scanned \(scannedCount) file(s) in \(folder.path), trashed \(trashedCount) older than \(maxAgeDays) days"
)

exit(failedCount == 0 ? 0 : 1)
