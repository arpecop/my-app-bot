/** @type {import('tailwindcss').Config} */


module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
           // Define your responsive font sizes


         },
      colors: {
              // --- Apple Inspired Dark Theme ---
              'apple-dark-elevated': '#1C1C1E',    // Elevated Platter, Menus (System Gray 6 Dark)
              'apple-dark-base': '#000000',        // Base (Window backgrounds, Sidebars)
              'apple-dark-grouped': '#1C1C1E',     // Grouped Content (Table views - System Gray 6 Dark)
              'apple-dark-content': '#2C2C2E',     // Content areas within grouped content (System Gray 5 Dark)
              'apple-dark-fill': '#3A3A3C',        // Fill color for shapes, buttons (System Gray 4 Dark)
              'apple-dark-label-primary': '#FFFFFF', // Primary labels
              'apple-dark-label-secondary': 'rgba(235, 235, 245, 0.6)', // Secondary labels (Label Color Dark)
              'apple-dark-label-tertiary': 'rgba(235, 235, 245, 0.3)', // Tertiary labels (Secondary Label Color Dark)
              'apple-dark-label-quaternary': 'rgba(235, 235, 245, 0.18)',// Quaternary labels (Tertiary Label Color Dark)
              'apple-dark-separator': 'rgba(84,84,88,0.6)', // Separator (Separator Dark)
              'apple-dark-separator-opaque': '#38383A',      // Opaque Separator (Opaque Separator Dark)

              // System Colors (Dark Mode - generally more vivid on dark backgrounds)
              'apple-dark-blue': '#0B84FF',       // System Blue Dark
              'apple-dark-green': '#30D158',      // System Green Dark
              'apple-dark-indigo': '#5E5CE6',     // System Indigo Dark
              'apple-dark-orange': '#FF9F0A',     // System Orange Dark
              'apple-dark-pink': '#FF375F',       // System Pink Dark
              'apple-dark-purple': '#BF5AF2',     // System Purple Dark
              'apple-dark-red': '#FF453A',        // System Red Dark
              'apple-dark-teal': '#64D2FF',       // System Teal Dark
              'apple-dark-yellow': '#FFD60A',     // System Yellow Dark
              'apple-dark-gray': '#8E8E93',       // System Gray Dark
              'apple-dark-gray-2': '#636366',     // System Gray 2 Dark
              'apple-dark-gray-3': '#48484A',     // System Gray 3 Dark
              'apple-dark-gray-4': '#3A3A3C',     // System Gray 4 Dark
              'apple-dark-gray-5': '#2C2C2E',     // System Gray 5 Dark
              'apple-dark-gray-6': '#1C1C1E',     // System Gray 6 Dark

              // --- Apple Inspired Light Theme ---
              'apple-light-elevated': '#FFFFFF',   // Elevated Platter, Menus (Background Elevated Light)
              'apple-light-base': '#F2F2F7',       // Base (Window backgrounds - System Gray 6 Light)
              'apple-light-grouped': '#FFFFFF',    // Grouped Content (Background Grouped Light)
              'apple-light-content': '#F2F2F7',    // Content areas within grouped content (System Gray 6 Light, if base is white, or a slightly off-white)
              'apple-light-fill': 'rgba(120, 120, 128, 0.2)', // Fill color (Fill Light)
              'apple-light-label-primary': '#000000', // Primary labels
              'apple-light-label-secondary': 'rgba(60, 60, 67, 0.6)',  // Secondary labels (Secondary Label Light)
              'apple-light-label-tertiary': 'rgba(60, 60, 67, 0.3)',   // Tertiary labels (Tertiary Label Light)
              'apple-light-label-quaternary': 'rgba(60, 60, 67, 0.18)',// Quaternary labels (Quaternary Label Light)
              'apple-light-separator': 'rgba(60,60,67,0.29)', // Separator (Separator Light)
              'apple-light-separator-opaque': '#C6C6C8',      // Opaque Separator (Opaque Separator Light)

              // System Colors (Light Mode - typically bright and clear)
              'apple-light-blue': '#007AFF',      // System Blue Light
              'apple-light-green': '#34C759',     // System Green Light
              'apple-light-indigo': '#5856D6',    // System Indigo Light
              'apple-light-orange': '#FF9500',    // System Orange Light
              'apple-light-pink': '#FF2D55',      // System Pink Light
              'apple-light-purple': '#AF52DE',    // System Purple Light
              'apple-light-red': '#FF3B30',       // System Red Light
              'apple-light-teal': '#5AC8FA',      // System Teal Light (Note: HIG often uses a bluer teal in light mode)
              'apple-light-yellow': '#FFCC00',    // System Yellow Light
              'apple-light-gray': '#8E8E93',      // System Gray Light
              'apple-light-gray-2': '#AEAEB2',    // System Gray 2 Light
              'apple-light-gray-3': '#C7C7CC',    // System Gray 3 Light
              'apple-light-gray-4': '#D1D1D6',    // System Gray 4 Light
              'apple-light-gray-5': '#E5E5EA',    // System Gray 5 Light
              'apple-light-gray-6': '#F2F2F7',    // System Gray 6 Light
            },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
