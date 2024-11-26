import { UserInterfaceProp } from "./UserInterface"
import { DivGraft } from "./graft"

export function UserInterfaceImmersive(prop: UserInterfaceProp) {
  return <DivGraft element={prop.displayDiv} />
}
