import { Button, Popover, Space } from "antd"
import { ConfigurationContent } from "./configuration"
import { HelpContent } from "./help"
import { PaletteContent } from "./palette"
import { BorderContent } from "./pattern"

export interface TopMenuProp {
    helpList: [string, string][]
}

export let TopMenu = (prop: TopMenuProp) => {
    let { helpList } = prop
    return (
        <Space>
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
                title="Border"
                content={<BorderContent />}
                trigger="click"
            >
                <Button>Border</Button>
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
