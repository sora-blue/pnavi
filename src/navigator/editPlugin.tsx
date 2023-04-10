import {ReactNode} from "react";
import {Col, Modal, Row, Form, List, Button} from "@douyinfe/semi-ui";
import {WindowSearchReader} from "./wsReader";
import {LOCAL_STORAGE_BACKGROUND_SRC} from "../constants";
import {switchBgByMonth} from "../utils";

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
export function getExPluginsProps<ItemType extends { title: string, lruCount?: number | undefined }>(
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
export function getPluginsProps<ItemType extends { title: string, lruCount?: number | undefined }>(
    items: ItemType[],
    wsReader: WindowSearchReader<ItemType>,
    setWsReaderInitialized: (arg: boolean) => void,
    states: EditPluginState[],
    editTemplate: ItemType) {
    if (states.length < 3) return []
    // --- add modal ---
    let templateAddSearchItem = Object.assign({}, editTemplate)
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
                return (
                    <Modal
                        key={"modal-add"}
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
                                            (name) => {
                                                let label = Object.getOwnPropertyDescriptor(templateAddSearchItem, name)
                                                return (
                                                    <Form.Input field={name} label={label?.value || name}
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
export function getBackgroundEditPlugin(state: EditPluginState[]) {
    if (state.length < 1) return []
    let templateItem = {backgroundSrc: "背景src"}
    let realItem = {backgroundSrc: localStorage.getItem(LOCAL_STORAGE_BACKGROUND_SRC) || switchBgByMonth()}
    let [modalBgEditVisible, setModalBgEditVisible] = [state[0].status, state[0].setStatus]
    return [
        {
            title: "Q",
            handler: () => {
                setModalBgEditVisible(true)
            },
            componentGene: () => {
                return (
                    <>
                        <Modal
                            key={"modal-bgEdit"}
                            onCancel={() => setModalBgEditVisible(false)}
                            visible={modalBgEditVisible}
                            onOk={() => {
                                const beforeCleanup = () => {
                                    // if empty
                                    if(!realItem.backgroundSrc){
                                        localStorage.removeItem(LOCAL_STORAGE_BACKGROUND_SRC)
                                        return
                                    }
                                    // add url wrap by default
                                    let prefixes = ["http://", "https://", "/"]
                                    for(let i = 0 ; i < prefixes.length ; i++){
                                        if(realItem.backgroundSrc.startsWith(prefixes[i])){
                                            realItem.backgroundSrc = "url(\"" + realItem.backgroundSrc + "\")"
                                            break
                                        }
                                    }
                                    // set
                                    localStorage.setItem(LOCAL_STORAGE_BACKGROUND_SRC, realItem.backgroundSrc)
                                }
                                // cleanup
                                beforeCleanup()
                                setModalBgEditVisible(false)
                                window.location.reload()
                            }}
                        >
                            <Form layout={"vertical"} onValueChange={(value: typeof templateItem) => {
                                realItem = value
                            }}>
                                {
                                    () => (
                                        <>{
                                            Object.getOwnPropertyNames(templateItem).map(
                                                (name) => {
                                                    let label = Object.getOwnPropertyDescriptor(templateItem, name)
                                                    return (
                                                        <Form.Input field={name} label={label?.value || name}
                                                                    initValue={(realItem as any)[name]}></Form.Input>
                                                    )
                                                }
                                            )
                                        }</>
                                    )
                                }
                            </Form>
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

