import "./config";
import "./decorate";
import { COMMANDS } from "./cmds";
import useCurrentUser from "./hooks/use-current-user";
import useConfig from "./hooks/use-config";
import Loading from "./loading";
import { useState } from "react";

export default function Root() {
  const currentUser = useCurrentUser();
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);

  const renderCommand = (d) => {
    return (
      <li key={d.LABEL}>
        <button onClick={() => clickHandler(d)}>{d.LABEL}</button>
      </li>
    );
  };

  async function clickHandler(d) {
    setIsLoading(true);
    await d.CMD();
    setIsLoading(false);
  }

  return (
    <div>
      <div>
        <ul>{COMMANDS.map(renderCommand)}</ul>
        <pre>{JSON.stringify({ currentUser, config }, null, 2)}</pre>
      </div>
      {isLoading ? <Loading/> : null}
    </div>
  );
}
