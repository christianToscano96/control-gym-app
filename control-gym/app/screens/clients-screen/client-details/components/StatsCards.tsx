import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface StatsCardsProps {
  primaryColor: string;
  attendanceCount: number;
  expirationDateText: string;
  expirationLabel: string;
  hasExpired: boolean;
  isExpiringSoon: boolean;
  statusLabel: string;
  isActive: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  primaryColor,
  attendanceCount,
  expirationDateText,
  expirationLabel,
  hasExpired,
  isExpiringSoon,
  statusLabel,
  isActive,
}) => {
  return (
    <View className="px-4 mb-3">
      <View className="flex flex-row gap-3 mb-3">
        {/* Asistencia Card */}
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
          <View className="flex-row items-center mb-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <MaterialIcons
                name="fitness-center"
                size={20}
                color={primaryColor}
              />
            </View>
          </View>
          <Text className="text-xs text-gray-500 mb-1">Asistencias</Text>
          <Text className="text-2xl font-bold text-neutral-900">
            {attendanceCount}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">Este mes</Text>
        </View>

        {/* Válido hasta Card */}
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
          <View className="flex-row items-center mb-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: hasExpired
                  ? "#FEE2E2"
                  : isExpiringSoon
                    ? "#FEF3C7"
                    : `${primaryColor}15`,
              }}
            >
              <MaterialIcons
                name="event"
                size={20}
                color={
                  hasExpired
                    ? "#DC2626"
                    : isExpiringSoon
                      ? "#D97706"
                      : primaryColor
                }
              />
            </View>
          </View>
          <Text className="text-xs text-gray-500 mb-1">{expirationLabel}</Text>
          <Text
            className="text-xs font-semibold leading-tight"
            style={{
              color: hasExpired
                ? "#DC2626"
                : isExpiringSoon
                  ? "#D97706"
                  : "#1F2937",
            }}
          >
            {expirationDateText}
          </Text>
          {isExpiringSoon && !hasExpired && (
            <View className="mt-1 flex-row items-center">
              <MaterialIcons name="warning" size={12} color="#D97706" />
              <Text className="text-xs text-amber-600 ml-1">Por vencer</Text>
            </View>
          )}
        </View>

        {/* Estado Card */}
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
          <View className="flex flex-col items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isActive ? "#D1FAE5" : "#FEE2E2",
              }}
            >
              <MaterialIcons
                name={isActive ? "check-circle" : "cancel"}
                size={20}
                color={isActive ? "#10B981" : "#DC2626"}
              />
            </View>
            <View className="mt-3 flex-1">
              <Text className="text-xs text-gray-500 mb-0.5">Estado</Text>
              <Text
                className="text-base font-bold"
                style={{
                  color: isActive ? "#10B981" : "#DC2626",
                }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
