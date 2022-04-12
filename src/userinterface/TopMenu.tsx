import { DiffOutlined } from "@ant-design/icons"
import { Button, Popover, Space } from "antd"
import { Act } from "../control/Act"
import { DiffMode } from "../type"
import { DisplayUI } from "./menu/DisplayUI"
import { HelpContent } from "./menu/HelpContent"
import { PaletteUI } from "./menu/PaletteUI"
import { EngineUI } from "./menu/EngineUI"

export interface TopMenuProp {
    diffMode: DiffMode
    helpList: [string, string][]
    act: Act
}

export let TopMenu = (prop: TopMenuProp) => {
    let { helpList, act, diffMode } = prop

    return (
        <div className="topMenu">
            <Popover placement="bottomLeft" title="Display" content={<DisplayUI />} trigger="click">
                <Button>
                    <i className="fa fa-television" />
                    Display
                </Button>
            </Popover>
            <Popover placement="bottomLeft" content={<EngineUI />} trigger="click">
                <Button>
                    <i className="fa fa-circle-o" />
                    Engine
                </Button>
            </Popover>
            <Popover placement="bottomLeft" title="Palette" content={<PaletteUI />} trigger="click">
                <Button>
                    <i>🎨</i>Palette
                </Button>
            </Popover>
            <Button
                type={diffMode.status !== "off" ? "primary" : "default"}
                title={"Toggle the Differential Mode " + (diffMode.status !== "off" ? "off" : "on")}
                icon={<DiffOutlined />}
                onClick={() => act.toggleDifferentialMode()}
            />
            <Popover
                placement="bottomLeft"
                title="Help"
                content={<HelpContent helpList={helpList} />}
                trigger="click"
            >
                <Button>?</Button>
            </Popover>
        </div>
    )
}
