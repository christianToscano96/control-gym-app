import React from "react";
import { Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";
import { useTheme } from "@/context/ThemeContext";

interface ClientHeaderProps {
  avatarUri?: string;
  fullName: string;
  isActive?: boolean;
  membershipType?: string;
}

const membershipLabels: Record<string, string> = {
  basico: "Basico",
  pro: "Pro",
  proplus: "Pro+",
};

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  avatarUri,
  fullName,
  isActive,
  membershipType,
}) => {
  const { colors, primaryColor, isDark } = useTheme();

  const statusColor = isActive ? "#10B981" : "#DC2626";
  const statusBg = isActive
    ? isDark ? "#10B98120" : "#D1FAE5"
    : isDark ? "#DC262620" : "#FEE2E2";

  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 24,
        marginBottom: 4,
      }}
    >
      <View style={{ position: "relative" }}>
        <Avatar size="lg" uri={avatarUri} name={fullName} />
        {/* Status dot */}
        <View
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: statusColor,
            borderWidth: 3,
            borderColor: colors.background,
          }}
        />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 22,
          fontWeight: "700",
          marginTop: 14,
          textAlign: "center",
        }}
      >
        {fullName || "Sin nombre"}
      </Text>

      {/* Badges row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 10,
        }}
      >
        <View
          style={{
            backgroundColor: statusBg,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: statusColor, fontWeight: "600", fontSize: 12 }}>
            {isActive ? "Activo" : "Inactivo"}
          </Text>
        </View>

        {membershipType && (
          <View
            style={{
              backgroundColor: isDark ? primaryColor + "20" : primaryColor + "15",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{ color: primaryColor, fontWeight: "600", fontSize: 12 }}
            >
              {membershipLabels[membershipType] || membershipType}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
