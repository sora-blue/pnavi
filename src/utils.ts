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