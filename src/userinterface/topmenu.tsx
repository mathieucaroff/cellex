import { Button, Popover, Space } from "antd"
import { DisplayInterface } from "./menu/displayinterface"
import { EngineInterface } from "./menu/engineinterface"
import { HelpContent } from "./menu/help"
import { PaletteInterface } from "./menu/palette"
import { TopologyInterface } from "./menu/topology"

export interface TopMenuProp {
    helpList: [string, string][]
}

export let TopMenu = (prop: TopMenuProp) => {
    let { helpList } = prop
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
