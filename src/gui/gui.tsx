import { Button, Divider, PageHeader, Popover } from "antd"

import { Act } from "../control/act"
import { Context } from "../state/context"
import { ReactContext } from "../state/reactcontext"
import { ConfigurationContent } from "./configuration"
import { HelpContent } from "./help"
import { ThemeContent } from "./theme"

interface ConfigurationPopoverButtonProp {
    act: Act
    context: Context
    helpList: [string, string][]
}

export let ConfigurationPopoverButton = (prop: ConfigurationPopoverButtonProp) => {
    let { act, context, helpList } = prop
    return (
        <ReactContext.Provider value={{ act, context }}>
            <PageHeader
                className="site-page-header"
                title="Cellex"
                subTitle="Monodimensional Cellular Automaton Explorer"
            />
            ,
            <Divider type="vertical" />
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
                title="Theme"
                content={<ThemeContent />}
                trigger="click"
            >
                <Button>Theme</Button>
            </Popover>
            <Popover
                placement="bottomLeft"
                title="Help"
                content={<HelpContent helpList={helpList} />}
                trigger="click"
            >
                <Button>?</Button>
            </Popover>
        </ReactContext.Provider>
    )
}
