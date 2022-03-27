import { DiffOutlined } from "@ant-design/icons"
import { Button, Popover, Space } from "antd"
import { Act } from "../engine/act"
import { DiffMode } from "../type"
import { DisplayInterface } from "./menu/displayinterface"
import { EngineInterface } from "./menu/engineinterface"
import { HelpContent } from "./menu/help"
import { PaletteInterface } from "./menu/palette"
import { TopologyInterface } from "./menu/topology"

export interface TopMenuProp {
    diffMode: DiffMode
    helpList: [string, string][]
    act: Act
}

export let TopMenu = (prop: TopMenuProp) => {
    let { helpList, act, diffMode } = prop

    return (
        <Space>
            <Popover
                placement="bottomLeft"
                title="Display"
                content={<DisplayInterface />}
                trigger="click"
            >
                <Button>Display</Button>
            </Popover>
            <Popover
                placement="bottomLeft"
                title="Topology"
                content={<TopologyInterface />}
                trigger="click"
            >
                <Button>Topology</Button>
            </Popover>
            <Popover
                placement="bottomLeft"
                title="Engine"
                content={<EngineInterface />}
                trigger="click"
            >
                <Button>Engine</Button>
            </Popover>
            <Popover
                placement="bottomLeft"
                title="Palette"
                content={<PaletteInterface />}
                trigger="click"
            >
                <Button>Palette</Button>
            </Popover>
            <Button
                type={diffMode !== "off" ? "primary" : "default"}
                title={"Toggle the Differential Mode " + (diffMode !== "off" ? "off" : "on")}
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
        </Space>
    )
}
