import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { View } from "react-native";
import { InfoRow, SectionTitle } from "./ui";

export function PlanInfoSection({
  planLabel,
  planColor,
  membershipStartDate,
  membershipEndDate,
  membershipStatusLabel,
  membershipStatusColor,
  adminEmail,
  address,
  staffCount,
}: {
  planLabel: string;
  planColor: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatusLabel: string;
  membershipStatusColor: string;
  adminEmail?: string | null;
  address?: string | null;
  staffCount: number;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ marginTop: 16 }}>
      <SectionTitle label="Informacion del Plan" />
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          paddingHorizontal: 14,
        }}
      >
        <InfoRow
          icon="card-membership"
          label="Plan actual"
          value={planLabel}
          valueColor={planColor}
        />
        <InfoRow icon="event" label="Inicio del plan" value={membershipStartDate} />
        <InfoRow icon="event-busy" label="Expiracion" value={membershipEndDate} />
        <InfoRow
          icon="schedule"
          label="Estado membresia"
          value={membershipStatusLabel}
          valueColor={membershipStatusColor}
        />
        {adminEmail ? <InfoRow icon="email" label="Email admin" value={adminEmail} /> : null}
        <InfoRow icon="location-on" label="Direccion" value={address || "--"} />
        <InfoRow icon="badge" label="Staff" value={String(staffCount)} noBorder />
      </View>
    </View>
  );
}
