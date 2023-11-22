// Navi global constants
export const DEFAULT_BACKGROUND_SPRING = "url(\"/img/bg/spring_@usalica.jpg\") center/80%"
export const DEFAULT_BACKGROUND_SUMMER = "url(\"/img/bg/summer_@usalica.jpg\")"
export const DEFAULT_BACKGROUND_AUTUMN = "url(\"/img/bg/autumn_@usalica.jpg\")"
export const DEFAULT_BACKGROUND_WINTER = "url(\"/img/bg/winter_@usalica.jpg\") center/80%"
export const LOCAL_STORAGE_BACKGROUND_SRC = "BACKGROUND_SRC"
export const NAVi_SEARCH_WINDOW_TRANSITION_TIMEOUT = 300 // ms
export const NAVi_SEARCH_WINDOW_TRANSITION_DURATION = 1 // s
export const NAVi_SEARCH_WINDOW_LONG_TEXT_LIMIT = 2000 // chars

// https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
// 新增BaseTemplateType类型：取ItemType里所有的键，类型为BaseTemplateEntryType，作为配置项
export type BaseItemType = {
    title: string,
    lruCount?: number | undefined,
    iconUrl?: string,
    isOnTop?: boolean,
}
export type BaseTemplateEntryType<T> = {
    label: string,
    defaultValue: T,
}
export type BaseTemplateType<ItemType extends BaseItemType> = {
    [Property in keyof ItemType]: BaseTemplateEntryType<ItemType[Property]>
}

// Navi Search Window localstorage
export type SearchItemProps = {
    title: string,
    url: string,
    isLongText?: boolean,
    isOnTop?: boolean,
    urlSuffix?: string,
    iconUrl?: string,
    customHandler?: (text: string, sip: SearchItemProps) => any,
    lruCount?: number,
}
export const EDIT_TEMPLATE_SEARCH_ITEM : BaseTemplateType<SearchItemProps> = {
    title: {label: "标题", defaultValue: ""},
    url: {label: "链接前缀", defaultValue: ""},
    urlSuffix: {label: "链接后缀（可选）", defaultValue: ""},
    iconUrl: {label: "图标链接（可选）", defaultValue: ""},
    isOnTop: {label: "是否置顶", defaultValue: false},
    isLongText: {label: "是否为长文本", defaultValue: false},
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
    isOnTop?: boolean,
}
export const EDIT_TEMPLATE_TOOLKIT_ITEM: BaseTemplateType<ToolkitItemProps> = {
    title: {label: "标题", defaultValue: ""},
    jumpUrl: {label: "链接", defaultValue: ""},
    iconUrl: {label: "图标链接（可选）", defaultValue: ""},
    isOnTop: {label: "是否置顶", defaultValue: false},
}

export const LOCAL_STORAGE_TOOLKIT_LIST = "TOOLKIT_LIST"
export const LOCAL_STORAGE_TOOLKIT_LIST_ITEM = "TOOLKIT_LIST_ITEM_"
export const LOCAL_STORAGE_TOOLKIT_DEFAULT_PROPS_LOCATION = "/default/navi_toolkit_default.json"
export const LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW = "TOOLBOX_DEFAULT_SHOW"
export const LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY = "SEARCH_WINDOW_OPACITY"

export const SEARCH_WINDOW_DEFAULT_OPACITY = "80"
export const ID_TOOLBOX_SETTINGS_BUTTON_OK = "toolbox-settings-button-ok"
export const ID_SEARCH_WINDOW_ADD_BUTTON_OK = "search-windows-add-button-ok"
