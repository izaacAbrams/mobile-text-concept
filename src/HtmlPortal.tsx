import Konva from "konva";
import React, { HTMLAttributes, PropsWithChildren } from "react";
import ReactDOM from "react-dom/client";
import { Group } from "react-konva";

const needForceStyle = (el: HTMLDivElement) => {
  const pos = window.getComputedStyle(el).position;
  const ok = pos === "absolute" || pos === "relative";
  return !ok;
};

export type HtmlTransformAttrs = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
};

export type HtmlProps = PropsWithChildren<{
  groupProps?: Konva.ContainerConfig;
  divProps?: HTMLAttributes<HTMLDivElement>;
  transform?: boolean;
  root: any;
  div: any;
  transformFunc?: (attrs: HtmlTransformAttrs) => HtmlTransformAttrs;
}>;

export function useEvent(fn = () => {}) {
  const ref = React.useRef(fn);
  ref.current = fn;
  return React.useCallback((...args) => {
    return ref.current.apply(null, args);
  }, []);
}

export const HtmlPortal = ({
  children,
  div,
  groupProps,
  divProps,
  transform,
  transformFunc,
  root,
}: HtmlProps) => {
  const groupRef = React.useRef<Konva.Group>(null);
  const childRef = React.useRef<HTMLElement | null>(null); // Added to hold a reference to the child element.

  // const [div] = React.useState(() => document.createElement("div"));
  // const root = React.useMemo(() => ReactDOM.createRoot(div), [div]);

  const shouldTransform = transform ?? true;

  const handleTransform = useEvent(() => {
    if (shouldTransform && groupRef.current) {
      const tr = groupRef.current.getAbsoluteTransform();
      let attrs = tr.decompose();
      if (transformFunc) {
        attrs = transformFunc(attrs);
      }
      div.style.position = "absolute";
      div.style.zIndex = "10";
      div.style.top = "0px";
      div.style.left = "0px";
      div.style.transform = `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`;
      div.style.transformOrigin = "top left";
    } else {
      div.style.position = "";
      div.style.zIndex = "";
      div.style.top = "";
      div.style.left = "";
      div.style.transform = ``;
      div.style.transformOrigin = "";
    }
    const { style, ...restProps } = divProps || {};
    // apply deep nesting, because direct assign of "divProps" will overwrite styles above
    Object.assign(div.style, style);
    Object.assign(div, restProps);
  });

  React.useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const parent = group.getStage()?.container();
    if (!parent) {
      return;
    }
    parent.appendChild(div);

    if (shouldTransform && needForceStyle(parent)) {
      parent.style.position = "relative";
    }

    group.on("absoluteTransformChange", handleTransform);
    handleTransform();

    if (childRef.current) {
      childRef.current.focus(); // Focus the single child.
    }
    return () => {
      group.off("absoluteTransformChange", handleTransform);
      div.parentNode?.removeChild(div);
    };
  }, [shouldTransform]);

  React.useLayoutEffect(() => {
    handleTransform();
  }, [divProps, transformFunc]);

  // Render children into the div using React.createPortal
  React.useLayoutEffect(() => {
    root.render(
      React.isValidElement(children)
        ? React.cloneElement(children, {
            ref: (el: HTMLElement) => {
              childRef.current = el;
              if (typeof children.ref === "function") {
                children.ref(el);
              } else if (children.ref) {
                (
                  children.ref as React.MutableRefObject<HTMLElement | null>
                ).current = el;
              }
            },
          })
        : children
    );
  }, [children]);

  React.useLayoutEffect(() => {
    return () => {
      // I am not really sure why do we need timeout here
      // but it resolve warnings from react
      // ref: https://github.com/konvajs/react-konva-utils/issues/26
      setTimeout(() => {
        root.unmount();
      });
    };
  }, []);

  return <Group ref={groupRef} {...groupProps} />;
};
