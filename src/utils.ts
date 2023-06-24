import {
    DEFAULT_BACKGROUND_AUTUMN,
    DEFAULT_BACKGROUND_SPRING,
    DEFAULT_BACKGROUND_SUMMER,
    DEFAULT_BACKGROUND_WINTER
} from "./constants";

export function hashCode(s: string){
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

export function cmpItemsLRU(a: any, b: any){
    if (!a.lruCount) {
        a.lruCount = 0;
    }
    if (!b.lruCount) {
        b.lruCount = 0;
    }
    return (a.lruCount > b.lruCount) ? -1 : 1;
}

export function switchBgByMonth(){
    let curTime = new Date(Date.now())
    let curMonth = curTime.getMonth() + 1
    if(curMonth >= 3 && curMonth <= 5)
        return DEFAULT_BACKGROUND_SPRING
    if(curMonth >= 6 && curMonth <= 8)
        return DEFAULT_BACKGROUND_SUMMER
    if(curMonth >= 9 && curMonth <= 11)
        return DEFAULT_BACKGROUND_AUTUMN
    return DEFAULT_BACKGROUND_WINTER
}

export function isSrcLink(src: string){
    const prefixes = ["http://", "https://", "/"]
    for(let i = 0 ; i < prefixes.length ; i++) {
        if (src.startsWith(prefixes[i])) {
            return true
        }
    }
    return false
}

export function clickConfirmModal(idName: string){
    const butOK = document.querySelector(`#${idName}`) as HTMLButtonElement
    if(!butOK) return
    butOK.click()
}

export function url2iconUrl(url: string){
    url = url.trim()
    if(url.startsWith('/'))
        return '/favicon.ico'
    let arr = url.split('/')
    let iconUrl = ""
    for(let i = 0 ; i < 3 && i < arr.length ; i++){
        iconUrl += arr[i] + '/';
    }
    iconUrl += "favicon.ico"
    return iconUrl
}

export function wrapUrl(url: string) {
    return `url("${url}") no-repeat center/80%`
}
