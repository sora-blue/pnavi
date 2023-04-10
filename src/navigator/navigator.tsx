import {WindowSearch} from "./naviSearchWindow";
// the order of loading the stylesheet last matters
import "./navigator.less"
import {LOCAL_STORAGE_BACKGROUND_SRC} from "../constants"
import WindowToolbox from "./naviToolbox";
import {switchBgByMonth} from "../utils";
/*
* 封装好的组件
* */

function Navigator() {
    return (
        <div style={{
            background: localStorage.getItem(LOCAL_STORAGE_BACKGROUND_SRC) || switchBgByMonth(),
            backgroundSize: "cover",
        }}>
            <div className={"navigator-container"}>
                <WindowSearch/>
            </div>
            <WindowToolbox/>
        </div>
    )
}

export default Navigator;