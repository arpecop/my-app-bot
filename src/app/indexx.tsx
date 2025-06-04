import React from "react";
import { Text, View, Dimensions } from "react-native";

// Manager, this is the core scaling logic. The '380' here serves as an implicit
// normalization base, defining what your input integers (like 100, 18) mean
// in terms of "units" on a conceptual 380dp screen.
const getScaledValue = (baseInteger: number) => {
    if (typeof baseInteger !== "number") {
        return baseInteger;
    }
    const { width, height } = Dimensions.get("window");
    const minLogicalDimension = Math.min(width, height);
    // Implicitly, 1 unit equals (minLogicalDimension / 380) dp
    const dynamicUnitValue = minLogicalDimension / 380; // Implicit normalization base
    const scaledSize = baseInteger * dynamicUnitValue;
    return Math.round(scaledSize);
};

// --- Custom ProportionalText Component ---
const ProportionalText = ({ fontSize, style, children, ...rest }) => {
    const scaledFontSize = getScaledValue(fontSize);

    return (
        <Text style={[{ fontSize: scaledFontSize }, style]} {...rest}>
            {children}
        </Text>
    );
};

// --- Custom ProportionalView Component ---
const ProportionalView = ({ width, height, style, children, ...rest }) => {
    const scaledWidth = getScaledValue(width);
    const scaledHeight = getScaledValue(height);

    return (
        <View
            style={[
                style,
                {
                    width: scaledWidth,
                    height: scaledHeight,
                },
            ]}
            {...rest}
        >
            {children}
        </View>
    );
};

// --- Main Application Component ---
const App = () => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: getScaledValue(20),
                backgroundColor: "#F5FCFF",
            }}
        >
            <ProportionalText
                fontSize={20}
                style={{
                    marginBottom: getScaledValue(30),
                    color: "#007bff",
                    fontWeight: "bold",
                    textAlign: "center",
                }}
            >
                Proportional Text
            </ProportionalText>

            {/* Existing examples */}
            <ProportionalView
                width={100}
                height={100}
                style={{
                    backgroundColor: "#FF6347",
                    marginBottom: getScaledValue(20),
                    borderRadius: getScaledValue(5),
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ProportionalText
                    fontSize={14}
                    style={{ color: "white", fontWeight: "bold" }}
                >
                    Square (100x100)
                </ProportionalText>
            </ProportionalView>

            <ProportionalView
                width={150}
                height={70}
                style={{
                    backgroundColor: "#3CB371",
                    borderRadius: getScaledValue(10),
                    marginBottom: getScaledValue(20),
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ProportionalText
                    fontSize={14}
                    style={{ color: "white", fontWeight: "bold" }}
                >
                    Rect (150x70)
                </ProportionalText>
            </ProportionalView>

            <ProportionalView
                width={50}
                height={50}
                style={{
                    backgroundColor: "#FFA500",
                    borderWidth: getScaledValue(3),
                    borderColor: "#8B4513",
                    padding: getScaledValue(5),
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ProportionalText
                    fontSize={10}
                    style={{ color: "white", fontWeight: "bold" }}
                >
                    Small
                </ProportionalText>
            </ProportionalView>

            <View
                style={{
                    height: getScaledValue(1),
                    width: getScaledValue(250),
                    backgroundColor: "#CCC",
                    marginVertical: getScaledValue(15),
                }}
            />

            {/* NEW: View Section with Items Next to Each Other */}
            <ProportionalText
                fontSize={16}
                style={{
                    marginTop: getScaledValue(30),
                    marginBottom: getScaledValue(15),
                    color: "#4B0082",
                    fontWeight: "bold",
                    textAlign: "center",
                }}
            >
                Items in a Row
            </ProportionalText>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                    width: getScaledValue(300),
                    height: getScaledValue(80),
                    backgroundColor: "#E0FFFF",
                    borderRadius: getScaledValue(10),
                    padding: getScaledValue(10),
                }}
            >
                <ProportionalView
                    width={60}
                    height={60}
                    style={{
                        backgroundColor: "#ADD8E6",
                        borderRadius: getScaledValue(8),
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ProportionalText
                        fontSize={12}
                        style={{ color: "#000080", fontWeight: "bold" }}
                    >
                        Item 1
                    </ProportionalText>
                </ProportionalView>

                <ProportionalView
                    width={60}
                    height={60}
                    style={{
                        backgroundColor: "#90EE90",
                        borderRadius: getScaledValue(8),
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ProportionalText
                        fontSize={12}
                        style={{ color: "#006400", fontWeight: "bold" }}
                    >
                        Item 2
                    </ProportionalText>
                </ProportionalView>

                <ProportionalView
                    width={60}
                    height={60}
                    style={{
                        backgroundColor: "#FFD700",
                        borderRadius: getScaledValue(8),
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ProportionalText
                        fontSize={12}
                        style={{ color: "#8B4513", fontWeight: "bold" }}
                    >
                        Item 3
                    </ProportionalText>
                </ProportionalView>
            </View>

            <ProportionalText
                fontSize={10}
                style={{
                    color: "#888",
                    marginTop: getScaledValue(20),
                    fontStyle: "italic",
                    textAlign: "center",
                }}
            >
                Observe how shapes and text scale proportionally across
                devices/orientations.
            </ProportionalText>
        </View>
    );
};

export default App;
