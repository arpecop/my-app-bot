import React from "react";
import {
    Text as Text1,
    View as View1,
    Dimensions,
    PixelRatio,
} from "react-native";

const pixelRatio = PixelRatio.get();

// Calculate DPI (based on mdpi as a baseline)
const dpi = 160 * pixelRatio;

console.log("Pixel Ratio:", pixelRatio);
console.log("DPI:", dpi);

export const getScaledValue = (baseInteger: number) => {
    if (typeof baseInteger !== "number") {
        return baseInteger;
    }
    const { width, height } = Dimensions.get("window");
    const minLogicalDimension = Math.min(width, height);
    // Implicitly, 1 unit equals (minLogicalDimension / 380) dp
    const dynamicUnitValue = minLogicalDimension / dpi; // Implicit normalization base
    const scaledSize = baseInteger * dynamicUnitValue;
    return Math.round(scaledSize);
};

// --- Custom ProportionalText Component ---
export const Text = ({
    fontSize,
    style,
    children,
    padding,
    className,
    ...rest
}: {
    fontSize?: number;
    style?: any;
    padding?: number[];
    children?: any;
    className?: string;
}) => {
    const scaledFontSize = getScaledValue(fontSize);
    return (
        <Text1
            style={[
                { fontSize: scaledFontSize },
                style,
                padding
                    ? {
                          paddingTop: getScaledValue(padding[0]),
                          paddingRight: getScaledValue(padding[1]),
                          paddingBottom: getScaledValue(padding[2]),
                          paddingLeft: getScaledValue(padding[3]),
                      }
                    : { padding: 0 },
            ]}
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
    padding,
    margin,
    ...rest
}: {
    width?: number;
    height?: number;
    className?: string;
    style?: any;
    padding?: number[];
    margin?: number[];
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
                padding
                    ? {
                          paddingTop: getScaledValue(padding[0]),
                          paddingRight: getScaledValue(padding[1]),
                          paddingBottom: getScaledValue(padding[2]),
                          paddingLeft: getScaledValue(padding[3]),
                      }
                    : { padding: 0 },
                margin
                    ? {
                          marginTop: getScaledValue(margin[0]),
                          marginRight: getScaledValue(margin[1]),
                          marginBottom: getScaledValue(margin[2]),
                          marginLeft: getScaledValue(margin[3]),
                      }
                    : { margin: 0 },
            ]}
            {...rest}
        >
            {children}
        </View1>
    );
};

export const TouchableOpacity = ({
    width,
    height,
    style,
    className,
    children,
    disabled,
    padding,
    activeOpacity,
    onPress,
    margin,
    ...rest
}: {
    width?: number;
    onPress?: () => void;
    height?: number;
    className?: string;
    style?: any;
    disabled?: boolean;
    padding?: number[];
    activeOpacity?: number;
    margin?: number[];
    children?: any;
}) => {
    const scaledWidth = getScaledValue(width);
    const scaledHeight = getScaledValue(height);

    return (
        <TouchableOpacity
            disabled={false}
            onPress={onPress}
            className={className}
            style={[
                style,
                {
                    width: scaledWidth,
                    height: scaledHeight,
                },
                padding
                    ? {
                          paddingTop: getScaledValue(padding[0]),
                          paddingRight: getScaledValue(padding[1]),
                          paddingBottom: getScaledValue(padding[2]),
                          paddingLeft: getScaledValue(padding[3]),
                      }
                    : { padding: 0 },
                margin
                    ? {
                          marginTop: getScaledValue(margin[0]),
                          marginRight: getScaledValue(margin[1]),
                          marginBottom: getScaledValue(margin[2]),
                          marginLeft: getScaledValue(margin[3]),
                      }
                    : { margin: 0 },
            ]}
            {...rest}
        >
            {children}
        </TouchableOpacity>
    );
};
