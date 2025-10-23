import React, { useEffect, useRef, useState } from "react";
import { clamp, isFunction, mapValues, round } from "lodash";
import "./index.css";
import { hsv2rgb, rgb2hsv } from "./utils";

function useDrag(props?: {
  value?: { rx?: number; ry?: number };
  onChange?: (rx: number, ry: number) => void;
}) {
  const { value, onChange } = props || {};

  const ref = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState<{
    x: number;
    y: number;
    rx: number;
    ry: number;
  }>({
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
  });

  const valueRef = useRef<{
    rx?: number;
    ry?: number;
  } | null>(null);

  useEffect(() => {
    if (
      value?.rx === valueRef.current?.rx &&
      value?.ry === valueRef.current?.ry
    ) {
      return;
    }

    const parent = ref.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    const _rx = clamp(value?.rx || 0, 0, 1);
    const _ry = clamp(value?.ry || 0, 0, 1);

    setPos({
      x: rect.width * _rx,
      y: rect.height * _ry,
      rx: _rx,
      ry: _ry,
    });

    valueRef.current = value || null;
  }, [value]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    const move = (e: MouseEvent) => {
      const x = clamp(e.clientX - rect.left, 0, rect.width);
      const y = clamp(e.clientY - rect.top, 0, rect.height);
      const rx = x / rect.width;
      const ry = y / rect.height;

      // 如果有外部控制值，则不更新内部位置状态
      if (!valueRef.current) {
        setPos({ x, y, rx, ry });
      }
      onChangeRef.current?.(rx, ry);
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    parent.addEventListener("mousedown", (e: MouseEvent) => {
      move(e);

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    });

    return () => {
      parent.removeEventListener("mousedown", () => {});
    };
  }, []);

  return { ref, pos };
}

interface HSVA {
  h: number;
  s: number;
  v: number;
  a: number;
}

function Saturation(props: {
  hsva?: HSVA;
  setHsva: React.Dispatch<React.SetStateAction<HSVA>>;
}) {
  const { ref, pos } = useDrag({
    value: { rx: props.hsva?.s || 0, ry: 1 - (props.hsva?.v || 0) },
    onChange: (rx, ry) => {
      props.setHsva((prev: HSVA) => ({ ...prev, s: rx, v: 1 - ry }));
    },
  });

  const hue = (props.hsva?.h || 0) * 360;
  const { r, g, b } = hsv2rgb(
    props.hsva?.h || 0,
    props.hsva?.s || 0,
    props.hsva?.v || 0
  );

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: 200,
        height: 200,
        background: `linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%)), linear-gradient(to top, #000, transparent)`,
        backgroundBlendMode: "multiply",
        userSelect: "none",
        cursor: "crosshair",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: pos.x - 8,
          top: pos.y - 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "2px solid #fff",
          boxShadow: "0 0 2px #000",
          pointerEvents: "none",
          backgroundColor: `rgb(${r * 255}, ${g * 255}, ${b * 255})`,
        }}
      />
    </div>
  );
}

const height = 16; // 透明度条高度
const padding = 4; // 滑块超出条的部分
const bgAlpha = 0.5; // 棋盘格子透明度

function Hue(props: {
  hsva?: HSVA;
  setHsva: React.Dispatch<React.SetStateAction<HSVA>>;
}) {
  const { ref, pos } = useDrag({
    value: { rx: props.hsva?.h || 0 },
    onChange: (rx) => {
      props.setHsva((prev: HSVA) => ({ ...prev, h: rx }));
    },
  });

  const hue = (props.hsva?.h || 0) * 360;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: 200,
        height,
        userSelect: "none",
        cursor: "pointer",
        background:
          "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: pos.x - 6,
          width: 12,
          top: -padding,
          height: `calc(100% + ${padding * 2}px)`,
          borderRadius: "12.5%",
          border: "2px solid #fff",
          boxShadow: "0 0 2px #000",
          pointerEvents: "none",
          background: `hsl(${hue}, 100%, 50%)`,
        }}
      />
    </div>
  );
}

function Alpha(props: {
  hsva?: HSVA;
  setHsva: React.Dispatch<React.SetStateAction<HSVA>>;
}) {
  const { ref, pos } = useDrag({
    value: { rx: props.hsva?.a || 0 },
    onChange: (rx) => {
      props.setHsva((prev: HSVA) => ({ ...prev, a: rx }));
    },
  });

  const { r, g, b } = hsv2rgb(
    props.hsva?.h || 0,
    props.hsva?.s || 0,
    props.hsva?.v || 0
  );
  const a = props.hsva?.a || 0;
  const rgb = `${r * 255}, ${g * 255}, ${b * 255}`;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: 200,
        height,
        userSelect: "none",
        cursor: "pointer",
        backgroundImage: `linear-gradient(to right, rgba(${rgb}, 0), rgba(${rgb}, 1)), repeating-conic-gradient(rgba(0, 0, 0, ${bgAlpha}) 0 25%, transparent 0 50%), linear-gradient(to right, rgba(255, 255, 255, ${bgAlpha}))`,
        backgroundSize: `100% 100%, ${height}px ${height}px, 100% 100%`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: pos.x - 6,
          width: 12,
          top: -padding,
          height: `calc(100% + ${padding * 2}px)`,
          borderRadius: "12.5%",
          border: "2px solid #fff",
          boxShadow: "0 0 2px #000",
          pointerEvents: "none",
          background: `rgba(${rgb}, ${a})`,
        }}
      />
    </div>
  );
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// 内部 hsva 归一化到 0-1 之间
export default function ColorPicker(props: {
  value: RGBA;
  onChange: (value: RGBA) => void;
}) {
  const { value, onChange } = props;

  const hsva = {
    ...rgb2hsv(value.r / 255, value.g / 255, value.b / 255),
    a: value.a,
  };

  const setHsva = (updater: React.SetStateAction<HSVA>) => {
    const next = isFunction(updater) ? updater(hsva) : updater;
    onChange?.({
      ...mapValues(hsv2rgb(next.h, next.s, next.v), (v) => round(v * 255)),
      a: round(next.a, 2),
    });
  };

  return (
    <>
      <div className="color-picker">
        <Saturation hsva={hsva} setHsva={setHsva} />
        <Hue hsva={hsva} setHsva={setHsva} />
        <Alpha hsva={hsva} setHsva={setHsva} />
      </div>
    </>
  );
}
