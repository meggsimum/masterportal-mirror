const fs = require("fs-extra"),
    execute = require("child-process-promise").exec,

    path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),

    replaceStrings = require(path.resolve(rootPath, "devtools/tasks/replace")),
    prependVersionNumber = require(path.resolve(rootPath, "devtools/tasks/prependVersionNumber")),
    mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))(),

    distPath = path.resolve(rootPath, "dist/"),
    buildTempPath = path.resolve(distPath, "build/"),
    mastercodeVersionPath = path.resolve(distPath, "mastercode/", mastercodeVersionFolderName);

/**
 * remove files if if they already exist.
 * @param {Array} allPortalPaths all source paths of all portals to be built
 * @returns {void}
 */
function buildSinglePortal (allPortalPaths) {
    let sourcePortalPath = [];

    if (allPortalPaths.length === 0) {
        return;
    }

    sourcePortalPath = allPortalPaths.pop();
    // MASTERPORTAL_DISTRIBUTION_RUN has to be set true in repository portalconfigs/bitbucket-pipelines.yml, for a distribution run of masterportal
    // BITBUCKET_BRANCH is appended to portalName, if usual e2e-tests are running
    /* eslint-disable-next-line no-process-env */
    const appendix = process.env.BITBUCKET_BRANCH && process.env.MASTERPORTAL_DISTRIBUTION_RUN !== "true" ? "_" + process.env.BITBUCKET_BRANCH.replace(/\//g, "_") : "",
        portalName = sourcePortalPath.split(path.sep).pop(),
        distPortalPath = path.resolve(distPath, portalName + appendix);

    fs.remove(distPortalPath).then(() => {
        // console.warn("NOTE: Deleted directory \"" + distPortalPath + "\".");
        fs.copy(sourcePortalPath, distPortalPath).then(() => {
            // console.warn("NOTE: Copied \"" + sourcePortalPath + "\" to \"" + distPortalPath + "\".");
            replaceStrings(distPortalPath);
            buildSinglePortal(allPortalPaths);
        }).catch(error => console.error(error));
    }).catch(function (err) {
        throw new Error("ERROR", err);
    });
}

/**
 * start the build process with webpack
 * @param {Object} answers contains the attributes for the portal to be build
 * @returns {void}
 */
module.exports = function buildWebpack (answers) {
    const
        sourcePortalsFolder = path.resolve(rootPath, answers.portalPath),
        cliExecCommand = "webpack --config devtools/webpack.prod.js";

    let allPortalPaths = [];


    if (!fs.existsSync(sourcePortalsFolder)) {
        console.error("---\n---");
        throw new Error("ERROR: PATH DOES NOT EXIST \"" + sourcePortalsFolder + "\"\nABORTED...");
    }

    allPortalPaths = fs.readdirSync(sourcePortalsFolder)
        .map(name => path.join(sourcePortalsFolder, name))
        .filter(name => fs.lstatSync(name).isDirectory() && !name.endsWith(".git"));

    // console.warn("NOTICE: executing command \"" + cliExecCommand + "\"");
    console.warn("NOTICE: Building portals. Please wait...");

    // Comment out following 4 lines if you want only copy without build (you must already have a build)
    fs.remove(buildTempPath).catch(error => console.error(error));
    execute(cliExecCommand).then(function (result) {
        console.warn(result.stdout);
        prependVersionNumber(path.resolve(buildTempPath, "js/masterportal.js"));
        // ^^^

        fs.remove(mastercodeVersionPath).then(() => {
            // console.warn("NOTE: Deleted directory \"" + mastercodeVersionPath + "\".");

            fs.copy("./img", mastercodeVersionPath + "/img").then(() => {
                // console.warn("NOTE: Copied \"./img\" to \"" + mastercodeVersionPath + "\".");

                fs.copy("./locales", mastercodeVersionPath + "/locales").then(() => {

                    fs.copy(buildTempPath, mastercodeVersionPath).then(() => {
                        // console.warn("NOTE: Copied \"" + buildTempPath + "\" to \"" + mastercodeVersionPath + "\".");

                        replaceStrings(mastercodeVersionPath);
                    }).catch(error => console.error(error));
                }).catch(error => console.error(error));
            }).catch(error => console.error(error));
        }).catch(error => console.error(error));

        buildSinglePortal(allPortalPaths);

    // Comment out following line if you want only copy without build
    }).catch(error => console.error(error));
    // ^^^
};
