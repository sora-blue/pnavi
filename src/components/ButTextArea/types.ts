import React from "react";

export type ButTextAreaProps = {
    maxCount?: number, // number 和 Number 之分闹麻了，出来一个类型声明 Number | 0
    onCtrlEnter?: (val: any, evt: React.KeyboardEvent | null) => any,
    enableAutofill?: boolean,
    autofillTimeout?: number,
}

export const ButTextAreaInitStat = {
    textValue: "",
    appendText: "",
    previousText: "",
}

export type ButCoreTextAreaProps = {
    superProps: ButTextAreaProps,
    superStat: typeof ButTextAreaInitStat,
    setSuperStat: (stat: any) => any,
}
