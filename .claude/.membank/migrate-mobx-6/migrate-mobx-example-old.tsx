// biome-ignore-all lint: this is a legacy code that needs to be migrated
// @ts-nocheck
// biome-ignore-all lint: this is a legacy code that needs to be migrated
// @ts-nocheck
import { inject, observer } from 'mobx-react';

export const AuthResolverBase = ({
    setCoreSettings,
    setAlert,
    setDynamicHeight,
    setTheme,
    applyCustomStyles,
    getToken,
    setIsSLG,
    setIsSDK,
    setSdkUrls,
    setHasParentIframe,
    setThemeEditorData,
    setViewType,
    setIsViewTypeWasSettledByQueryParam,
    getBanners,
    languageFromStore,
    setIsWasRequestToTheSettings,
    setIsResetCacheInProfileRequest,
    setLineFilter,
    markTokenExpired,
    updateBalance,
}) => {
    return <div>code...</div>;
};

export const AuthResolver = inject(
    ({
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
        profile: {
            getToken,
            setIsResetCacheInProfileRequest,
            markTokenExpired,
            updateBalance,
        },
    }) => ({
        applyCustomStyles,
        getBanners,
        getToken,
        languageFromStore,
        markTokenExpired,
        setAlert,
        setCoreSettings,
        setDynamicHeight,
        setHasParentIframe,
        setIsResetCacheInProfileRequest,
        setIsSDK,
        setIsSLG,
        setIsViewTypeWasSettledByQueryParam,
        setIsWasRequestToTheSettings,
        setLineFilter,
        setNotifierData,
        setSdkUrls,
        setTheme,
        setThemeEditorData,
        setViewType,
        updateBalance,
    }),
)(observer(AuthResolverBase));
