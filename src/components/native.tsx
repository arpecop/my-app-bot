import React from "react";
import { Text as Text1, View as View1, Dimensions } from "react-native";

export const getScaledValue = (baseInteger: number) => {
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
export const Text = ({
    fontSize,
    style,
    children,
    className,
    ...rest
}: {
    fontSize?: number;
    style?: any;
    children?: any;
    className?: string;
}) => {
    const scaledFontSize = getScaledValue(fontSize);
    return (
        <Text1
            style={[{ fontSize: scaledFontSize }, style]}
            className={className}
            {...rest}
        >
            {children}
        </Text1>
    );
};

// --- Custom ProportionalView Component ---
export const View = ({
    width,
    height,
    style,
    className,
    children,
    ...rest
}: {
    width?: number;
    height?: number;
    className?: string;
    style?: any;
    children?: any;
}) => {
    const scaledWidth = getScaledValue(width);
    const scaledHeight = getScaledValue(height);

    return (
        <View1
            className={className}
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
        </View1>
    );
};
