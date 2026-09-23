// gmail filters as code — `gmailctl apply --config ~/frame/gmail`.
// the blocklist is the only thing edited by hand (or by the x-ray «gmail: block sender» command);
// every entry becomes a delete-on-arrival filter. gmail's own spam classification stays untouched.
local blocklist = import 'blocklist.json';

local me = 'imagnum.satellite@gmail.com';

// gmail search syntax has no regex: `from:` matches the address, the domain, or the display name.
local fromAny(list) = { or: [{ from: item } for item in list] };

local deleteRule(name, list) =
  if std.length(list) == 0 then [] else [{
    filter: fromAny(list),
    actions: { delete: true },
  }];

{
  version: 'v1alpha3',
  author: { name: 'Dima Vakatsiienko', email: me },
  rules:
    deleteRule('address', blocklist.address)
    + deleteRule('domain', ['@' + d for d in blocklist.domain])
    + deleteRule('name', blocklist.name),
}
