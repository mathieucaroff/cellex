import { DiffOutlined, PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, PageHeader, Popover, Space, Switch } from "antd"
import { Act } from "../engine/act"
import { ruleName } from "../engine/rule"
import { Context } from "../state/context"
import { ReactContext } from "../state/reactcontext"
import { DivGraft } from "./graft"
import { RuleEditor } from "./editor/ruleeditor"
import { RuleInput } from "./ruleinput"
import { TopMenu } from "./topmenu"
import { getRuleInformation, RuleInfo } from "./ruleabout"

const { Panel } = Collapse
interface UserInterfaceProp {
    act: Act
    context: Context
    helpList: [string, string][]
    displayDiv: HTMLDivElement
}

export let UserInterface = (prop: UserInterfaceProp) => {
    let { act, context, helpList, displayDiv } = prop
    let { rule, diffMode } = context.getState()
    return (
        <ReactContext.Provider value={{ act, context }}>
            <PageHeader
                className="site-page-header"
                onBack={() => {
                    location.assign(".")
                }}
                title="Cellex"
                subTitle="Monodimensional Cellular Automaton Explorer"
            />
            <Space direction="vertical">
                <Space>
                    <Button
                        type="primary"
                        title="play"
                        size="large"
                        icon={
                            context.getState().play ? (
                                <PauseCircleOutlined />
                            ) : (
                                <PlayCircleOutlined />
                            )
                        }
                        onClick={() => {
                            act.togglePlay()
                            displayDiv.focus()
                        }}
                    />
                    <RuleInput />
                    <Button
                        type={diffMode !== "off" ? "primary" : "default"}
                        title={"Toggle the Differential Mode" + (diffMode !== "off" ? "off" : "on")}
                        icon={<DiffOutlined />}
                        onClick={() => {
                            act.toggleDifferentialMode()
                        }}
                    />

                    <TopMenu helpList={helpList} />
                </Space>

                {/* /\ -------------------- /\ */}
                {/* || DISPLAY ELEMENT HERE || */}
                <DivGraft element={displayDiv} />
                {/* || DISPLAY ELEMENT HERE || */}
                {/* \/ -------------------- \/ */}
            </Space>

            <Collapse accordion>
                <Panel className="ruleEditor" header={`Rule Editor (${ruleName(rule)})`} key={1}>
                    <RuleEditor />
                </Panel>
                <Panel
                    collapsible={getRuleInformation(rule) ? "header" : "disabled"}
                    className="ruleInfo"
                    header={`About this rule`}
                    key={2}
                >
                    <RuleInfo />
                </Panel>
            </Collapse>
        </ReactContext.Provider>
    )
}
