import markup from './harbor.svg' with {type:'text'};

const harborUrl='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup);

/** The approved cover is packaged in the view so it is available before a game is bound. */
export function Harbor({label}:{label?:string}){
  return <span className="play-art">
    <img src={harborUrl} alt="" draggable={false}/>
    {label&&<span className="play-edition">{label}</span>}
  </span>;
}
