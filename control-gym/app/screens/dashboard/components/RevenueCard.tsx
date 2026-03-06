import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface RevenueCardProps {
  isLoading: boolean;
  totalRevenue: number;
  platformRevenue: number;
  platformRevenueThisMonth?: number;
  platformRevenueLastMonth?: number;
  platformRevenueDeltaPct?: number;
  newGymsThisMonth?: number;
  newGymsLastMonth?: number;
  newGymsDelta?: number;
}

export const RevenueCard = ({
  isLoading,
  totalRevenue,
  platformRevenue,
  platformRevenueThisMonth = 0,
  platformRevenueLastMonth = 0,
  platformRevenueDeltaPct = 0,
  newGymsThisMonth = 0,
  newGymsLastMonth = 0,
  newGymsDelta = 0,
}: RevenueCardProps) => {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const cardStyle = {
    marginHorizontal: 4,
    marginVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
    shadowColor: isDark ? "transparent" : "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const trendPositive = platformRevenueDeltaPct >= 0;
  const monthlyDeltaAmount = platformRevenueThisMonth - platformRevenueLastMonth;

  return (
    <View style={{ gap: 8 }}>
      {/* Ingresos de la Plataforma (suscripciones de gimnasios) */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={toggleExpanded}
        style={[
          cardStyle,
          {
            borderWidth: expanded ? 1 : cardStyle.borderWidth,
            borderColor: expanded ? "#7C3AED55" : cardStyle.borderColor,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: "#7C3AED15",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="rocket-launch" size={24} color="#7C3AED" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              INGRESOS DE LA APP
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 28,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              {isLoading ? "..." : `$${platformRevenue.toLocaleString()}`}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
              {isLoading
                ? "..."
                : expanded
                  ? "Toque para ocultar detalle"
                  : "Toque para ver detalle mensual"}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: expanded ? "#7C3AED25" : "#7C3AED15",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text
              style={{ color: "#7C3AED", fontSize: 11, fontWeight: "700" }}
            >
              Suscripciones
            </Text>
            <MaterialIcons
              name={expanded ? "expand-less" : "expand-more"}
              size={16}
              color="#7C3AED"
            />
          </View>
        </View>

        {expanded && (
          <View style={{ marginTop: 14, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  padding: 10,
                  backgroundColor: isDark ? "#1E1B4B55" : "#EEF2FF",
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Mes actual
                </Text>
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>
                  {isLoading ? "..." : `$${platformRevenueThisMonth.toLocaleString()}`}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  padding: 10,
                  backgroundColor: isDark ? "#111827" : "#F8FAFC",
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Mes anterior
                </Text>
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>
                  {isLoading ? "..." : `$${platformRevenueLastMonth.toLocaleString()}`}
                </Text>
              </View>
            </View>

            <View
              style={{
                borderRadius: 12,
                padding: 10,
                backgroundColor: trendPositive
                  ? isDark
                    ? "#10B98122"
                    : "#ECFDF5"
                  : isDark
                    ? "#DC262622"
                    : "#FEF2F2",
                borderWidth: 1,
                borderColor: trendPositive ? "#10B98155" : "#DC262655",
              }}
            >
              <Text
                style={{
                  color: trendPositive ? "#10B981" : "#DC2626",
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                {isLoading
                  ? "..."
                  : `${trendPositive ? "+" : ""}${platformRevenueDeltaPct}% vs mes anterior`}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                {isLoading
                  ? "..."
                  : `Diferencia absoluta: ${monthlyDeltaAmount >= 0 ? "+" : ""}$${Math.abs(monthlyDeltaAmount).toLocaleString()}`}
              </Text>
            </View>

            <View
              style={{
                borderRadius: 12,
                padding: 10,
                backgroundColor: isDark ? "#111827" : "#F8FAFC",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Gimnasios nuevos
              </Text>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14, marginTop: 2 }}>
                {isLoading
                  ? "..."
                  : `${newGymsThisMonth} este mes · ${newGymsLastMonth} mes anterior`}
              </Text>
              <Text
                style={{
                  color: newGymsDelta >= 0 ? "#10B981" : "#DC2626",
                  fontSize: 12,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {isLoading
                  ? "..."
                  : `Variación: ${newGymsDelta >= 0 ? "+" : ""}${newGymsDelta}`}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Ingresos de los Gimnasios (pagos de clientes) */}
      <View style={cardStyle}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: "#10B98115",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="attach-money" size={24} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              INGRESOS DE GIMNASIOS
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 28,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              {isLoading ? "..." : `$${totalRevenue.toLocaleString()}`}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#10B98115",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}
            >
              Todos los gyms
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
