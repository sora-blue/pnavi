// Navi global constants
export const DEFAULT_BACKGROUND = "url(\"https://s.cn.bing.net/th?id=OHR.LastDollarRoad_ZH-CN1462265798_1920x1080.jpg&rf=LaDigue_1920x1080.jpg\")"

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