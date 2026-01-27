import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
  return (
    <View className={`mb-4 w-full ${containerClassName || ""}`}>
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <MaterialIcons name="search" size={22} color="#64748b" />
        </View>
        <TextInput
          className={
            className ||
            `w-full rounded-2xl text-dark-blue bg-slate-50 h-12 pl-12 pr-10 text-base font-normal border-0`
          }
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          {...props}
        />
        {value.length > 0 && (
          <TouchableOpacity
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            onPress={onClear}
          >
            <MaterialIcons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchInput;
