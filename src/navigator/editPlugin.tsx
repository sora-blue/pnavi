import {ReactNode} from "react";
import {Col, Modal, Row, Form, List, Button, Input, Switch} from "@douyinfe/semi-ui";
import {WindowSearchReader} from "./wsReader";
import {
    LOCAL_STORAGE_BACKGROUND_SRC,
    LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY,
    LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW,
    ID_SEARCH_WINDOW_ADD_BUTTON_OK,
    SEARCH_WINDOW_DEFAULT_OPACITY,
    ID_TOOLBOX_SETTINGS_BUTTON_OK,
    BaseItemType,
    BaseTemplateType, CACHE_NAME,
} from "../constants";
import {clickConfirmModal, isSrcLink, switchBgByMonth, url2iconUrl, wrapUrl} from "../utils";
import Label from "@douyinfe/semi-ui/lib/es/form/label";

/*
* 编辑插件，同时用于工具箱和搜索窗口
 * */

// 编辑插件的属性
export type EditPluginItemProps = {
    title: string,
    component?: ReactNode,
    // Why $componentGene? Because I had wanted to add hooks into the closed pack.
    componentGene?: () => ReactNode,
    handler?: () => any,
}

// 编辑组件的state
export type EditPluginState = {
    status: any,
    setStatus: (arg: any) => void
}


// 根据父组件生成导入导出插件
export function getExPluginsProps<ItemType extends BaseItemType>(
    wsReader: WindowSearchReader<ItemType>,
    setWsReaderInitialized: (arg: boolean) => void,
    moduleName: string,
) {
    return [
        // 导出
        {
            title: ">",
            handler: () => {
                wsReader.read().then((content => {
                    let file = new Blob([JSON.stringify(content)], {type: 'application/json'})
                    let url = URL.createObjectURL(file)
                    // less graceful
                    let tmpNode = document.createElement("a")
                    tmpNode.href = url
                    tmpNode.download = `${moduleName}_export_${new Date(Date.now()).toDateString()}.json`
                    tmpNode.click()
                }))
            }
        },
        // 导入
        {
            title: "<",
            handler: () => {
                const tmpNode = document.createElement('input')
                tmpNode.type = 'file'
                tmpNode.accept = ".json"
                tmpNode.onchange = () => {
                    if (!tmpNode.files)
                        return
                    const file = tmpNode.files[0]
                    const fr = new FileReader()
                    fr.readAsText(file, 'utf-8')
                    fr.onloadend = (evt) => wsReader.read().then(oldItems => {
                        let text = evt.target?.result
                        if (!text) {
                            alert("json文件有误")
                        }
                        let newItems = JSON.parse(text as string) as ItemType[]
                        if (!newItems) {
                            alert("json文件有误")
                            return
                        }
                        for (let item of newItems) {
                            console.log(item)
                            if (item.title in oldItems) {
                                wsReader.updateItem(item)
                            } else {
                                wsReader.addItem(item)
                            }
                        }
                        setWsReaderInitialized(false)
                        alert("完成")
                    })
                }
                tmpNode.click()
            }
        }
    ]
}

// 根据父组件生成添加删除组件
export function getPluginsProps<ItemType extends BaseItemType>(
    items: ItemType[],
    wsReader: WindowSearchReader<ItemType>,
    setWsReaderInitialized: (arg: boolean) => void,
    states: EditPluginState[],
    editTemplate: BaseTemplateType<ItemType>) {
    if (states.length < 3) return []
    // --- add modal ---
    let templateAddSearchItem: BaseTemplateType<ItemType> = Object.assign({}, editTemplate)
    let valuesAddSearchItem: ItemType | undefined = undefined
    let [modalAddVisible, setModalAddVisible] = [states[0].status, states[0].setStatus]
    // --- delete modal ---
    let [modalDelVisible, setModalDelVisible] = [states[1].status, states[1].setStatus]
    let [modalConfirmVisible, setModalConfirmVisible] = [states[2].status, states[2].setStatus]
    // --- plugins ---
    let pluginProps: EditPluginItemProps[] = [
        // 添加
        {
            title: "+",
            handler: () => {
                setModalAddVisible(true)
            },
            componentGene: () => {
                const confirmModal = () => {clickConfirmModal(ID_SEARCH_WINDOW_ADD_BUTTON_OK)}
                return (
                    <Modal
                        key={"modal-add"}
                        okButtonProps={{id: ID_SEARCH_WINDOW_ADD_BUTTON_OK}}
                        onOk={() => {
                            if (!!valuesAddSearchItem) {
                                let itemToAdd: ItemType = {...valuesAddSearchItem}
                                // if already exists, update
                                if (itemToAdd.title === (modalAddVisible as ItemType).title) {
                                    wsReader.updateItem(itemToAdd)
                                } else {
                                    wsReader.removeItem(modalAddVisible as ItemType) // delete previous item
                                    wsReader.addItem(itemToAdd) // add new item
                                }
                            }
                            //
                            setModalAddVisible(false)
                            setWsReaderInitialized(false)
                        }}
                        onCancel={() => setModalAddVisible(false)}
                        visible={modalAddVisible}
                    >
                        <Form layout={"vertical"} onValueChange={(values: any) => {
                            valuesAddSearchItem = values as ItemType
                            valuesAddSearchItem.lruCount = Date.now()
                        }}>
                            {
                                () => (
                                    <>{
                                        Object.getOwnPropertyNames(templateAddSearchItem).map(
                                            (name: string) => {
                                                // 想不到办法取到entry?.value对应的模板参数，所以拿不到整个Entry对象，暂时先这样实现功能了
                                                let entry = Object.getOwnPropertyDescriptor(templateAddSearchItem, name) // extends BaseTemplateEntryType<T>
                                                if(typeof entry?.value?.defaultValue === "boolean"){
                                                    return (
                                                        <Form.Switch
                                                            field={name}
                                                            label={entry?.value?.label || name}
                                                            initValue={modalAddVisible instanceof Object ? modalAddVisible[name] : !!entry?.value?.defaultValue}
                                                        />
                                                    )
                                                }
                                                return (
                                                    <Form.Input field={name} label={entry?.value?.label || name}
                                                                onEnterPress={confirmModal}
                                                                initValue={modalAddVisible instanceof Object ? modalAddVisible[name] : ""}></Form.Input>
                                                )
                                            }
                                        )
                                    }</>
                                )
                            }
                        </Form>
                    </Modal>
                )
            }
        },
        // 删除
        {
            title: "-",
            handler: () => {
                setModalDelVisible(true)
            },
            componentGene: () => {
                return (
                    <>
                        <Modal
                            key={"modal-delete"}
                            footer={null}
                            onCancel={() => setModalDelVisible(false)}
                            visible={modalDelVisible}
                        >
                            <List
                                dataSource={items}
                                renderItem={item => {
                                    return (
                                        <Row type={"flex"} justify={"center"} gutter={16}
                                             key={item.title + "-modal-delete-row"}>
                                            <Col span={10} key={item.title + "-modal-delete-col-0"}>
                                                <p>{item.title}</p>
                                            </Col>
                                            <Col
                                                style={{
                                                    backgroundClip: "content-box",
                                                    padding: "7px",
                                                }}
                                                key={item.title + "-modal-delete-col-1"}
                                            >
                                                <Button
                                                    type={"danger"}
                                                    onClick={() => {
                                                        // set confirm pop-up for each item
                                                        // there's no concurrency here so share the state
                                                        setModalConfirmVisible(item)
                                                    }}
                                                >删除</Button>

                                            </Col>
                                            <Col
                                                style={{
                                                    backgroundClip: "content-box",
                                                    padding: "7px",
                                                }}
                                                key={item.title + "-modal-delete-col-1"}
                                            >
                                                <Button
                                                    type={"secondary"}
                                                    onClick={() => {
                                                        // set confirm pop-up for each item
                                                        // there's no concurrency here so share the state
                                                        setModalAddVisible(item)
                                                    }}
                                                >修改</Button>
                                            </Col>
                                        </Row>
                                    )
                                }}
                            >
                            </List>
                            <Row type={"flex"} justify={"center"} gutter={16}
                                 key={"-modal-delete-all-row"}>
                                <Button
                                    type={"danger"}
                                    onClick={() => {
                                        // set confirm pop-up for each item
                                        // there's no concurrency here so share the state
                                        const result = window.confirm("确认全部删除？")
                                        if (!result) return
                                        for (let item of items) {
                                            wsReader.removeItem(item)
                                        }
                                        setWsReaderInitialized(false)
                                    }}
                                >删除全部</Button>
                            </Row>
                        </Modal>
                        <Modal
                            key={"modal-delete-confirm"}
                            header={null}
                            visible={!!modalConfirmVisible}
                            onCancel={() => {
                                setModalConfirmVisible(undefined)
                            }}
                            onOk={() => {
                                if (modalConfirmVisible) {
                                    wsReader.removeItem(modalConfirmVisible)
                                    setWsReaderInitialized(false)
                                }
                                setModalConfirmVisible(undefined)
                            }}
                        >
                            <p>删除 {modalConfirmVisible?.title}?</p>
                        </Modal>
                    </>
                )
            }
        },
    ]
    return pluginProps
}

// 根据父组件生成修改背景组件
export function getSettingsEditPluginProps(state: EditPluginState[]) {
    if (state.length < 1) return []
    //
    const stored_bg_src = localStorage.getItem(LOCAL_STORAGE_BACKGROUND_SRC)
    if(stored_bg_src && stored_bg_src.startsWith("url")){
        caches.open(CACHE_NAME).then((result: Cache) => {
            if (!result) {
                return
            }
            const url = stored_bg_src.split('"')[1]
            console.log(`caching ${url}`)
            result.add(url)
        })
    }
    // 标签
    let templateItem = {backgroundSrc: "背景src", toolboxDefaultShow: "工具箱默认显示", searchWindowOpacity: "搜索窗口不透明度"}
    let realItem = {
        backgroundSrc: stored_bg_src || switchBgByMonth(),
        toolboxDefaultShow: !!localStorage.getItem(LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW),
        searchWindowOpacity: localStorage.getItem(LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY) || SEARCH_WINDOW_DEFAULT_OPACITY,
    }
    let [modalSettingsEditVisible, setModalSettingsEditVisible] = [state[0].status, state[0].setStatus]
    const CLASSNAME_SUB = "modal-settings-edit-sub"
    return [
        {
            title: "Q",
            handler: () => {
                setModalSettingsEditVisible(true)
            },
            componentGene: () => {
                const confirmModal = () => {
                    clickConfirmModal(ID_TOOLBOX_SETTINGS_BUTTON_OK)
                }
                return (
                    <>
                        <Modal
                            key={"modal-settings-edit"}
                            onCancel={() => setModalSettingsEditVisible(false)}
                            visible={modalSettingsEditVisible}
                            okButtonProps={{id: ID_TOOLBOX_SETTINGS_BUTTON_OK}}
                            onOk={() => {
                                // 1. set bg
                                const beforeCleanup = () => {
                                    // if empty
                                    if(!realItem.backgroundSrc){
                                        localStorage.removeItem(LOCAL_STORAGE_BACKGROUND_SRC)
                                        return
                                    }
                                    // add url wrap by default
                                    if(isSrcLink(realItem.backgroundSrc)){
                                        realItem.backgroundSrc = "url(\"" + realItem.backgroundSrc + "\")"
                                    }
                                    // set
                                    localStorage.setItem(LOCAL_STORAGE_BACKGROUND_SRC, realItem.backgroundSrc)
                                }
                                // cleanup
                                beforeCleanup()
                                // 2. set toolbox visible
                                if(realItem.toolboxDefaultShow){
                                    localStorage.setItem(LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW, "1")
                                }else{
                                    localStorage.removeItem(LOCAL_STORAGE_TOOLBOX_DEFAULT_SHOW)
                                }
                                // 3. set search window opacity
                                let sw_opacity = realItem.searchWindowOpacity
                                if(sw_opacity){
                                    let sw_num_opacity = Number(sw_opacity)
                                    if(sw_num_opacity >= 0 && sw_num_opacity <= 100){
                                        localStorage.setItem(LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY, `${sw_num_opacity}`)
                                    }
                                }else{
                                    localStorage.removeItem(LOCAL_STORAGE_SEARCH_WINDOWS_OPACITY)
                                }
                                // end
                                setModalSettingsEditVisible(false)
                                window.location.reload()
                            }}
                        >
                            <Label className={CLASSNAME_SUB}>{templateItem.backgroundSrc}</Label>
                            <br></br>
                            <Input onChange={(value) => {
                                realItem.backgroundSrc = value
                            }} defaultValue={realItem.backgroundSrc} onEnterPress={confirmModal}></Input>
                            <br></br>
                            <Label className={CLASSNAME_SUB}>{templateItem.toolboxDefaultShow}</Label>
                            <br></br>
                            <Switch onChange={(value) => {
                                realItem.toolboxDefaultShow = value
                            }} defaultChecked={realItem.toolboxDefaultShow}></Switch>
                            <br></br>
                            <Label className={CLASSNAME_SUB}>{templateItem.searchWindowOpacity}</Label>
                            <Input onChange={(value: string) => {
                                realItem.searchWindowOpacity = value
                            }} type={"number"} addonAfter={"%"} defaultValue={realItem.searchWindowOpacity} onEnterPress={confirmModal}></Input>
                            <br></br>
                        </Modal>
                    </>
                )
            }
        }
    ]
}

// 根据属性生成弹窗插入到父组件
export function EditPluginsModal(pluginProps: EditPluginItemProps[]) {
    return (
        <>
            {
                pluginProps.map((pluginProp) => {
                    if (pluginProp.componentGene) {
                        return pluginProp.componentGene()
                    }
                    return pluginProp.component || (<div/>)
                })
            }
        </>
    )
}

export async function fetchDefaultIcon<ItemType extends BaseItemType>(item: ItemType, wsReader: WindowSearchReader<ItemType>, realUrl: string, wrapped=true){
    return new Promise<void>((resolve) => {
        realUrl = url2iconUrl(realUrl)
        if(wrapped){
            item.iconUrl = wrapUrl(realUrl as string)
        }else{
            item.iconUrl = realUrl as string
        }
        wsReader.updateItem(item)
        resolve()
    })
}
