import { Button, Popover, Space } from "antd"
import { ConfigurationContent } from "./configuration"
import { HelpContent } from "./help"
import { PaletteContent } from "./palette"
import { TopologyContent } from "./topology"

export interface TopMenuProp {
    helpList: [string, string][]
}

export let TopMenu = (prop: TopMenuProp) => {
    let { helpList } = prop
    return (
        <Space>
            <Popover
                placement="bottomLeft"
                title="Topology"
                content={<TopologyContent />}
                trigger="click"
            >
                <Button>Topology</Button>
            </Popover>
            <Popover
                placement="bottomLeft"
                title="Configuration"
                content={<ConfigurationContent />}
                trigger="click"
            >
                <Button>Configuration</Button>
            </Popover>
            <Popover
                placement="bottomLeft"
                title="Palette"
                content={<PaletteContent />}
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
