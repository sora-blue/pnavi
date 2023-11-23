import {useState} from "react";
import {WindowSearchReader} from "./wsReader";
import {Avatar, Card, Col, Input, Row, Space} from "@douyinfe/semi-ui";
import {AvatarColor} from "@douyinfe/semi-ui/lib/es/avatar";
import {IconSearch} from "@douyinfe/semi-icons";
import {
    LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY,
    LOCAL_STORAGE_WINDOW_SEARCH_DEFAULT_PROPS_LOCATION,
    LOCAL_STORAGE_WINDOW_SEARCH_LIST,
    LOCAL_STORAGE_WINDOW_SEARCH_LIST_ITEM,
    SEARCH_WINDOW_DEFAULT_OPACITY,
    EDIT_TEMPLATE_SEARCH_ITEM,
    SearchItemProps,
    NAVi_SEARCH_WINDOW_TRANSITION_TIMEOUT,
    NAVi_SEARCH_WINDOW_TRANSITION_DURATION,
    NAVi_SEARCH_WINDOW_LONG_TEXT_LIMIT, BaseTemplateType,
} from "../constants";
import {
    EditPluginItemProps,
    EditPluginsModal,
    EditPluginState,
    fetchDefaultIcon,
    getExPluginsProps,
    getPluginsProps,
} from "./editPlugin";
import {cmpItemsLRUWithTop, isSrcLink, url2iconUrl} from "../utils";
import {ButTextArea} from "../components/ButTextArea";

/*
* 搜索窗口组件
* */
const ID_SEARCH_WINDOW = "window-search"

export function WindowSearch() {
    // --- read search items ---
    let [wsReader] = useState<WindowSearchReader<SearchItemProps>>(
        new WindowSearchReader(LOCAL_STORAGE_WINDOW_SEARCH_LIST,
            LOCAL_STORAGE_WINDOW_SEARCH_LIST_ITEM,
            LOCAL_STORAGE_WINDOW_SEARCH_DEFAULT_PROPS_LOCATION)
    )
    let [wsReaderInitialized, setWsReaderInitialized] = useState(false)
    let [items, setItems] = useState<SearchItemProps[]>([])
    if (!wsReaderInitialized) {
        // sort by LRU
        wsReader.read().then((result) => {
            setWsReaderInitialized(true)
            result.sort(cmpItemsLRUWithTop)
            setItems(result)
        })
    }
    let [modalAddVisible, setModalAddVisible] = useState<any>(undefined)
    let [modalDelVisible, setModalDelVisible] = useState(false)
    let [modalConfirmVisible, setModalConfirmVisible] = useState<SearchItemProps>() // also use to store title
    let addStat: EditPluginState = {status: modalAddVisible, setStatus: setModalAddVisible}
    let delStat: EditPluginState = {status: modalDelVisible, setStatus: setModalDelVisible}
    let confirmStat: EditPluginState = {status: modalConfirmVisible, setStatus: setModalConfirmVisible}
    let editTemplate: BaseTemplateType<SearchItemProps> = Object.assign({}, EDIT_TEMPLATE_SEARCH_ITEM)
    const pluginProps = getPluginsProps(items, wsReader, setWsReaderInitialized, [addStat, delStat, confirmStat], editTemplate)
    const extraProps = getExPluginsProps(wsReader, setWsReaderInitialized, "search_window")
    // transition time
    const waitSeconds = NAVi_SEARCH_WINDOW_TRANSITION_DURATION
    const opacity = `${localStorage.getItem(LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY) || SEARCH_WINDOW_DEFAULT_OPACITY}%`
    setTimeout(() => {
        const ele = document.querySelector(`#${ID_SEARCH_WINDOW}`)
        if (!ele) return
        ele.setAttribute("style", `transition: opacity ${waitSeconds}s; opacity: ${opacity};`)
    }, NAVi_SEARCH_WINDOW_TRANSITION_TIMEOUT)
    return (
        <>
            {EditPluginsModal(pluginProps)}
            <div key={"window-search"} id={ID_SEARCH_WINDOW} style={{
                transition: "opacity 3s",
                opacity: "0%",
            }}>
                <Card
                    className={"navigator-window-search"}
                    title={"快速搜索"}
                    key={"navigator-window-search"}
                    headerStyle={{
                        top: 0,
                        zIndex: 2,
                        position: "sticky",
                        backgroundColor: "white",
                        margin: "0px",
                    }}
                >
                    {WindowSearchPluginsButtons(pluginProps.concat(extraProps))}
                    {WindowSearchCard(items, wsReader, setWsReaderInitialized)}
                </Card>
            </div>
        </>
    );
}

// LRU排序的搜索源
function WindowSearchCard(items: SearchItemProps[], wsReader: WindowSearchReader<SearchItemProps>, setWsReaderInitialized: any) {
    return (
        <div>
            {
                items.map((prop) => {
                    // 单击触发器
                    const inputOnKeyPress = (text: string, sip: SearchItemProps) => {
                        // use custom handler
                        if (sip.customHandler) {
                            return sip.customHandler(text, sip)
                        }
                        sip.lruCount = Date.now()
                        wsReader.updateItem(sip)
                        // jump
                        let newUrl = sip.url + text
                        if (sip.urlSuffix) {
                            newUrl += ` ${sip.urlSuffix}`
                        }
                        window.location.href = newUrl
                    }
                    // 如果没有指定图标，每次随机选一个背景颜色生成默认图标
                    const iconText = prop.title.slice(0, 2)
                    const searchTitle = prop.title
                    const colors: AvatarColor[] = ['blue', 'green', 'orange', 'purple']
                    const selectedColorIdx = Math.floor((Math.random() - 0.1) * 5)
                    const selectedColor = colors[selectedColorIdx]
                    const avatarClassName = "navi-window-search-avatars"
                    let inputValue = ""
                    let avatarComponent = (
                        <Avatar color={selectedColor} shape={'square'} size={"medium"}
                                className={avatarClassName}>{iconText}</Avatar>
                    )
                    if (prop.iconUrl === "default") {
                        // do nothing
                    } else if (prop.iconUrl) {
                        avatarComponent = (
                            <Avatar src={prop.iconUrl} shape={'square'} size={"medium"}
                                    className={avatarClassName}></Avatar>
                        )
                    } else if (prop.url && isSrcLink(prop.url)) {
                        fetchDefaultIcon(prop, wsReader, prop.url, false).then(() => {
                            setWsReaderInitialized(false)
                        }, () => {
                            // use default favicon.ico
                            prop.iconUrl = url2iconUrl(prop.url);
                            wsReader.updateItem(prop)
                            setWsReaderInitialized(false)
                        })
                    }
                    //
                    return (
                        <div key={prop.title + "-div"}>
                            <Row justify={"start"} gutter={[16, 16]} align={"top"}
                                 key={"window-search" + prop.title + "-show"}>
                                <Space spacing={"medium"}>
                                    <Col offset={1} span={4}
                                         key={"window-search" + prop.title + "-show-col-0"}>
                                        {avatarComponent}
                                    </Col>
                                    <Col span={16}
                                         key={"window-search" + prop.title + "-show-col-1"}>
                                        <p className={prop?.isOnTop ? "navigator-window-search-text-top" : "navigator-window-search-text"}>{searchTitle}</p>
                                    </Col>
                                </Space>
                            </Row>
                            <Row justify={"start"} gutter={[16, 16]} key={"window-search" + prop.title + "-input"}>
                                <Col offset={1} span={20}
                                     key={"window-search" + prop.title + "-input-col-0"}>
                                    {
                                        function(){
                                            // 如果设置长文本，使用TextArea组件
                                            if (prop.isLongText) {
                                                return (
                                                    <>
                                                        <ButTextArea
                                                            maxCount={NAVi_SEARCH_WINDOW_LONG_TEXT_LIMIT}
                                                            enableAutofill={true}
                                                            onCtrlEnter={(val) => {
                                                                return inputOnKeyPress(val, prop)
                                                            }}
                                                        />
                                                    </>)
                                            }
                                            return (
                                                <Input
                                                    size={"large"}
                                                    style={{font: "Consolas"}}
                                                    prefix={<IconSearch/>}
                                                    showClear={true}
                                                    onChange={(value) => {
                                                        inputValue = value
                                                    }}
                                                    onEnterPress={() => {
                                                        return inputOnKeyPress(inputValue, prop)
                                                    }}
                                                    className={"navigator-window-search-input"}/>
                                            )
                                        }()
                                    }
                                </Col>
                            </Row>
                        </div>
                    )
                })
            }
        </div>)
}

// 编辑插件
function WindowSearchPluginsButtons(pluginProps: EditPluginItemProps[]) {
    return (
        <Row className={"navigator-window-search-tools"} key={"window-search-tools"}
             justify={"start"} gutter={[16, 16]}>
            <Space>
                {
                    pluginProps.map((pluginProp) => {
                        return (
                            <Col span={4} key={"window-plugin-" + pluginProp.title}>
                                <Avatar
                                    style={
                                        {zIndex: 1}
                                    }
                                    className={"navi-window-search-avatars-plugin"}
                                    color={'light-blue'}
                                    shape={'square'}
                                    size={"small"}
                                    onClick={pluginProp.handler}
                                >{pluginProp.title}</Avatar>
                            </Col>
                        )
                    })
                }
            </Space>
        </Row>)
}

