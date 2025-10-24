import { useState, useRef, useEffect } from "react";
import ColorPicker from "./components/ColorPicker";
import type { RGBA } from "./components/ColorPicker";

export function usePopupColorPicker() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [color, setColor] = useState<RGBA | null>(null);
  const callbackRef = useRef<((c: RGBA) => void) | undefined>(undefined);

  const open = (
    initColor: RGBA,
    x: number,
    y: number,
    onChange: (c: RGBA) => void,
  ) => {
    setColor(initColor);
    setPosition({ x, y });
    setVisible(true);
    callbackRef.current = onChange;
  };

  useEffect(() => {
    if (!visible) return;
    const handle = () => {
      setVisible(false);
    };
    window.addEventListener("mousedown", handle);
    return () => {
      window.removeEventListener("mousedown", handle);
    };
  }, [visible]);

  const close = () => setVisible(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const Popup =
    visible && color ? (
      <div
        ref={popupRef}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y + 20,
          zIndex: 9999,
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: 12,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ColorPicker
          value={color}
          onChange={(c) => {
            setColor(c);
            callbackRef.current?.(c);
          }}
        />
      </div>
    ) : null;

  return { open, close, Popup };
}
