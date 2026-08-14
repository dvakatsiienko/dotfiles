# A real `instruction.md`, annotated

The shipped prompt for `vite-wintertc-middleware`. **66 words** — short for the style
range (190–470 is the middle half), which is legitimate: length follows the work, and
this feature is narrow.

The file itself contains only the prompt. Everything after it here is commentary.

---

```
Vite's dev server middlewares only work via Node's Connect-style (req, res, next)
signature, forcing WinterTC-style runtimes (Hono-like) to create adapters to integrate.
Extend server.middlewareMode to accept "winter-tc", exposing server.fetch(request) to run
the middleware stack against a standard Request and return a standard Response, allowing
seamless integration. Request/Response bodies must support streaming and buffering.
Headers must be preserved across the conversion. WebSocket proxying is out of scope.
```

---

## Sentence by sentence

**1. "Vite's dev server middlewares only work via Node's Connect-style `(req, res, next)`
signature, forcing WinterTC-style runtimes (Hono-like) to create adapters to integrate."**

Opens with the problem, present tense, no preamble. Names the concrete pain (adapters on
the consumer's side) rather than asking for a feature in the abstract. `Hono-like` gives
the reader a real reference point without prescribing an implementation.

**2. "Extend `server.middlewareMode` to accept `"winter-tc"`, exposing
`server.fetch(request)` to run the middleware stack against a standard `Request` and
return a standard `Response`, allowing seamless integration."**

Carries the two names the verifiers assert: the **option value** and the **entry point**.
Both are public interface. Neither could be guessed — a correct solution that named the
handler something else would fail on naming rather than behavior, which is the
`teleport-ttl` failure mode.

Everything else is left open: no file, no module, no class, no internal helper, no hint
that the response object needs to be a stream.

**3. "Request/Response bodies must support streaming and buffering."**

Two gradable requirements in seven words. "Streaming" is the one a mediocre
implementation silently fails — collecting the whole body then returning it satisfies
"buffering" and looks finished.

**4. "Headers must be preserved across the conversion."**

Deliberately *not* "including duplicates." That phrase was in the approved draft and was
cut: comma-joining duplicate field lines does not change message semantics per RFC 9110
§5.3, so the phrase either said nothing or pushed the implementer past the standard
`Headers` class. `Set-Cookie` is the one genuine exception and is graded **unstated** —
the standard defines exactly one right answer, so a senior gets there by doing the job
properly.

**5. "WebSocket proxying is out of scope."**

The scope line. Six words, and it is a difficulty lever: deleting it later widens scope,
informed by real run data.

Precision matters here — the line says *WebSocket* proxying, not "proxy." HTTP proxying
works through the adapter and is verified. A blanket "proxy is out of scope" would be
inaccurate and could push an implementer to neglect stream fidelity that HTTP proxying
depends on.

## What is deliberately absent

- **No mention of tests or documentation.** Never requested.
- **No "keep existing behavior unchanged."** A senior does that anyway; regression
  verifiers catch it if not.
- **No file paths, module names, or architecture.** The implementer decides.
- **No error-handling requirement.** Baseline defensive engineering, not a design fork —
  but it *is* covered in the verifiers, unstated.
- **No mention of the existing `true` value staying untouched.** Reviewer feedback on the
  draft was *"I would remove this"* — implicit, not a genuine ambiguity. The constraint
  still binds the implementation and the verifiers; it just is not stated to the model.

## The two-directional edit

The prompt was revised twice after approval, in **opposite directions for the same
reason**:

- **Removed** "including duplicates" — the standard already determines the answer, so
  steering could only mislead.
- **Added** `server.fetch(request)` — the answer is arbitrary and a verifier depends on
  it, so it must be stated.

That pairing is the whole specify/don't-specify judgment in one example.
