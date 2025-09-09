# new «membank» feature

let's refine «libsource» feature. new codename for it — «membank» (root name). example use case:

- «hey claude, search membank about vite custom plugin implementation usage»
- claude: searches 1408 port for relevant vite info

key entities:

- membank — root feature name
- libsource — sub-entity, means a library source extracted via gitingest to a .txt file, and then
  converted in rag augmented shape into db
- since any kind of data may be rag-enhanced we likley extend our db with more entities.
    - for example (do not remember this information, it is explanation for the future):
      libsource-react is a gitingested react github repositroy source. in future we may download
      react.dev docs and place them alongside libsource-react as docs-react. docs-react will be
      another type of rag-augmented entity.

location: this directory is a new place to colocate libsources, rag, db and all scripts. previously
we were relying on symlinks to read .txt libsources. but since we now have a server 1408 that serves
rag-augmented data, we no longer need filesystem for data access.

#### new structure

- membank
    - libsource (dir)
        - core → contains all py crud libsource scripts
        - /Users/dima/.dotfiles/.clauderc/.membank/libsource-scripts/config/libsource-config.json →
          moves here and named as .libsource-config.json (start with dot for easier lookup)
        - list of libsources libsource-\*.txt
    - cli (dir, contains search.py, server.py)
    - membank.db (file)
    - rag (stays as it is)
    - scripts (stays as it is)

#### key todos:

- move /Users/dima/.dotfiles/.clauderc/.membank/libsource and
  /Users/dima/.dotfiles/.clauderc/.membank/libsource-scripts in this directory and reconstruct
  according to «new structure»
- since all paths are changed, update all path refs
- delete all libsources.db in this project
- create new membank.db (empty)
- test full crud of currently registered libsources — this will uncover bugs after reconstruction
  and path updates — fix them all
- after reconstruction and testing full functionality and fixing all issues:
    - delete all current «libsource» information from ~/.dotfiles/claude.md
    - create ~/.dotfiles/membank/CLAUDE.md with full details about «membank» feature
    - update ~/.dotfiles/claude.md again but (important) only mention in high-level manner that
      «membank» feature source is located in this repository, briefly explain where to look for key
      entities, and tell that core info located in nested claude.md (probably via reference
      @membank/CLAUDE.md)
    - the idea is to modularize memory. ~/.dotfiles/claude.md should contain only a pointer to
      membank (not full info), but full info is in nested claude.md
- update package.json refs
