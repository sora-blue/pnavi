import "./naviToolbox.less"
import {useState} from "react";
import {WindowSearchReader} from "./wsReader";
import {
    EDIT_TEMPLATE_TOOLKIT_ITEM,
    LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW,
    LOCAL_STORAGE_TOOLKIT_DEFAULT_PROPS_LOCATION,
    LOCAL_STORAGE_TOOLKIT_LIST,
    LOCAL_STORAGE_TOOLKIT_LIST_ITEM,
    ToolkitItemProps
} from "../constants";
import {
    EditPluginItemProps,
    EditPluginsModal,
    EditPluginState,
    fetchDefaultIcon,
    getExPluginsProps,
    getPluginsProps,
    getSettingsEditPluginProps,
} from "./editPlugin";
import {cmpItemsLRUWithTop, isSrcLink, url2iconUrl} from "../utils";

/*
* 工具箱组件
* */

// 把类名放在同一个文件，方便编辑
const CLASSNAME_NAVI_TOOLBOX = "navi-toolbox"
const CLASSNAME_NAVI_TOOLBOX_OUTER_BOX = "navi-toolbox-list-outer-box"
const CLASSNAME_NAVI_TOOLBOX_INNER_BOX = "navi-toolbox-list-inner-box"
const CLASSNAME_NAVI_TOOLBOX_PADDING_LEFT = "navi-toolbox-padding-left"
const CLASSNAME_NAVI_TOOLBOX_PADDING_RIGHT = "navi-toolbox-padding-right"
const CLASSNAME_NAVI_TOOLBOX_PADDING_TOP = "navi-toolbox-padding-top"
const CLASSNAME_NAVI_TOOLBOX_PADDING_BOTTOM = "navi-toolbox-padding-bottom"
const CLASSNAME_NAVI_TOOLBOX_BOX_ITEM_LIST = "navi-toolbox-item-list"
const CLASSNAME_NAVI_TOOLBOX_ICON = "g-toolbox-icon"

function WindowToolbox() {
    // set visible
    const [isToolboxVisible, setToolboxVisible] = useState(!!localStorage.getItem(LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW))
    // close toolbox window when blank areas are clicked
    window.onclick = (evt) => {
        const eleList = document.querySelector(`.${CLASSNAME_NAVI_TOOLBOX_OUTER_BOX}`)
        const eleIcon = document.querySelector(`.${CLASSNAME_NAVI_TOOLBOX_ICON}`)
        if (!eleList || !evt.target) return
        // @ts-ignore
        if (eleList.contains(evt.target) || eleIcon.contains(evt.target)) return
        setToolboxVisible(false)
        resetToolboxScroll()
    }
    // read config from localstorage
    let [wsReader] = useState<WindowSearchReader<ToolkitItemProps>>(
        new WindowSearchReader(LOCAL_STORAGE_TOOLKIT_LIST,
            LOCAL_STORAGE_TOOLKIT_LIST_ITEM,
            LOCAL_STORAGE_TOOLKIT_DEFAULT_PROPS_LOCATION
        )
    )
    let [wsReaderInitialized, setWsReaderInitialized] = useState(false)
    let [iconItems, setIconItems] = useState<ToolkitItemProps[]>([])
    if (!wsReaderInitialized) {
        wsReader.read().then((result) => {
            setWsReaderInitialized(true)
            result.sort(cmpItemsLRUWithTop)
            setIconItems(result)
        })
    }
    // generate paddings
    const genPaddings = () => (
        <>
            <div className={CLASSNAME_NAVI_TOOLBOX_PADDING_LEFT} aria-hidden={"true"}></div>
            <div className={CLASSNAME_NAVI_TOOLBOX_PADDING_RIGHT} aria-hidden={"true"}></div>
            <div className={CLASSNAME_NAVI_TOOLBOX_PADDING_TOP} aria-hidden={"true"}></div>
            <div className={CLASSNAME_NAVI_TOOLBOX_PADDING_BOTTOM} aria-hidden={"true"}></div>
        </>
    )
    // generate list item
    const genListItem = (item: ToolkitItemProps) => {
        // adjust
        if(item.iconUrl){
            if(isSrcLink(item.iconUrl))
            item.iconUrl = `url("${item.iconUrl}") no-repeat center/80%`
        }else if(item.jumpUrl && isSrcLink(item.jumpUrl)){
            fetchDefaultIcon(item, wsReader, item.jumpUrl, true).then(() => {
                setWsReaderInitialized(false)
            }, () => {
                // use default favicon.ico
                item.iconUrl = url2iconUrl(item.jumpUrl)
                wsReader.updateItem(item)
                setWsReaderInitialized(false)
            })
        }
        return (
            <li className={CLASSNAME_NAVI_TOOLBOX_BOX_ITEM_LIST}>
                <a href={item.jumpUrl} onClick={(() => {
                    let prop = item
                    if (prop.lruCount === undefined) return
                    prop.lruCount = Date.now()
                    wsReader.updateItem(prop)
                })}>
                    {genPaddings()}
                    <div style={{
                        width: "78px",
                        height: "64px",
                        background: item.iconUrl
                    }}>
                    </div>
                    <p>{item.title}</p>
                </a>
            </li>
        )
    }
    // generate plugin item
    const genPluginItem = (item: EditPluginItemProps, iconUrl: string, title?: string) => {
        return (
            <li className={CLASSNAME_NAVI_TOOLBOX_BOX_ITEM_LIST}>
                <div onClick={() => {
                    if (item.handler === undefined) return
                    setToolboxVisible(false)
                    resetToolboxScroll()
                    item.handler()
                }}>
                    {genPaddings()}
                    <span>
                        <img src={iconUrl} alt={item.title}></img>
                    </span>
                    <p>{title ? title : item.title}</p>
                </div>
            </li>
        )
    }
    // set edit window
    let [modalAddVisible, setModalAddVisible] = useState(false)
    let [modalDelVisible, setModalDelVisible] = useState(false)
    let [modalConfirmVisible, setModalConfirmVisible] = useState<ToolkitItemProps>() // also use to store title
    let [modalBgEditVisible, setModalBgEditVisible] = useState(false)
    let addStat: EditPluginState = {status: modalAddVisible, setStatus: setModalAddVisible}
    let delStat: EditPluginState = {status: modalDelVisible, setStatus: setModalDelVisible}
    let confirmStat: EditPluginState = {status: modalConfirmVisible, setStatus: setModalConfirmVisible}
    let bgEditStat: EditPluginState = {status: modalBgEditVisible, setStatus: setModalBgEditVisible}
    const pluginProps = getPluginsProps(iconItems, wsReader, setWsReaderInitialized, [addStat, delStat, confirmStat], EDIT_TEMPLATE_TOOLKIT_ITEM)
    const extraPluginProps = getExPluginsProps(wsReader, setWsReaderInitialized, "toolbox")
    const settingsEditPluginProps = getSettingsEditPluginProps([bgEditStat])
    //
    return (
        <>
            {EditPluginsModal(pluginProps)}
            {EditPluginsModal(settingsEditPluginProps)}
            <span className={CLASSNAME_NAVI_TOOLBOX}>
            <span className={CLASSNAME_NAVI_TOOLBOX_OUTER_BOX} style={{
                display: isToolboxVisible ? "inherit" : "none",
                visibility: isToolboxVisible ? "visible" : "hidden",
                zIndex: isToolboxVisible ? 15 : -1,
            }}>
                <ul className={CLASSNAME_NAVI_TOOLBOX_INNER_BOX}>
                    {iconItems.map(genListItem)}
                    <hr style={{opacity: "60%", position: "relative", margin: "10%"}}></hr>
                    {genPluginItem(pluginProps[0], "/img/trust0-0.png", "添加")}
                    {genPluginItem(pluginProps[1], "/img/restrict-1.png", "删除")}
                    <br></br>
                    {genPluginItem(extraPluginProps[0], "/img/notepad-5.png", "导出")}
                    {genPluginItem(extraPluginProps[1], "/img/outlook_express_tack-3.png", "导入")}
                    {genPluginItem(settingsEditPluginProps[0], "/img/kodak_imaging-0.png", "设置")}
                </ul>
            </span>
            <svg className="g-toolbox-icon" focusable="false" viewBox="0 0 24 24"
                 onClick={() => setToolboxVisible(!isToolboxVisible)}>
                <path
                    d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"></path>
            </svg>
        </span>
        </>
    )
}

function resetToolboxScroll(){
    const eleList = document.querySelector(`.${CLASSNAME_NAVI_TOOLBOX_OUTER_BOX}`)
    if(eleList)
        eleList.scrollTop = 0
}

export default WindowToolbox;