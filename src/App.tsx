import { useState, createContext, useContext } from "react";
import { usePopupColorPicker } from "./usePopupColorPicker";
import "./App.css";
import { type RGBA } from "./components/ColorPicker";
import { clamp } from "lodash";

function ColorInput(props: {
  value: number;
  min: number;
  max: number;
  style?: React.CSSProperties;
  onChange: (value: number) => void;
}) {
  const { value, min, max, style, onChange } = props;

  const [inputValue, setInputValue] = useState<string>(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setInputValue(String(value));
    setPrevValue(value);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[-]?\d*\.?\d*$/.test(val)) {
      setInputValue(val);
    }
  };

  const commit = (raw: string) => {
    let num = Number(raw);
    if (isNaN(num)) num = value;
    num = clamp(num, min, max);
    setInputValue(String(num));
    onChange(num);
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      style={style}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const input = e.target as HTMLInputElement;
          commit(input.value);
          input.blur();
        }
      }}
    />
  );
}

interface ColorContextAction {
  update: (index: number, partial: Partial<RGBA>) => void;
  remove: (index: number) => void;
  add: () => void;
}

const ColorContext = createContext<ColorContextAction | null>(null);

function useColorContext() {
  const ctx = useContext(ColorContext);
  if (!ctx) {
    throw new Error(
      "useColorContext must be used within ColorContext.Provider",
    );
  }
  return ctx;
}

function ColorItem(props: { color: RGBA; index: number; isLastOne: boolean }) {
  const { color, index, isLastOne } = props;
  const { update, remove } = useColorContext();

  const { open: openPicker, Popup } = usePopupColorPicker();
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            border: "1px solid #000",
            background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
            cursor: "pointer",
          }}
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            openPicker(color, rect.right + 8, rect.top, (newColor) =>
              update(index, newColor),
            );
          }}
          title="点击选择颜色"
        ></div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ColorInput
            value={color.r}
            min={0}
            max={255}
            style={{ width: 50, border: "1px solid #eee" }}
            onChange={(v) => update(index, { r: v })}
          />
          <ColorInput
            value={color.g}
            min={0}
            max={255}
            style={{ width: 50, border: "1px solid #eee" }}
            onChange={(v) => update(index, { g: v })}
          />
          <ColorInput
            value={color.b}
            min={0}
            max={255}
            style={{ width: 50, border: "1px solid #eee" }}
            onChange={(v) => update(index, { b: v })}
          />
          <ColorInput
            value={color.a}
            min={0}
            max={1}
            style={{ width: 50, border: "1px solid #eee" }}
            onChange={(v) => update(index, { a: v })}
          />
          <button
            onClick={() => remove(index)}
            style={{ color: isLastOne ? "gray" : "red" }}
            disabled={isLastOne}
          >
            删除
          </button>
        </div>
        {Popup}
      </div>
    </>
  );
}

function ColorList(props: { colors: RGBA[] }) {
  const { add } = useColorContext();
  const { colors } = props;
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {colors.map((color, index) => (
          <ColorItem
            key={index}
            color={color}
            index={index}
            isLastOne={colors.length === 1}
          />
        ))}
      </div>
      <button onClick={add} style={{ marginTop: 12, color: "green" }}>
        添加
      </button>
    </>
  );
}

export default function App() {
  const [colors, setColors] = useState<RGBA[]>([
    { r: 255, g: 0, b: 0, a: 1 },
    { r: 0, g: 255, b: 0, a: 1 },
    { r: 0, g: 0, b: 255, a: 1 },
  ]);

  const update = (index: number, partial: Partial<RGBA>) => {
    setColors((colors) => {
      const newColors = [...colors];
      newColors[index] = { ...newColors[index], ...partial };
      return newColors;
    });
  };

  const remove = (index: number) => {
    setColors((colors) => colors.filter((_, i) => i !== index));
  };

  const add = () => {
    setColors((colors) => [...colors, { r: 255, g: 255, b: 255, a: 1 }]);
  };

  const [gradientType, setGradientType] = useState<"linear" | "radial">(
    "linear",
  );

  let gradient = "";

  if (gradientType === "linear") {
    gradient = `linear-gradient(90deg, ${colors
      .map((c) => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`)
      .join(", ")})`;
  } else {
    gradient = `radial-gradient(circle, ${colors
      .map((c) => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`)
      .join(", ")})`;
  }

  return (
    <div style={{ height: "100%", background: gradient }}>
      <div className="color-panel">
        <label>
          渐变类型：
          <select
            value={gradientType}
            onChange={(e) =>
              setGradientType(e.target.value as "linear" | "radial")
            }
          >
            <option value="linear">线性渐变</option>
            <option value="radial">径向渐变</option>
          </select>
        </label>

        <ColorContext.Provider value={{ update, remove, add }}>
          <ColorList colors={colors} />
        </ColorContext.Provider>
      </div>
    </div>
  );
}
