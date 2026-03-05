import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { MembershipHistory } from "@/api/superadmin";
import { planConfig, reviewStatusConfig } from "./constants";
import { SectionTitle } from "./ui";

export function MembershipHistorySection({
  expanded,
  onToggle,
  memberships,
  formatDate,
}: {
  expanded: boolean;
  onToggle: () => void;
  memberships: MembershipHistory[];
  formatDate: (date?: string) => string;
}) {
  const { colors, isDark } = useTheme();
  const reviewMap = reviewStatusConfig(colors);

  return (
    <View style={{ marginTop: 16 }}>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <SectionTitle label="Historial de Actualizaciones de Membresia" />
        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={{ gap: 10 }}>
          {memberships.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                Sin historial de membresias.
              </Text>
            </View>
          ) : (
            memberships.map((m) => {
              const cfg = planConfig[m.plan] || planConfig.basico;
              const review = reviewMap[m.reviewStatus || "manual"];
              return (
                <View
                  key={m._id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: colors.border,
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isDark ? `${cfg.color}20` : cfg.bg,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: cfg.color,
                          fontWeight: "700",
                          fontSize: 11,
                        }}
                      >
                        {cfg.label}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: review.color,
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {review.label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginTop: 8,
                    }}
                  >
                    {formatDate(m.startDate)} - {formatDate(m.endDate)} | $
                    {m.amount?.toLocaleString() || 0}
                  </Text>
                  {m.paymentReference ? (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Ref pago: {m.paymentReference}
                    </Text>
                  ) : null}
                  {m.reviewNotes ? (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Nota: {m.reviewNotes}
                    </Text>
                  ) : null}
                  {m.paymentProofUrl ? (
                    <Image
                      source={{
                        uri: `${API_BASE_URL}${m.paymentProofUrl}`,
                      }}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        height: 160,
                        borderRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}
