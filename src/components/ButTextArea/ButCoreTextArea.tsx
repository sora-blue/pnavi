import React, {forwardRef} from "react";
import {ButCoreTextAreaProps} from "./types";

// todo: 学习forwardRef和useRef的原理
// 我是菜鸟，需要不依赖类名索引dom元素，跟着warning学到了官方正确写法
// https://react.dev/reference/react-dom/findDOMNode#alternatives
export const ButCoreTextArea = forwardRef(function ButCoreTextArea(coreProps: ButCoreTextAreaProps, ref: any){
    const stat = coreProps.superStat
    const props = coreProps.superProps
    const setStat = coreProps.setSuperStat
    const maxCount = !!coreProps.superProps.maxCount ? coreProps.superProps.maxCount : 0;
    return (<textarea
                      ref={ref}
                      rows={4} cols={20}
                      className="semi-input-textarea semi-input-textarea-autosize"
                      style={{height: "90px"}}
                      placeholder={"Ctrl+Enter发送查询，Ctrl+Shift+Z补全"}
                      onKeyUp={(evt: React.KeyboardEvent) => {
                          // Ctrl+Enter
                          if (evt.ctrlKey && evt.key == "Enter") {
                              const text = stat.textValue
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
                </textarea>)
})