import React, { FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";

type PaymentMethod = "efectivo" | "transferencia";

interface PaymentOptionProps {
  id: PaymentMethod;
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onSelect: (id: PaymentMethod) => void;
}

const PaymentOption: FC<PaymentOptionProps> = ({
  id,
  label,
  iconName,
  selected,
  onSelect,
}) => {
  const { primaryColor, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onSelect(id)}
      activeOpacity={0.7}
      className="flex-1 flex-row items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        backgroundColor: selected ? `${primaryColor}15` : colors.card,
        borderWidth: 2,
        borderColor: selected ? primaryColor : colors.border,
      }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{
          backgroundColor: selected ? `${primaryColor}25` : `${colors.border}50`,
        }}
      >
        <MaterialIcons
          name={iconName}
          size={22}
          color={selected ? primaryColor : colors.textSecondary}
        />
      </View>
      <Text
        className="text-sm font-semibold flex-1"
        style={{ color: selected ? colors.text : colors.textSecondary }}
      >
        {label}
      </Text>
      <View
        className="w-5 h-5 rounded-full border-2 items-center justify-center"
        style={{
          borderColor: selected ? primaryColor : colors.border,
          backgroundColor: selected ? primaryColor : "transparent",
        }}
      >
        {selected && (
          <MaterialIcons name="check" size={12} color="#FFFFFF" />
        )}
      </View>
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
    <View className="flex-row gap-3">
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
