import { useState, useEffect } from "react";
import styles from "./ColorPicker.module.css";

const COLOR_OPTIONS = [
  "#ef4444",
  "#10b981",
  "#2563eb",
  "#ffff00",
  "#7c3aed",
  "#f472b6",
  "#000000",
  "#ffffff",
];

const ColorPicker = ({ currentColor, onChange, editable = false }) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!editable) setPickerOpen(false);
  }, [editable]);

  const renderColor = ({
    color,
    currentColor = null,
    large = false,
    pickerOpen,
  }) => {
    const current = color === currentColor;
    return (
      <div
        key={color}
        style={{
          backgroundColor: color,
          border: color === "#ffffff" && "1px solid black",
        }}
        className={[styles.Color, current && styles.ColorSelected].join(" ")}
        onClick={() => {
          if (pickerOpen) {
            setPickerOpen(false);
            onChange(color);
          }
        }}
      />
    );
  };

  return (
    <div
      className={[
        styles.ColorPicker,
        editable && styles.ColorPickerEditable,
        pickerOpen && styles.ColorPickerOpen,
      ].join(" ")}
      onClick={() => !pickerOpen && editable && setPickerOpen(true)}
    >
      {pickerOpen
        ? COLOR_OPTIONS.map((color) =>
            renderColor({
              color,
              currentColor,
              large: true,
              pickerOpen,
            })
          )
        : renderColor({ color: currentColor })}
    </div>
  );
};

export default ColorPicker;
