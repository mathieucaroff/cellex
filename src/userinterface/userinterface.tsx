import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, PageHeader, Space } from "antd"
import { Act } from "../control/act"
import { ruleName } from "../engine/rule"
import { Context } from "../state/context"
import { ReactContext } from "../state/reactcontext"
import { DivGraft } from "./graft"
import { RuleEditor } from "./editor/ruleeditor"
import { RuleInput } from "./ruleinput"
import { TopMenu } from "./topmenu"

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
            <Space direction="vertical">
                <Space>
                    <Button.Group>
                        <Button
                            type="primary"
                            title="play"
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
                    </Button.Group>
                    <RuleInput />
                    <TopMenu helpList={helpList} />
                </Space>

                {/* /\ -------------------- /\ */}
                {/* || DISPLAY ELEMENT HERE || */}
                <DivGraft element={displayDiv} />
                {/* || DISPLAY ELEMENT HERE || */}
                {/* \/ -------------------- \/ */}
            </Space>

            <Collapse>
                <Panel
                    className="ruleEditor"
                    header={`Rule Editor (${ruleName(context.getState().rule)})`}
                    key={1}
                >
                    <RuleEditor />
                </Panel>
            </Collapse>
        </ReactContext.Provider>
    )
}
