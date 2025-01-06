import React, { useRef, useEffect } from "react";
import { Group } from "react-konva";
// import { Html } from "react-konva-utils";
import Quill from "quill/dist/quill";
import { HtmlPortal } from "./HtmlPortal";

export const HtmlElement = ({
  clickedOnce,
  root,
  div,
}: {
  clickedOnce: boolean;
}) => {
  const quillRef = useRef(null);
  const quillContainerRef = useRef(null);

  useEffect(() => {
    if (!quillContainerRef.current) return;
    if (!clickedOnce) return;

    quillRef.current = new Quill(quillContainerRef.current, {
      toolbar: false,
      modules: { toolbar: false },
    });
    quillRef.current.setText("Header text");
    const length = quillRef.current.getLength();
    quillRef.current.setSelection(0, length - 1); // Select entire text
    quillRef.current.focus();
    // quillRef.current.root.focus();
    // quillRef.current.root.tabIndex = -1;
  }, [clickedOnce]);

  if (!clickedOnce) return <Group></Group>;

  return (
    <Group>
      <HtmlPortal
        transform={false}
        root={root}
        div={div}
        divProps={{
          style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            // transform: "translate(-50%, -50%)",
            pointerEvents: "auto",
            // touchAction: "auto",
          },
        }}
      >
        <div
          ref={quillContainerRef}
          className="quill-container"
          style={{
            width: "300px",
            height: "150px",
          }}
        ></div>
      </HtmlPortal>
    </Group>
  );
};
