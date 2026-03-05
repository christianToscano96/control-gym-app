import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SectionTitle } from "./ui";

export function ActionsSection({
  gymActive,
  showReset,
  toggleLoading,
  onToggleGym,
  onOpenEdit,
  onOpenReset,
  onDelete,
}: {
  gymActive: boolean;
  showReset: boolean;
  toggleLoading: boolean;
  onToggleGym: () => void;
  onOpenEdit: () => void;
  onOpenReset: () => void;
  onDelete: () => void;
}) {
  const { colors, primaryColor, isDark } = useTheme();
  const iconButtonSize = 54;

  return (
    <View style={{ marginTop: 16 }}>
      <SectionTitle label="Acciones" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <TouchableOpacity
          onPress={onToggleGym}
          disabled={toggleLoading}
          accessibilityLabel={
            gymActive ? "Deshabilitar gimnasio" : "Habilitar gimnasio"
          }
          style={{
            width: iconButtonSize,
            height: iconButtonSize,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: gymActive
              ? isDark
                ? "#DC262630"
                : "#FEE2E2"
              : isDark
                ? "#10B98130"
                : "#D1FAE5",
          }}
        >
          {toggleLoading ? (
            <ActivityIndicator size="small" color={gymActive ? "#DC2626" : "#10B981"} />
          ) : (
            <MaterialIcons
              name={gymActive ? "toggle-on" : "toggle-off"}
              size={28}
              color={gymActive ? "#DC2626" : "#10B981"}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onOpenEdit}
          accessibilityLabel="Editar gimnasio"
          style={{
            width: iconButtonSize,
            height: iconButtonSize,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? `${primaryColor}25` : "#F0FDF4",
          }}
        >
          <MaterialIcons name="edit" size={24} color={primaryColor} />
        </TouchableOpacity>
        {showReset ? (
          <TouchableOpacity
            onPress={onOpenReset}
            accessibilityLabel="Resetear password admin"
            style={{
              width: iconButtonSize,
              height: iconButtonSize,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#1E3A8A50" : "#DBEAFE",
            }}
          >
            <MaterialIcons name="vpn-key" size={22} color="#2563EB" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={onDelete}
          accessibilityLabel="Eliminar gimnasio"
          style={{
            width: iconButtonSize,
            height: iconButtonSize,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? "#7F1D1D70" : "#FECACA",
          }}
        >
          <MaterialIcons name="delete-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
