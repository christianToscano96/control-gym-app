import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import EmptyState from "@/components/ui/EmptyState";
import { SuperAdminEntry } from "@/types/superadmin";
import { GymAdminCard } from "./GymAdminCard";
import { FilterStatus } from "../hooks/useSuperAdminDashboard";

interface GymAdminListProps {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  filteredAdmins: SuperAdminEntry[];
  searchQuery: string;
  filterStatus: FilterStatus;
  onRetry: () => void;
  onAdminPress: (admin: SuperAdminEntry) => void;
}

export const GymAdminList = ({
  isLoading,
  isError,
  error,
  filteredAdmins,
  searchQuery,
  filterStatus,
  onRetry,
  onAdminPress,
}: GymAdminListProps) => {
  const { colors, primaryColor, isDark } = useTheme();

  if (isLoading) {
    return (
      <View className="py-16 items-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm mt-3"
        >
          Cargando datos...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={{
          backgroundColor: isDark ? "#ef444415" : "#FEF2F2",
          borderRadius: 16,
          padding: 20,
          alignItems: "center",
        }}
      >
        <MaterialIcons name="error-outline" size={32} color="#ef4444" />
        <Text
          style={{ color: "#ef4444", marginTop: 8, textAlign: "center" }}
          className="text-sm font-medium"
        >
          {(error as Error)?.message || "Error al cargar datos"}
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          style={{
            marginTop: 12,
            backgroundColor: primaryColor,
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}
          >
            Reintentar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filteredAdmins.length === 0) {
    return (
      <EmptyState
        icon="store"
        title="No hay gimnasios"
        description={
          searchQuery
            ? "No se encontraron gimnasios con los filtros aplicados"
            : "Aún no hay gimnasios registrados"
        }
      />
    );
  }

  return (
    <>
      <Text
        style={{ color: colors.textSecondary }}
        className="text-xs mb-2 px-1"
      >
        {filteredAdmins.length}{" "}
        {filteredAdmins.length === 1 ? "resultado" : "resultados"}
      </Text>
      {filteredAdmins.map((admin) => (
        <GymAdminCard
          key={admin._id}
          admin={admin}
          onPress={() => onAdminPress(admin)}
        />
      ))}
    </>
  );
};
