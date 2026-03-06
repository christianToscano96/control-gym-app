import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Text, View } from "react-native";
import { GymStaffMember } from "@/types/superadmin";
import { SectionTitle } from "./ui";

export function StaffSection({ staff }: { staff: GymStaffMember[] }) {
  const { colors, isDark } = useTheme();

  if (!staff.length) return null;

  return (
    <View style={{ marginTop: 16 }}>
      <SectionTitle label={`Staff (${staff.length})`} />
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          gap: 8,
        }}
      >
        {staff.map((s) => (
          <View
            key={s._id}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Avatar size="sm" name={s.name} uri={s.avatar} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {s.name}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                {s.email}
              </Text>
            </View>
            <Badge label={s.active ? "Activo" : "Inactivo"} />
          </View>
        ))}
      </View>
    </View>
  );
}
