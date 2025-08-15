// biome-ignore-all lint: this is a legacy code that needs to be migrated
// @ts-nocheck
import { observer } from 'mobx-react-lite';

import { mobx } from '@/lib/mobx';

export const AuthResolver = observer(() => {
  // destructuring is making components render after any of destructured observables changes
  // it is recommended to dereference values as late as possible
  // https://mobx.js.org/react-optimizations.html#dereference-values-late

  return (
    <div>
      {/* use values directly when possible */}
      <button disabled={!mobx.auth.token} type='button'>
        code...
      </button>
      kcode...
    </div>
  );
});
