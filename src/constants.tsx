// Navi global constants
export const DEFAULT_BACKGROUND_SPRING = "url(\"/img/bg/spring_@usalica.jpg\") center/80%"
export const DEFAULT_BACKGROUND_SUMMER = "url(\"/img/bg/summer_@usalica.jpg\")"
export const DEFAULT_BACKGROUND_AUTUMN = "url(\"/img/bg/autumn_@usalica.jpg\")"
export const DEFAULT_BACKGROUND_WINTER = "url(\"/img/bg/winter_@usalica.jpg\") center/80%"
export const LOCAL_STORAGE_BACKGROUND_SRC = "BACKGROUND_SRC"

// Navi Search Window localstorage
export type SearchItemProps = {
    title: string,
    url: string,
    urlSuffix?: string,
    iconUrl?: string,
    customHandler?: (text: string, sip: SearchItemProps) => any,
    lruCount?: number,
}

export const LOCAL_STORAGE_WINDOW_SEARCH_LIST = "WINDOW_SEARCH_LIST"
export const LOCAL_STORAGE_WINDOW_SEARCH_LIST_ITEM = "WINDOW_SEARCH_LIST_ITEM_"
export const LOCAL_STORAGE_WINDOW_SEARCH_DEFAULT_PROPS_LOCATION = "/default/navi_search_default.json"

// Navi toolkit localstorage
export type ToolkitItemProps = {
    title: string,
    jumpUrl: string,
    iconUrl: string,
    lruCount?: number,
}

export const LOCAL_STORAGE_TOOLKIT_LIST = "TOOLKIT_LIST"
export const LOCAL_STORAGE_TOOLKIT_LIST_ITEM = "TOOLKIT_LIST_ITEM_"
export const LOCAL_STORAGE_TOOLKIT_DEFAULT_PROPS_LOCATION = "/default/navi_toolkit_default.json"
export const LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW = "TOOLBOX_DEFAULT_SHOW"
export const LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY = "SEARCH_WINDOW_OPACITY"

export const SEARCH_WINDOW_DEFAULT_OPACITY = "80"
export const ID_TOOLBOX_SETTINGS_BUTTON_OK = "toolbox-settings-button-ok"
export const ID_SEARCH_WINDOW_ADD_BUTTON_OK = "search-windows-add-button-ok"
