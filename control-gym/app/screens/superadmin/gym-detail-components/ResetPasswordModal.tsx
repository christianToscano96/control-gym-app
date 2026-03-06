import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export function ResetPasswordModal({
  visible,
  password,
  loading,
  onClose,
  onChangePassword,
  onSubmit,
}: {
  visible: boolean;
  password: string;
  loading: boolean;
  onClose: () => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
}) {
  const { colors } = useTheme();

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
          backgroundColor: "#00000070",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: "800",
              fontSize: 18,
              marginBottom: 12,
            }}
          >
            Resetear contraseña admin
          </Text>
          <TextInput
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
            placeholder="Nueva contraseña"
            placeholderTextColor={colors.textSecondary}
            style={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
            }}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 11,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={loading}
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 11,
                alignItems: "center",
                backgroundColor: "#2563EB",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                {loading ? "Procesando..." : "Resetear"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
