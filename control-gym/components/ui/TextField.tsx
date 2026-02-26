import type { ReactNode, ForwardedRef } from "react";
import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextInput as RNTextInput,
} from "react-native";

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
  width?: "full" | "auto" | "sm" | "md" | "lg" | string;
  keyboardType?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  returnKeyType?: "done" | "go" | "next" | "search" | "send" | undefined;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

function TextFieldBase(
  {
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
    width = "full",
    autoCapitalize = "none",
    ...props
  },
  ref: ForwardedRef<RNTextInput>,
) {
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
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            {leftIcon}
          </View>
        )}
        <TextInput
          ref={ref}
          className={
            className ||
            `w-full rounded-2xl text-dark-blue bg-slate-50 h-14 ${leftIcon ? "pl-12" : "pl-4"} pr-4 text-base font-normal border-0`
          }
          placeholderTextColor="#94a3b8"
          autoCapitalize={autoCapitalize}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          keyboardType={props.keyboardType}
          {...props}
        />
        {rightIcon &&
          (onRightIconPress ? (
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
              onPress={onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              {rightIcon}
            </View>
          ))}
      </View>
      {error && <Text className="text-red-600 mt-1 text-sm">{error}</Text>}
    </View>
  );
}

const TextField = React.forwardRef<RNTextInput, Props>(TextFieldBase);
export default TextField;
