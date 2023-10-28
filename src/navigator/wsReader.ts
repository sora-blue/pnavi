import axios from "redaxios";
import {hashCode} from "../utils";

/*
* 封装工具箱和搜索窗口对 localStorage 的访问
* */

export class WindowSearchReader<ItemType extends {title: string, lruCount?: number}> {
    propsMap = new Map<string, ItemType>()
    nameList: string;
    nameListItem: string;
    nameDefaultConfigLocation: string;

    constructor(nameList: string, nameListItem: string, nameDefaultConfigLocation: string) {
        this.nameList = nameList
        this.nameListItem = nameListItem
        this.nameDefaultConfigLocation = nameDefaultConfigLocation
    }

    getNamedItem(itemTitle: string){
        const code = hashCode(itemTitle)
        return this.nameListItem + (code > 0 ? code : -code)
    }

    // 如果不存在配置项，获取默认配置
    async read(){
        let tmpList = window.localStorage.getItem(this.nameList)
        if (!tmpList) {
            await axios.get(this.nameDefaultConfigLocation).then(
                (result) => {
                    let props = result.data as ItemType[]
                    props.forEach((prop) => {
                        let tmpListItemEntry = this.getNamedItem(prop.title)
                        prop.lruCount = 0

                        window.localStorage.setItem(tmpListItemEntry, JSON.stringify(prop))
                        this.propsMap.set(prop.title, prop)
                    })
                    window.localStorage.setItem(this.nameList, JSON.stringify([...this.propsMap.keys()]))
                    return [...this.propsMap.values()]
                }
            ).then((result: any) => {
                console.log("wsReader: fetch default config success")
            }, (reason: any) => {
                console.log(`wsReader: fail fetching default config`)
                console.log(reason)
            })
        }
        if(!tmpList){
            return [...this.propsMap.values()]
        }
        let searchList = JSON.parse(tmpList)
        for(let title of searchList){
            let tmpListItem = window.localStorage.getItem(this.getNamedItem(title))
            if(!tmpListItem){continue}
            let item = JSON.parse(tmpListItem) as ItemType
            this.propsMap.set(title, item)
        }
        return [...this.propsMap.values()]
    }

    // update lru_count
    updateItem(value: ItemType){
        let itemValueRef = this.propsMap.get(value.title)
        if(!itemValueRef){
            console.warn(`${value.title} is not in the list.`)
            return [...this.propsMap.values()]
        }
        window.localStorage.setItem(this.getNamedItem(value.title), JSON.stringify(value))
        // I know it is meaningless, just for practice
        for(let property in value){
            let tmp = Object.getOwnPropertyDescriptor(value, property)
            Object.defineProperty(itemValueRef, property,  tmp || "")
        }
        return [...this.propsMap.values()]
    }

    // add item
    addItem(value: ItemType){
        if(this.propsMap.get(value.title)){
            console.warn(`${value.title} is already in the list.`)
            return [...this.propsMap.values()]
        }
        this.propsMap.set(value.title, value)
        window.localStorage.setItem(this.getNamedItem(value.title), JSON.stringify(value))
        window.localStorage.setItem(this.nameList, JSON.stringify([...this.propsMap.keys()]))
        return [...this.propsMap.values()]
    }

    // remove item
    removeItem(value: ItemType){
        if(!this.propsMap.get(value.title)){
            console.warn(`${value.title} is not in list.`)
            return [...this.propsMap.values()]
        }
        this.propsMap.delete(value.title)
        window.localStorage.removeItem(this.getNamedItem(value.title))
        window.localStorage.setItem(this.nameList, JSON.stringify([...this.propsMap.keys()]))
        return [...this.propsMap.values()]
    }
}