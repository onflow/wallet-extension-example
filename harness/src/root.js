import "./config"
import "./decorate"
import {COMMANDS} from "./cmds"
import useCurrentUser from "./hooks/use-current-user"
import useConfig from "./hooks/use-config"

const renderCommand = d => {
  return (
    <li key={d.LABEL}>
      <button onClick={d.CMD}>{d.LABEL}</button>
    </li>
  )
}

export default function Root() {
  const currentUser = useCurrentUser()
  const config = useConfig()

  return (
    <div>
      <ul>{COMMANDS.map(renderCommand)}</ul>
      <pre>{JSON.stringify({currentUser, config}, null, 2)}</pre>
    </div>
  )
}
