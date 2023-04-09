import {WindowSearch} from "./naviSearchWindow";
// the order of loading the stylesheet last matters
import "./navigator.less"
import {DEFAULT_BACKGROUND} from "../constants"
import WindowToolbox from "./naviToolbox";
/*
* 封装好的组件
* */

function Navigator() {
    return (
        <div style={{
            background: DEFAULT_BACKGROUND,
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