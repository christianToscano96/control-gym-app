import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  onClear?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = "Buscar...",
  className,
  containerClassName,
  onClear,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View className={`mb-3 w-full ${containerClassName || ""}`}>
      <View
        style={{
          backgroundColor: isDark ? colors.card : "#f1f5f9",
          borderRadius: 16,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          height: 48,
          paddingHorizontal: 14,
        }}
      >
        <MaterialIcons
          name="search"
          size={22}
          color={colors.textSecondary}
        />
        <TextInput
          className={className}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 15,
            marginLeft: 10,
            paddingVertical: 0,
          }}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          {...props}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={8}>
            <MaterialIcons
              name="close"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchInput;
