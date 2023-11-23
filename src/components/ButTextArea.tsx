import React, {useState} from "react";
import {Button} from "@douyinfe/semi-ui";

import {fetchSuggestedAppend, FetchSuggestedResp} from "../utils";
import {NAVi_SEARCH_WINDOW_AUTOFILL_TIMEOUT} from "../constants";

import "./ButTextArea.less";

export type ButTextAreaProps = {
    maxCount?: number, // number 和 Number 之分闹麻了，出来一个类型声明 Number | 0
    onCtrlEnter?: (val: any, evt: React.KeyboardEvent | null) => any,
    enableAutofill?: boolean,
    autofillTimeout?: number,
}

// 基本是简化版的SemiDesign的TextArea上多加一个按钮和快捷键
export function ButTextArea(props: ButTextAreaProps) {
    let [stat, setRawStat] = useState({
        textValue: "",
        appendText: "",
        previousText: "",
    })

    const maxCount: number = !!props.maxCount ? props.maxCount : 0
    const textLen: number = !!stat.textValue ? stat.textValue.length : 0

    let timeoutID: any = null
    const timeoutDuration = props.autofillTimeout ? props.autofillTimeout : NAVi_SEARCH_WINDOW_AUTOFILL_TIMEOUT;

    // 包装一层，因为不新建object，useState就会认为和原来的一样没变化，js的魅力
    const setStat = (newStat: any) => {
        let tmp: any = JSON.parse(JSON.stringify(newStat))
        clearTimeout(timeoutID) // 没有执行的话，因为文本变化了，清掉
        setRawStat(tmp);
    }
    // 获取最新文本，用于下面的异步回调的检查
    const getRealtimeText = () => {
        const nowPrepend = document.querySelector(".butTextarea-content") as HTMLTextAreaElement
        if (!nowPrepend) {
            return stat.textValue
        }
        return nowPrepend.value
    }
    // 尝试引入自动补全，显示建议文本的实现基本是对着bing抄的
    if (props.enableAutofill) {
        // 文本不为空，文本有变化，没有已获取的建议
        if (!!stat.textValue && stat.previousText !== stat.textValue && !stat.appendText) {
            const suggestPromise = () => {
                fetchSuggestedAppend(stat.textValue).then((val: any) => {
                    val = val as FetchSuggestedResp

                    const appendText = val.append
                    if (appendText.length === 0) {
                        return
                    }
                    stat.appendText = appendText
                    timeoutID = null

                    // 如果回调太晚，防止覆盖输入
                    if (getRealtimeText() !== val.prepend) {
                        return
                    }

                    setStat(stat)
                }, () => {
                })
            }
            timeoutID = setTimeout(suggestPromise, timeoutDuration)
        }
    }

    return (
        <div className="semi-col semi-col-20 semi-col-offset-1" style={{padding: "8px"}}>
            <div className="semi-input-textarea-wrapper">
                <div className={"butTextarea-suggest"} style={{display: props.enableAutofill ? "default" : "none"}}>
                    <span className={"butTextarea-suggest-prepend"}>
                        {stat.textValue}
                    </span>
                    <span className={"butTextArea-suggest-append"}>
                        {stat.appendText}
                    </span>
                </div>
                <textarea rows={4} cols={20}
                          className="semi-input-textarea semi-input-textarea-autosize butTextarea-content"
                          style={{height: "90px"}}
                          placeholder={"Ctrl+Enter发送查询，Ctrl+Shift+Z补全"}
                          onKeyUp={(evt: React.KeyboardEvent) => {
                              // Ctrl+Enter
                              if (evt.ctrlKey && evt.key == "Enter") {
                                  const text = getRealtimeText()
                                  if (!!text && props.onCtrlEnter) {
                                      props.onCtrlEnter(text, evt)
                                  }
                              }
                              // Ctrl+Shift+Z
                              if (props.enableAutofill && evt.ctrlKey && evt.shiftKey && evt.key === "Z") {
                                  stat.previousText = stat.textValue
                                  stat.textValue = stat.textValue + stat.appendText
                                  stat.appendText = ""
                                  setStat(stat)
                              }
                          }}
                          value={stat.textValue}
                          onChange={(evt: any) => {
                              const newText = evt.target.value
                              // 没有新输入
                              if (newText === stat.textValue) {
                                  return;
                              }
                              // 截断到maxCount，清空建议文本
                              if (newText.length <= maxCount) {
                                  stat.previousText = stat.textValue
                                  stat.textValue = newText
                                  stat.appendText = ""
                                  setStat(stat)
                              } else {
                                  stat.previousText = stat.textValue
                                  stat.textValue = newText.slice(0, maxCount)
                                  stat.appendText = ""
                                  setStat(stat)
                              }
                          }}>
                </textarea>
                <div className="semi-input-textarea-counter"
                     style={{flexDirection: "row"}}>
                    <p style={{
                        marginBlockStart: '0.7em',
                        width: "80%",
                    }}>
                        {`${textLen}/${maxCount}`}
                    </p>
                    <Button
                        disabled={!stat.textValue}
                        className={"butTextarea-Button"}
                            onClick={(event: any) => {
                                if (props.onCtrlEnter) {
                                    props.onCtrlEnter(getRealtimeText(), null)
                                }
                                event.stopPropagation();
                            }}> 查询 </Button>
                </div>
            </div>
        </div>
    )
}