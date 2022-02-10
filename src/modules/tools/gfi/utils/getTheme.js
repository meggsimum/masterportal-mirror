import upperFirst from "../../../../utils/upperFirst";

/**
 * @param {String[]} addonThemes List of names of themes defined in addons.
 * @param {String} configTheme The configured theme.
 * @param {String} configThemeWithSuffix The configured theme with suffix 'theme'.
 * @returns {String} The theme name.
 */
function getAddonTheme (addonThemes, configTheme, configThemeWithSuffix) {
    let theme;

    if (addonThemes.includes(configTheme)) {
        theme = configTheme;
    }
    else if (addonThemes.map(addon => addon.slice(-5) === "Theme" ? addon : `${addon}Theme`).includes(configThemeWithSuffix)) {
        theme = configThemeWithSuffix;
    }
    else {
        console.warn(String("The gfi theme '" + configTheme + "' could not be found, the default theme will be used. Please check your configuration!"));
        theme = "DefaultTheme";
    }

    return theme;
}

/**
 * Returns the right gfi Theme
 * it check if the right Theme (Component) is there, if yes just use this component, otherwise use the default theme
 * @param {String|Object} themeFromFeature configured theme
 * @param {Object} components components of the theme template
 * @param {String[]} addonThemes list of names of themes defined in addons
 * @returns {String} the name of the gfi Theme
 */
function getTheme (themeFromFeature, components, addonThemes) {
    const gfiComponents = Object.keys(components),
        configTheme = upperFirst(themeFromFeature && typeof themeFromFeature === "object" ? themeFromFeature.name : themeFromFeature),
        configThemeWithSuffix = configTheme.slice(-5) === "Theme" ? configTheme : `${configTheme}Theme`;
    let theme = "";

    if (gfiComponents && gfiComponents.length && gfiComponents.includes(configThemeWithSuffix)) {
        theme = configThemeWithSuffix;
    }
    else if (addonThemes) {
        theme = getAddonTheme(addonThemes, configTheme, configThemeWithSuffix);
    }
    else {
        console.warn(String("The gfi theme '" + configTheme + "' could not be found, the default theme will be used. Please check your configuration!"));
        theme = "DefaultTheme";
    }

    return theme;
}

export default getTheme;
