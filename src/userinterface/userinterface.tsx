import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, PageHeader, Popover } from "antd"

import { Act } from "../control/act"
import { nAryRule, parseRule, ruleName } from "../engine/rule"
import { Context } from "../state/context"
import { ReactContext } from "../state/reactcontext"
import { OxEnterInput } from "./component"
import { DivGraft } from "./components/graft"
import { ConfigurationContent } from "./configuration"
import { HelpContent } from "./help"
import { BorderContent } from "./pattern"
import { RuleContent } from "./rulecontent"
import { PaletteContent } from "./palette"

const { Panel } = Collapse
interface UserInterfaceProp {
    act: Act
    context: Context
    helpList: [string, string][]
    displayDiv: HTMLDivElement
}

export let UserInterface = (prop: UserInterfaceProp) => {
    let { act, context, helpList, displayDiv } = prop
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

            {/* /\ DISPLAY ELEMENT HERE /\ */}
            <DivGraft element={displayDiv} />
            {/* \/ DISPLAY ELEMENT HERE \/ */}

            <Collapse>
                <Panel header="Rule Editor" key={1}>
                    <RuleContent />
                </Panel>
            </Collapse>
        </ReactContext.Provider>
    )
}
