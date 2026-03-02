import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { SuperAdminEntry } from "@/types/superadmin";
import { planConfig } from "../hooks/useSuperAdminDashboard";

export const GymAdminCard = React.memo(
  ({ admin, onPress }: { admin: SuperAdminEntry; onPress?: () => void }) => {
    const { colors, isDark } = useTheme();
    const gym = admin.gym;
    const isActive = gym?.active ?? false;
    const statusColor = isActive ? colors.success : colors.error;
    const plan = gym ? planConfig[gym.plan] : null;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.65}
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          paddingLeft: 0,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          shadowColor: isDark ? "transparent" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          overflow: "hidden",
        }}
      >
        {/* Left accent bar */}
        <View
          style={{
            width: 3.5,
            height: 36,
            backgroundColor: statusColor,
            borderRadius: 2,
            marginLeft: 4,
            marginRight: 10,
          }}
        />

        {/* Avatar with status dot */}
        <View>
          <Avatar size="sm" name={admin.name} uri={admin.avatar} />
          <View
            style={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 11,
              height: 11,
              borderRadius: 6,
              backgroundColor: statusColor,
              borderWidth: 2,
              borderColor: colors.card,
            }}
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
          {/* Row 1: Gym name + plan badge */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: "600",
                flexShrink: 1,
              }}
              numberOfLines={1}
            >
              {gym?.name || "Sin gimnasio"}
            </Text>
            {plan && (
              <View
                style={{
                  backgroundColor: isDark ? `${plan.color}20` : plan.bg,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: plan.color,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                  }}
                >
                  {plan.label}
                </Text>
              </View>
            )}
          </View>

          {/* Row 2: Admin name + client count */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 3,
              gap: 6,
            }}
          >
            <MaterialIcons
              name="person"
              size={12}
              color={colors.textSecondary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "500",
              }}
              numberOfLines={1}
            >
              {admin.name}
            </Text>
            <Text style={{ color: colors.border, fontSize: 10 }}>|</Text>
            <MaterialIcons
              name="people"
              size={12}
              color={colors.textSecondary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              {gym?.clientsCount ?? 0} clientes
            </Text>
          </View>
        </View>

        {/* Right side: Status badge + chevron */}
        <Badge label={isActive ? "Activo" : "Inactivo"} />
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={colors.textSecondary}
          style={{ marginLeft: 6, opacity: 0.6 }}
        />
      </TouchableOpacity>
    );
  },
);
