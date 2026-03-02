import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { FilterStatus } from "../hooks/useSuperAdminDashboard";

interface FilterChipsProps {
  filterStatus: FilterStatus;
  filterOptions: { key: FilterStatus; label: string; count?: number }[];
  onFilterChange: (status: FilterStatus) => void;
}

export const FilterChips = ({
  filterStatus,
  filterOptions,
  onFilterChange,
}: FilterChipsProps) => {
  const { colors, primaryColor, isDark } = useTheme();

  return (
    <View className="flex-row gap-2 mb-4">
      {filterOptions.map(({ key, label, count }) => {
        const isSelected = filterStatus === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onFilterChange(key)}
            activeOpacity={0.7}
            style={{
              backgroundColor: isSelected
                ? primaryColor
                : isDark
                  ? colors.card
                  : "#f1f5f9",
              borderWidth: isSelected ? 0 : isDark ? 1 : 0,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text
              style={{
                color: isSelected ? "#FFFFFF" : colors.textSecondary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {label}
            </Text>
            {count != null && (
              <View
                style={{
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.25)"
                    : `${primaryColor}15`,
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  minWidth: 22,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: isSelected ? "#FFFFFF" : primaryColor,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
