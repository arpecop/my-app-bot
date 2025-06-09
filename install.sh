#!/bin/zsh

echo "--- Automated Expo Android Build Environment Setup for Fedora ---"
echo ""

# Define ANCHOR_POINT to help with environment variable setup later
ANCHOR_POINT="# --- Start Android SDK Configuration ---"
ANDROID_SDK_HOME="/opt/android-sdk"
NPM_PACKAGES=("expo-cli" "eas-cli")

# --- Step 1: Install System Dependencies ---
echo "1. Installing essential system packages (unzip, wget)..."
# Removed explicit 'java-17-openjdk-devel' as it seems you have a later version.
# Removed Node.js/npm installation as you already have them.
sudo dnf install -y curl unzip wget

if [ $? -ne 0 ]; then
    echo "❌ Failed to install core system packages. Please check dnf or internet connection."
    exit 1
fi
echo "✅ System packages installed."
echo ""

# --- Step 2: (Skipped) Node.js and npm are assumed to be already installed. ---
echo "2. Skipping Node.js and npm installation as they are assumed to be already installed."
echo ""

# --- Step 3: Configure Android SDK Home and Permissions ---
echo "3. Configuring Android SDK directory and permissions..."
sudo mkdir -p "$ANDROID_SDK_HOME"
sudo chown -R "${USER}:${USER}" "$ANDROID_SDK_HOME"
echo "✅ Android SDK directory created and permissions set for ${USER}."
echo ""

# --- Step 4: Install Android Command-line Tools ---
echo "4. Installing Android Command-line Tools..."
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip" # Updated URL (check for newer if this fails)
CMDLINE_TOOLS_DIR="${ANDROID_SDK_HOME}/cmdline-tools"
CMDLINE_TOOLS_LATEST_DIR="${CMDLINE_TOOLS_DIR}/latest"
TEMP_DIR=$(mktemp -d -t android-clt-XXXXXXXX)

wget -O "${TEMP_DIR}/commandlinetools.zip" "$CMDLINE_TOOLS_URL"
if [ $? -ne 0 ]; then
    echo "❌ Failed to download Android Command-line Tools. Check URL or internet."
    rm -rf "${TEMP_DIR}"
    exit 1
fi

unzip "${TEMP_DIR}/commandlinetools.zip" -d "${TEMP_DIR}/extracted"
mkdir -p "${CMDLINE_TOOLS_LATEST_DIR}"
mv "${TEMP_DIR}/extracted/cmdline-tools/"* "${CMDLINE_TOOLS_LATEST_DIR}/"

rm -rf "${TEMP_DIR}"
chown -R "${USER}:${USER}" "$CMDLINE_TOOLS_DIR"
echo "✅ Android Command-line Tools installed."
echo ""

# --- Step 5: Install Android Platform Tools ---
echo "5. Installing Android Platform Tools (adb, fastboot etc.)..."
PLATFORM_TOOLS_URL="https://dl.google.com/android/repository/platform-tools-latest-linux.zip" # Updated URL (check for newer if this fails)
PLATFORM_TOOLS_DIR="${ANDROID_SDK_HOME}/platform-tools"
TEMP_DIR=$(mktemp -d -t android-pt-XXXXXXXX)

wget -O "${TEMP_DIR}/platform-tools.zip" "$PLATFORM_TOOLS_URL"
if [ $? -ne 0 ]; then
    echo "❌ Failed to download Android Platform Tools. Check URL or internet."
    rm -rf "${TEMP_DIR}"
    exit 1
fi

unzip "${TEMP_DIR}/platform-tools.zip" -d "${ANDROID_SDK_HOME}" # Unzips directly into ANDROID_SDK_HOME/platform-tools
rm -rf "${TEMP_DIR}"
chown -R "${USER}:${USER}" "$PLATFORM_TOOLS_DIR"
echo "✅ Android Platform Tools installed."
echo ""

# --- Step 6: Set Android SDK Environment Variables ---
echo "6. Setting Android SDK environment variables in ~/.zshrc..."
# Remove existing Android SDK configs to avoid duplication
sed -i '/# --- Start Android SDK Configuration ---/,/# --- End Android SDK Configuration ---/d' ~/.zshrc

# Add new configuration
cat << EOF >> ~/.zshrc
${ANCHOR_POINT}
export ANDROID_HOME="${ANDROID_SDK_HOME}"
export PATH="\$PATH:\$ANDROID_HOME/platform-tools"
export PATH="\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin"
export PATH="\$PATH:\$ANDROID_HOME/emulator" # For emulator binary if needed
# --- End Android SDK Configuration ---
EOF

# Source .zshrc to apply changes immediately
source ~/.zshrc
echo "✅ Environment variables set and applied to current session."
echo ""

# --- Step 7: Install Android SDK Components via sdkmanager ---
echo "7. Installing Android SDK Platforms and Build-Tools via sdkmanager..."
# Ensure sdkmanager is in PATH for this session
export PATH="$PATH:$ANDROID_SDK_HOME/cmdline-tools/latest/bin"

# Recommended SDK versions by Expo (adjust as needed for your project)
# As of current time (June 2025), API 34 is standard.
SDK_PLATFORMS=("platforms;android-34") # Target SDK version
BUILD_TOOLS_VERSION="build-tools;34.0.0" # Corresponding build tools version
CMAKE_VERSION="cmake;3.22.1" # Specific CMake version

# Removed "patcher;v4" as it was causing a "package not found" error.
sdkmanager --install "${SDK_PLATFORMS[@]}" "${BUILD_TOOLS_VERSION}" "${CMAKE_VERSION}" "platform-tools"
if [ $? -ne 0 ]; then
    echo "❌ Failed to install SDK components via sdkmanager. Check output above for errors."
    exit 1
fi
echo "✅ Required Android SDK platforms, build-tools, and cmake installed."
echo ""

# --- Step 8: Install Global Expo CLI and EAS CLI ---
echo "8. Installing global Expo CLI and EAS CLI..."
# As you have Node.js and npm, and prefer system-wide CLIs,
# npm install -g is the standard and correct method for these Node.js packages
# to be globally available in your system's PATH.
sudo npm install -g "${NPM_PACKAGES[@]}"
echo "✅ Global Expo CLI and EAS CLI installed."
echo ""

# --- Step 9: Final Verification ---
echo "--- Environment Setup Complete ---"
echo "Running a final verification..."
echo "ANDROID_HOME: $ANDROID_HOME"
echo "PATH includes sdkmanager: $(command -v sdkmanager)"
echo "PATH includes adb: $(command -v adb)"
echo "Java Version:"
java -version
echo "Node.js Version:"
node -v
echo "npm Version:" # Added npm version check
npm -v
echo "Expo CLI Version:"
expo --version
echo "EAS CLI Version:"
eas --version

echo ""
echo "Your Fedora environment should now be set up similarly to a CI/CD runner for Expo Android builds."
echo "You can now navigate to your Expo project directory and try running:"
echo "  eas build --platform android --profile development --local"
echo ""
