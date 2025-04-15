export default function EditorToolbar() {
  return (
    <div id="toolbar">
      <select className="ql-header" defaultValue="">
        <option value="1"></option>
        <option value="2"></option>
        <option value="3"></option>
        <option value=""></option>
      </select>
      <select className="ql-font"></select>
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <select className="ql-color"></select>
      <select className="ql-background"></select>
      <button className="ql-script" value="sub"></button>
      <button className="ql-script" value="super"></button>
      <select className="ql-align"></select>
      <button className="ql-image"></button>
      <button className="ql-code-block"></button>
      <button className="ql-clean"></button>
    </div>
  );
}
