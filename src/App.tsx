// import "./styles.css";
import React, { useRef } from "react";
import Konva from "konva";
import { Stage, Layer, Group } from "react-konva";
import { HtmlElement } from "./HtmlElement";
import ReactDOM from "react-dom/client";
import Quill from "quill/dist/quill";

export default function App() {
  const [div] = React.useState(() => document.createElement("div"));
  const root = React.useMemo(() => ReactDOM.createRoot(div), [div]);

  const [clickedOnce, setClickedOnce] = React.useState(false);
  // const quillContainerRef = useRef(null);

  React.useEffect(() => {
    const quillContainer = document.querySelector(".quill-container");
    if (!quillContainer) return;
    if (!clickedOnce) return;

    const quill = new Quill(quillContainer, {
      toolbar: false,
      modules: { toolbar: false },
    });
    quill.setText("Header text");
    const length = quill.getLength();
    quill.setSelection(0, length - 1); // Select entire text
    quill.focus();
    // quillRef.current.root.focus();
    // quillRef.current.root.tabIndex = -1;
  }, [clickedOnce]);

  const addText = () => {
    setClickedOnce(!clickedOnce);
  };

  return (
    <div>
      <button onClick={addText}>Add Text</button>
      <div
        ref={(ref) => {
          window.quillContainer = ref;
        }}
        className="quill-container"
        style={{
          width: "300px",
          height: "150px",
          border: "1px solid #ccc",
        }}
      ></div>
      <div className="top">
        <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            <Group>
              <HtmlElement clickedOnce={clickedOnce} root={root} div={div} />
            </Group>
          </Layer>
        </Stage>
      </div>
      <div className="quill-container"></div>
    </div>
  );
}
