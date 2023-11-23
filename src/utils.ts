import {
    BaseItemType,
    DEFAULT_BACKGROUND_AUTUMN,
    DEFAULT_BACKGROUND_SPRING,
    DEFAULT_BACKGROUND_SUMMER,
    DEFAULT_BACKGROUND_WINTER
} from "./constants";

export function hashCode(s: string){
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

export function cmpItemsLRU<ItemType extends BaseItemType>(a: ItemType, b: ItemType){
    if (!a.lruCount) {
        a.lruCount = 0;
    }
    if (!b.lruCount) {
        b.lruCount = 0;
    }
    return (a.lruCount > b.lruCount) ? -1 : 1;
}

export type FetchSuggestedResp = {
    prepend: string,
    append: string
}
export async function fetchSuggestedAppend(text: string) {
    return new Promise((resolve) => {
        fetch(`https://www.bingapis.com/api/v7/suggestions?appid=B1513F135D0D1D1FC36E8C31C30A31BB25E804D0&setmkt=en-US&q=${text}`).then(
            (response: Response,) => {
                response.json().then(
                    (value: {suggestionGroups: Array<{searchSuggestions: Array<{ghostText: string}>}>}) => {
                        let resp : FetchSuggestedResp = {prepend: text, append: ""}
                        if(value.suggestionGroups.length === 0){
                            resolve(resp);
                            return;
                        }

                        const suggestions = value.suggestionGroups[0].searchSuggestions
                        if(suggestions.length === 0){
                            resolve(resp);
                            return;
                        }

                        const suggestedText = suggestions[0].ghostText
                        if(!suggestedText){
                            return
                        }

                        resp.append = suggestedText.slice(text.length)
                        resolve(resp)
                    })
            },
            () => {
                resolve({prepend: text, append: ""});
            }
        )
    })

}

export function cmpItemsLRUWithTop<ItemType extends BaseItemType>(a: ItemType, b: ItemType){
    // 都不存在这个属性 (这种写法一看就是写js的)
    if(!a.isOnTop && !b.isOnTop){
        return cmpItemsLRU(a, b);
    }
    // 这个属性都为真
    if(a.isOnTop && b.isOnTop){
        return cmpItemsLRU(a, b);
    }

    if(a.isOnTop){
        return -1;
    }
    return 1;
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
