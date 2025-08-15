// biome-ignore-all lint: this is a legacy code that needs to be migrated
// @ts-nocheck
import { observer } from 'mobx-react-lite';

import { mobx } from '@/lib/mobx';

export const AuthResolver = observer(() => {
  const {
    ui: {
      setNotifierData,
      setCoreSettings,
      setAlert,
      setDynamicHeight,
      setTheme,
      applyCustomStyles,
      setIsSLG,
      setIsSDK,
      setSdkUrls,
      setHasParentIframe,
      setThemeEditorData,
      setViewType,
      setIsViewTypeWasSettledByQueryParam,
      getBanners,
      language: languageFromStore,
      setIsWasRequestToTheSettings,
      setLineFilter,
    },
    profile: { getToken, setIsResetCacheInProfileRequest, markTokenExpired, updateBalance },
  } = mobx;

  return <div>code...</div>;
});
