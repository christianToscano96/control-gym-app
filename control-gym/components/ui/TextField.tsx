import type { ReactNode } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  label?: string;
  error?: string;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  onRightIconPress?: () => void;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
}

const TextField: React.FC<Props> = ({
  label,
  error,
  className,
  leftIcon,
  rightIcon,
  containerClassName,
  onRightIconPress,
  value,
  placeholder,
  onChangeText,
  secureTextEntry,
  ...props
}) => {
  return (
    <View className={`mb-4 w-full ${containerClassName || ""}`}>
      {label && (
        <Text className="mb-1 font-semibold text-dark-blue/70 text-sm px-1">
          {label}
        </Text>
      )}
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-14 w-8 flex items-center justify-center">
            {leftIcon}
          </View>
        )}
        <TextInput
          className={
            className ||
            `w-full rounded-2xl text-dark-blue bg-slate-50 h-14 ${leftIcon ? "pl-12" : "pl-4"} pr-4 text-base font-normal border-0`
          }
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          {...props}
        />
        {rightIcon &&
          (onRightIconPress ? (
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-14 w-8 flex items-center justify-center"
              onPress={onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-14 w-8 flex items-center justify-center">
              {rightIcon}
            </View>
          ))}
      </View>
      {error && <Text className="text-red-600 mt-1 text-sm">{error}</Text>}
    </View>
  );
};

export default TextField;
