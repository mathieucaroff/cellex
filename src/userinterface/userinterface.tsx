import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, PageHeader, Popover } from "antd"

import { Act } from "../control/act"
import { nAryRule, parseRule, ruleName } from "../engine/rule"
import { Context } from "../state/context"
import { ReactContext } from "../state/reactcontext"
import { OxEnterInput } from "./component"
import { ConfigurationContent } from "./configuration"
import { HelpContent } from "./help"
import { PatternContent } from "./pattern"
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

            <Button
                type="primary"
                title="play"
                icon={<PlayCircleOutlined />}
                disabled={context.getState().play}
                onClick={act.setPlay}
            />
            <Button
                type="primary"
                title="pause"
                icon={<PauseCircleOutlined />}
                disabled={!context.getState().play}
                onClick={act.setPause}
            />
            <OxEnterInput
                path="rule"
                style={{ width: "initial" }}
                title="set rule"
                present={ruleName}
                parse={parseRule}
                randomiser={nAryRule}
            />
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
                title="Pattern"
                content={<PatternContent />}
                trigger="click"
            >
                <Button>Pattern</Button>
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
