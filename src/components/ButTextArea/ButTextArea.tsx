import React, {useRef, useState} from "react";
import {Button} from "@douyinfe/semi-ui";

import {fetchSuggestedAppend, FetchSuggestedResp} from "../../utils";
import {NAVi_SEARCH_WINDOW_AUTOFILL_TIMEOUT} from "../../constants";

import "./ButTextArea.less";
import {ButTextAreaProps, ButTextAreaInitStat} from "./types";
import {ButCoreTextArea} from "./ButCoreTextArea";


// 基本是简化版的SemiDesign的TextArea上多加一个按钮和快捷键
export function ButTextArea(props: ButTextAreaProps) {
    let [stat, setRawStat] = useState(ButTextAreaInitStat)
    let eleCoreRef = useRef(null)

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
                    // 选择保守，如果无法追踪到当前元素则不填充
                    if(!eleCoreRef.current){
                        return
                    }
                    const curEleCore = eleCoreRef.current as HTMLTextAreaElement
                    if (curEleCore.value !== val.prepend) {
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
                <ButCoreTextArea ref={eleCoreRef}
                                 setSuperStat={setStat}
                                 superStat={stat}
                                 superProps={props}></ButCoreTextArea>
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
                                    props.onCtrlEnter(stat.textValue, null)
                                }
                                event.stopPropagation();
                            }}> 查询 </Button>
                </div>
            </div>
        </div>
    )
}