import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  width?: "full" | "auto" | "sm" | "md" | "lg" | string;
  containerClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder = "Selecciona una opción",
  options,
  value,
  onChange,
  error,
  width = "full",
  containerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className={`mb-4 ${widthClass} ${containerClassName || ""}`}>
      {label && (
        <Text className="mb-1 font-semibold text-dark-blue/70 text-sm px-1">
          {label}
        </Text>
      )}
      <TouchableOpacity
        className="w-full rounded-2xl text-dark-blue bg-slate-50 h-14 px-4 flex-row items-center justify-between border-0"
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text
          className={`text-base font-normal ${selectedOption ? "text-dark-blue" : "text-slate-400"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
      </TouchableOpacity>

      {error && <Text className="text-red-600 mt-1 text-sm">{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            className="w-11/12 max-h-96 rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.card }}
          >
            <View
              className="px-4 py-3 border-b"
              style={{ borderBottomColor: colors.border }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                {label || "Selecciona una opción"}
              </Text>
            </View>
            <ScrollView className="px-2 py-2">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className="px-4 py-4 rounded-xl mb-1"
                  style={{
                    backgroundColor:
                      value === option.value
                        ? colors.border + "40"
                        : "transparent",
                  }}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base ${value === option.value ? "font-bold" : "font-normal"}`}
                    style={{ color: colors.text }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Select;
