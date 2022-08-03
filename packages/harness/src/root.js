import "./config"
import "./decorate"
import {COMMANDS} from "./cmds"
import useCurrentUser from "./hooks/use-current-user"
import useConfig from "./hooks/use-config"
import React, { useEffect, useState } from "react"
import * as fcl from "@onflow/fcl"
import styled from "styled-components"

const renderCommand = d => {
  return (
    <li key={d.LABEL}>
      <button onClick={d.CMD}>{d.LABEL}</button>
    </li>
  )
}

const StyledWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  color: #ababab;
  background-color: #232323;
  position: relative;
  box-sizing: border-box;
  padding: 0.5rem;
  border: 0.5rem solid #ababab; 
  font-family: "MonoLisa","JetBrains Mono","Fira Code","monospace";

  h3 {
    color: white;
  }
`

const StyledInputWrapper = styled.div`
  input {
    width: calc(100% - 1rem);
    padding: 0.5rem;
    font-size: 1rem;
    margin: 0;
  }
`

const ArgumentWrapper = styled.div`
  h4 {
    margin-bottom: 0.5rem;
  }

  input {
    width: calc(25% - 1rem);
  }
`

const Button = styled.button`
  -webkit-appearance: none;
  color: #232323;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: none;
  width: 10rem;
`

const useTemplate = ({ templateURL }) => {
  const [ template, setTemplate ] = useState(null)
  const [ inputs, setInputs ] = useState([])

  useEffect(() => {
    async function getTemplate() {
      let _template = await fetch(templateURL)
        .then(res => res.ok ? res.json() : null)
        .catch(e => null)
        
      setTemplate(_template)
    }
    getTemplate()
  }, [templateURL])

  return { 
    template,
    inputs
  }
}

export default function Root() {
  const currentUser = useCurrentUser()
  const config = useConfig()
  const [templateURLInput, setTemplateURLInput] = useState("URL to an Interaction Template.")
  const { template } = useTemplate({
     templateURL: templateURLInput
  })

  fcl.config().get('logger.level').then(l => console.log("extension logger.level: ", l))

  console.log("template from hook", template)

  // return "hello"

  return (
    <StyledWrapper>
      {/* <ul>{COMMANDS.map(renderCommand)}</ul> */}
      <h1>Interaction Template Demo</h1>
      <hr />
        <StyledInputWrapper> 
          <input
            defaultValue={templateURLInput}
            onChange={e => setTemplateURLInput(e.target.value)}
          />
        </StyledInputWrapper> 

        {template === null && <h3>No Template Found</h3>}
        {template !== null && <h3>Title: {template?.data?.messages?.title?.i18n?.["en-US"]}</h3>}
        {template !== null && <h3>Description: {template?.data?.messages?.description?.i18n?.["en-US"]}</h3>}
        
        { template &&
          template?.data?.arguments 
          && Object.keys(template?.data?.arguments).length > 0 
          && Object.keys(template?.data?.arguments).map((argKey) => {
            let arg = template?.data?.arguments[argKey]
            return <ArgumentWrapper>
              <h4>{arg?.messages?.title?.i18n?.["en-US"]}</h4>
              <input id={argKey}/>
            </ArgumentWrapper>
          })
        }
        <br />
        {
          template &&
          <Button
            onClick={async () => {
              let args = template?.data?.arguments && Object.keys(template?.data?.arguments).length > 0 ?
                Object.keys(template?.data?.arguments).map(argKey => {
                  let arg = template?.data?.arguments[argKey]
                  let argVal = document.getElementById(argKey)?.value
                  if (argVal) {
                    return fcl.arg(argVal, fcl.t[arg.type])
                  }
                  return null
                }).filter(val => val !== null)
                : 
                []

              console.log("args", args)

              await fcl.mutate({
                template,
                args: (arg, t) => args, 
                limit: 9999
              })
            }}
          >
            Submit  
          </Button>
        }

      <hr />
      {/* <pre>{JSON.stringify({currentUser, config}, null, 2)}</pre> */}
    </StyledWrapper>
  )
}
