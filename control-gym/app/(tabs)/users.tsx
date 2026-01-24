import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";

const TAB_CLIENTES = "Clientes";
const TAB_STAFF = "Staff";

export default function UsersScreen() {
  const [tab, setTab] = useState(TAB_CLIENTES);

  return (
    <View style={{ flex: 1, padding: 16, marginTop: 16 }}>
      {/* Tabs */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {[TAB_CLIENTES, TAB_STAFF].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: tab === t ? "#e0e0e0" : "#fafafa",
              borderRadius: 6,
              marginHorizontal: 4,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: tab === t ? "bold" : "normal",
                fontSize: 16,
              }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === TAB_CLIENTES ? (
        <View style={{ flex: 1 }}>
          <Text>Lista de clientes</Text>
          {/* Aquí va la lógica/lista de clientes */}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text>Lista de staff/personal</Text>
          {/* Aquí va la lógica/lista de staff */}
        </View>
      )}
    </View>
  );
}
