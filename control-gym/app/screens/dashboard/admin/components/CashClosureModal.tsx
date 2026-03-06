import React from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  visible: boolean;
  expectedCash: number;
  countedCashInput: string;
  onChangeCountedCash: (value: string) => void;
  cashNotes: string;
  onChangeCashNotes: (value: string) => void;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function CashClosureModal({
  visible,
  expectedCash,
  countedCashInput,
  onChangeCountedCash,
  cashNotes,
  onChangeCashNotes,
  isPending,
  onConfirm,
  onClose,
}: Props) {
  const { colors, primaryColor } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}
          >
            Cierre de caja
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 4,
              marginBottom: 10,
            }}
          >
            Ingrese el efectivo contado al cierre del día.
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Efectivo esperado
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            ${expectedCash.toLocaleString("es-AR")}
          </Text>

          <TextInput
            value={countedCashInput}
            onChangeText={onChangeCountedCash}
            keyboardType="numeric"
            placeholder="Efectivo contado"
            placeholderTextColor={colors.textSecondary}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
              marginBottom: 10,
            }}
          />

          <TextInput
            value={cashNotes}
            onChangeText={onChangeCashNotes}
            placeholder="Observaciones (opcional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              minHeight: 86,
              color: colors.text,
              textAlignVertical: "top",
            }}
          />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <Text
                style={{ color: colors.textSecondary, fontWeight: "700" }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isPending}
              style={{
                flex: 1,
                borderRadius: 10,
                backgroundColor: primaryColor,
                alignItems: "center",
                paddingVertical: 10,
                opacity: isPending ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#0d1c3d", fontWeight: "800" }}>
                {isPending ? "Guardando..." : "Confirmar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
