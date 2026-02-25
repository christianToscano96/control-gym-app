import React, { FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type PaymentMethod = "efectivo" | "transferencia";

interface PaymentOptionProps {
  id: PaymentMethod;
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  selected: string | boolean;
  onSelect: (id: PaymentMethod) => void;
}

const PaymentOption: FC<PaymentOptionProps> = ({
  id,
  label,
  iconName,
  selected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(id)}
      activeOpacity={0.7}
      className={`flex-1 aspect-square max-w-[120px] m-2 rounded-[32px] border-2 items-center justify-center relative ${
        selected ? "bg-green-50 border-green-500" : "bg-white border-gray-100"
      }`}
    >
      <View
        className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 ${
          selected
            ? "border-green-500 bg-green-500"
            : "border-gray-100 bg-white"
        }`}
      />

      <View className="mb-2">
        <MaterialIcons name={iconName} size={28} color="#111827" />
      </View>

      <Text className="text-gray-900 text-lg font-bold">{label}</Text>
    </TouchableOpacity>
  );
};

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: FC<PaymentMethodSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <View className="flex-row justify-center p-2">
      <PaymentOption
        id="efectivo"
        label="Efectivo"
        iconName="attach-money"
        selected={value === "efectivo"}
        onSelect={onChange}
      />
      <PaymentOption
        id="transferencia"
        label="Transferencia"
        iconName="account-balance"
        selected={value === "transferencia"}
        onSelect={onChange}
      />
    </View>
  );
};

export default PaymentMethodSelector;
