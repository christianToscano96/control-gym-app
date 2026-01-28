import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface DateSelectProps {
  label?: string;
  error?: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: "date" | "time" | "datetime";
  width?: "full" | "auto" | "sm" | "md" | "lg" | string;
  containerClassName?: string;
}

const DateSelect: React.FC<DateSelectProps> = ({
  label,
  error,
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  minimumDate,
  maximumDate,
  mode = "date",
  width = "full",
  containerClassName,
}) => {
  const [visible, setVisible] = React.useState(false);

  let widthClass = "";
  switch (width) {
    case "sm":
      widthClass = "w-32";
      break;
    case "md":
      widthClass = "w-64";
      break;
    case "lg":
      widthClass = "w-96";
      break;
    case "auto":
      widthClass = "w-auto";
      break;
    case "full":
      widthClass = "w-full";
      break;
    default:
      widthClass = typeof width === "string" ? width : "w-full";
      break;
  }

  return (
    <View className={`mb-4 ${widthClass} ${containerClassName || ""}`}>
      {label && (
        <Text className="mb-1 font-semibold text-dark-blue/70 text-sm px-1">
          {label}
        </Text>
      )}
      <TouchableOpacity
        className="w-full rounded-2xl text-dark-blue bg-slate-50 h-14 px-4 flex-row items-center border-0"
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text className={`text-base font-normal ${value ? "text-dark-blue" : "text-slate-400"}`}>
          {value ? value.toLocaleDateString() : placeholder}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={visible}
        mode={mode}
        date={value || new Date()}
        onConfirm={(date: Date) => {
          setVisible(false);
          onChange(date);
        }}
        onCancel={() => setVisible(false)}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
      {error && <Text className="text-red-600 mt-1 text-sm">{error}</Text>}
    </View>
  );
};

export default DateSelect;
