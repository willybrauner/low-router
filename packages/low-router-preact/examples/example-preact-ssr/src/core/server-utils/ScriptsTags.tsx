type TScript = { tag: string; attr: { [x: string]: string } }

/**
 * Render single script
 * @param tag
 * @param attr
 * @constructor
 */
export const ScriptTag = ({ tag, attr }: TScript) => {
  const T = tag as any
  // @ts-ignore
  if (attr.noModule === "") return <T {...attr} noModule />
  else return <T {...attr} />
}

/**
 * Render list of scripts
 * @param scripts
 * @constructor
 */
export const ScriptsTags = ({ scripts }: { scripts: TScript[] }) => (
  <>{scripts?.map((script, i) => <ScriptTag key={i} {...script} />)}</>
)
