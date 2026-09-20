// google apps script, runs inside the account on a 15-minute trigger: every unread thread in spam
// is marked read, so newton's unread counter stays at zero. spam itself stays where gmail put it.
// paste at script.google.com, run once by hand to grant the scope, then add a time-driven trigger.
function markSpamRead() {
  const threads = GmailApp.search('in:spam is:unread', 0, 500);
  if (threads.length) GmailApp.markThreadsRead(threads);
}
