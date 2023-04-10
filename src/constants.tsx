// Navi global constants
export const DEFAULT_BACKGROUND_SPRING = "url(\"/img/bg/spring_@usalica.jpg\")"
export const DEFAULT_BACKGROUND_SUMMER = "url(\"/img/bg/summer_@usalica.jpg\")"
export const DEFAULT_BACKGROUND_AUTUMN = "url(\"/img/bg/autumn_@usalica.jpg\")"
export const DEFAULT_BACKGROUND_WINTER = "url(\"/img/bg/winter_@usalica.jpg\")"
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
    iconPath: string,
    lruCount?: number,
}

export const LOCAL_STORAGE_TOOLKIT_LIST = "TOOLKIT_LIST"
export const LOCAL_STORAGE_TOOLKIT_LIST_ITEM = "TOOLKIT_LIST_ITEM_"
export const LOCAL_STORAGE_TOOLKIT_DEFAULT_PROPS_LOCATION = "/default/navi_toolkit_default.json"