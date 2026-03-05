import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { planOptions } from "./constants";

export function EditGymModal({
  visible,
  name,
  address,
  plan,
  loading,
  onClose,
  onSave,
  onChangeName,
  onChangeAddress,
  onChangePlan,
}: {
  visible: boolean;
  name: string;
  address: string;
  plan: "basico" | "pro" | "proplus";
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeName: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangePlan: (value: "basico" | "pro" | "proplus") => void;
}) {
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
            Editar gimnasio
          </Text>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder="Nombre"
            placeholderTextColor={colors.textSecondary}
            style={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 10,
            }}
          />
          <TextInput
            value={address}
            onChangeText={onChangeAddress}
            placeholder="Direccion"
            placeholderTextColor={colors.textSecondary}
            style={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 10,
            }}
          />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            {planOptions.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => onChangePlan(p.key)}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: plan === p.key ? primaryColor : colors.background,
                  borderWidth: 1,
                  borderColor: plan === p.key ? primaryColor : colors.border,
                }}
              >
                <Text
                  style={{
                    color: plan === p.key ? "#0D1C3D" : colors.text,
                    fontWeight: "700",
                  }}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
              onPress={onSave}
              disabled={loading}
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 11,
                alignItems: "center",
                backgroundColor: primaryColor,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#0D1C3D", fontWeight: "800" }}>
                {loading ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
