const webdriver = require("selenium-webdriver"),
    {initDriver, getDriver, quitDriver} = require("../../../library/driver"),
    {logTestingCloudUrlToTest} = require("../../../library/utils"),
    {isMaster} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding resident counter tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function PopulationRequestTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("PopulationRequest_HH", function () {
            const selectors = {
                tools: By.css("ul#root li.dropdown:nth-child(4)"),
                // todo sprachunabhaengig machen
                toolResidentCounter: By.xpath("//a[contains(.,'Population figures')]"),
                modal: By.xpath("//div[@id='window']"),
                viewport: By.css(".ol-viewport")
            };
            let driver;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    capability["sauce:options"].name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await getDriver(builder, url, resolution);
                // TODO set resolution to 26.458319045841044 for testing - coordinates below chosen for this resolution
            });

            after(async function () {
                if (capability) {
                    driver.session_.then(function (sessionData) {
                        logTestingCloudUrlToTest(sessionData.id_);
                    });
                }
            });

            afterEach(async function () {
                if (this.currentTest._currentRetry === this.currentTest._retries - 1) {
                    console.warn("      FAILED! Retrying test \"" + this.currentTest.title + "\"  after reloading url");
                    await quitDriver();
                    driver = await initDriver(builder, url, resolution);
                }
            });

            it("displays a modal dialog containing the tool elements", async () => {
                const tools = await driver.findElement(selectors.tools),
                    toolResidentCounter = await driver.findElement(selectors.toolResidentCounter);

                await driver.wait(until.elementIsVisible(tools));
                while (!await toolResidentCounter.isDisplayed()) {
                    await tools.click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                }
                await toolResidentCounter.click();

                await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal)));

                // TODO add checks for expected elements
                // wrench-icon, Text “Einwohneranzahl abfragen”, minus and remove icons
                /*
                    <div id="window" class="tool-window ui-widget-content ui-draggable" style="position: relative; max-height: 843px; display: block; overflow: auto;">
                        <div class="win-heading header">
                            <p class="buttons float-end">
                                <span class="bootstrap-icon" title="Minimieren"><i class="bi-dash-lg"></i></span>
                                <span class="bootstrap-icon" title="Schließen"><i class="bi-x-lg"></i></span>
                            <p class="buttons float-start move">
                                <span class="bootstrap-icon win-icon"><i class="bi-wrench"></i></span>
                            <p class="title move">
                                <span>Einwohneranzahl abfragen</span>
                */

                // check visibility: “Die Abfrage der Einwohnerzahl ist sowohl für die Freie Hansestadt Hamburg als auch für die Metropolregion Hamburg möglich.”
                /*
                    <div class="win-body">
                        <div>Die Abfrage der Einwohnerzahl ist sowohl für die Freie Hansestadt Hamburg als auch für die Metropolregion Hamburg möglich.</div>
                */

                // dropdown below has “Rechteck aufziehen” per default
                /*
                <div class="dropdown"><div><div class="graphical-select"><div class="dropdown-container">
                    <div class="btn-group bootstrap-select" style="width: 100%;">
                        <button type="button" class="btn dropdown-toggle btn-outline-default" data-bs-toggle="dropdown" role="button" title="Rechteck aufziehen">
                            <span class="filter-option float-start">Rechteck aufziehen</span>&nbsp;<span class="bs-caret"><span class="caret"></span></span>
                        </button>
                        <div class="dropdown-menu open" role="combobox">
                            <ul class="dropdown-menu inner" role="listbox" aria-expanded="false">
                                <li data-original-index="1" class="selected"><a tabindex="0" class="" data-tokens="null" role="option" aria-disabled="false" aria-selected="true">
                                    <span class="text">Rechteck aufziehen</span><span class="bootstrap-icon check-mark"><i class="bi-check-lg"></i></span></a>
                                </li>
                                <li data-original-index="2"><a tabindex="0" class="" data-tokens="null" role="option" aria-disabled="false" aria-selected="false">
                                    <span class="text">Kreis aufziehen</span><span class="bootstrap-icon check-mark"><i class="bi-check-lg"></i></span></a>
                                </li>
                                <li data-original-index="3"><a tabindex="0" class="" data-tokens="null" role="option" aria-disabled="false" aria-selected="false">
                                    <span class="text">Fläche zeichnen</span><span class="bootstrap-icon check-mark"><i class="bi-check-lg"></i></span></a>
                                </li>
                            </ul>
                        </div>
                        <select class="selectpicker" title="Rechteck aufziehen" tabindex="-98"><option class="bs-title-option" value="">Rechteck aufziehen</option>
                            <option value="Rechteck aufziehen">Rechteck aufziehen</option>
                            <option value="Kreis aufziehen">Kreis aufziehen</option>
                            <option value="Fläche zeichnen">Fläche zeichnen</option>
                */

                // Text “Raster Layer anzeigen (ab 1: 100.000)”, & checkbox to the right “Aus”
                // Text “ALKIS Adressen anzeigen (ab 1: 20.000)”, & checkbox to the right “Aus”.
                /*
                    <div class="checkbox"><div class="checkbox-container"><div class="form-inline">
                        <div class="title-checkbox float-start">
                            <label>Raster Layer anzeigen (ab 1: 100.000)</label>
                            <div class="toggle btn btn-outline-default off btn-sm" data-bs-toggle="toggle" style="width: 63.9167px; height: 31px;">
                                <input type="checkbox" title="Filter ausschalten" data-bs-toggle="toggle"><div class="toggle-group">
                                <label class="btn btn-primary btn-sm toggle-on">An</label><label class="btn btn-outline-default btn-sm active toggle-off">Aus</label>
                                <span class="toggle-handle btn btn-outline-default btn-sm"></span></div></div>
                        </div>
                    </div>
                    </div><div class="checkbox-container"><div class="form-inline">
                        <div class="title-checkbox float-start">
                            <label>ALKIS Adressen anzeigen (ab 1: 20.000)</label>
                            <div class="toggle btn btn-outline-default off btn-sm" data-bs-toggle="toggle" style="width: 63.9167px; height: 31px;">
                                <input type="checkbox" title="Filter ausschalten" data-bs-toggle="toggle"><div class="toggle-group">
                                <label class="btn btn-primary btn-sm toggle-on">An</label><label class="btn btn-outline-default btn-sm active toggle-off">Aus</label>
                                <span class="toggle-handle btn btn-outline-default btn-sm"></span></div></div>
                        </div>
                    </div>
                */
            });

            // it("allows drawing a rectangle in FHH, resulting in resident count with hints", async () => {
            // use [ 565874, 5934140 ]
            // 5.18.2 Mit der Maus Rechteck innerhalb der FHH aufziehen
            // -> Einwohnerzahl in Hamburg wird berechnet und im Fenster “Einwohneranzahl abfragen” unterhalb des dropdown Feldes angezeigt.
            // -> Es ist der Text “Unter Berücksichtigung der Geheimhaltung wurde folgender Wert berechnet:” unter dem dropdown Feld zu sehen.
            // -> Darunter folgt “Einwohnerzahl in Hamburg:” mit dem Wert ganz rechts.
            // Darunter folgt §Größe der abgefragten Fläche:” mit dem Wert ganz rechts. -> Darunter ist der Hinweistext zu sehen: “Hinweis: Aus Datenschutzgründen werden kleine Fallzahlen unter 3 verändert.
            // Datenquelle Hamburg: Einwohner mit Hauptwohnsitz, Melderegister 31.12.2017.
            // Quelle FHH”
            // -> Die Quelle ist ein Link zu http://metaver.de/trefferanzeige?docuuid=B3FD9BD5-F614-433F-A762-E14003C300BF.
            /*
                    <div class="result"><div>
                        <div class="heading additional-text">Unter Berücksichtigung der Geheimhaltung wurde folgender Wert berechnet:</div>
                        <table class="table">
                                <tbody><tr>
                                    <td>Einwohnerzahl in Hamburg:</td>
                                    <td>5.757</td>
                                </tr>
                                <tr>
                                    <td>Größe der abgefragten Fläche:</td>
                                    <td>96 ha</td>
                                </tr>
                        </tbody></table>
                            <div class="hinweis additional-text">
                                <span>Hinweis:</span> Aus Datenschutzgründen werden kleine Fallzahlen unter 3 verändert.
                                <br>
                                <!--Datum 31.12.2017-->
                                <span>Datenquelle Hamburg:</span> Einwohner mit Hauptwohnsitz, Melderegister .
                            </div>
                            <div><a target="_blank" href="http://metaver.de/trefferanzeige?docuuid=B3FD9BD5-F614-433F-A762-E14003C300BF">Quelle FHH</a></div>
                    </div></div>
                */
            // });

            // it("allows drawing a rectangle in FHH and MRH, resulting in two separate resident counts with hints", async () => {
            // use [ 575411.7063755343, 5917957.621575815 ]
            // 5.18.3. Rechteck aufziehen sodass es in FHH und MRH liegt (1h)
            // -> Einwohnerzahl in Hamburg wird berechnet.
            // -> Einwohnerzahl in der MRH wird berechnet und unterhalb von Hamburg angezeigt.
            // -> Größe der Fläche wird angezeigt.
            // -> Datenquelle FHH ist vorhanden.
            // -> Datenquelle MRH ist vorhanden.
            /*
                <div class="result"><div>
                    <div class="heading additional-text">Unter Berücksichtigung der Geheimhaltung wurde folgender Wert berechnet:</div>
                    <table class="table">
                        <tbody><tr>
                            <td>Einwohnerzahl in Hamburg:</td>
                            <td>55.147</td>
                        </tr>
                        <tr>
                            <td>Einwohnerzahl in der Metropolregion ohne Hamburg:</td>
                            <td>56.075</td>
                        </tr>
                        <tr>
                            <td>Größe der abgefragten Fläche:</td>
                            <td>209 km²</td>
                        </tr></tbody>
                    </table>
                    <div class="hinweis additional-text">
                        <span>Hinweis:</span> Aus Datenschutzgründen werden kleine Fallzahlen unter 3 verändert.
                        <br>
                        <!--Datum 31.12.2017-->
                        <span>Datenquelle Hamburg:</span> Einwohner mit Hauptwohnsitz, Melderegister .
                    </div>
                    <div><a target="_blank" href="http://metaver.de/trefferanzeige?docuuid=B3FD9BD5-F614-433F-A762-E14003C300BF">Quelle FHH</a></div>
                    <div class="hinweis additional-text">
                    <!--Datum 09.05.2011-->
                    <span>Datenquelle Metropolregion ohne Hamburg:</span> Bevölkerung insgesamt im 100 Meter-Gitter, Zensus 2011. Stand der Zensus-Daten 09.05.2011.
                </div>
                <div><a target="_blank" href="http://metaver.de/trefferanzeige?docuuid=46969C7D-FAA8-420A-81A0-8352ECCFF526">Quelle MRH</a></div><a target="_blank" href="http://metaver.de/trefferanzeige?docuuid=46969C7D-FAA8-420A-81A0-8352ECCFF526">
                */
            // });

            // it("allows drawing a rectangle in MRH, resulting in resident count with hints", async () => {
            // use [ 595081.9813794381, 5901967.668119612 ]
            // 5.18.4. Rechteck aufziehen sodass es nur in der MRH liegt (1h)
            // -> Einwohnerzahl in der MRH wird berechnet
            // -> Größe der Fläche wird angezeigt.
            // -> Datenquelle MRH ist vorhanden.

            /*
                <div class="result"><div>
                <div class="heading additional-text">Unter Berücksichtigung der Geheimhaltung wurde folgender Wert berechnet:</div>
                <table class="table">
                    <tbody><tr>
                        <td>Einwohnerzahl in der Metropolregion ohne Hamburg:</td>
                        <td>1.760</td>
                    </tr>
                    <tr>
                        <td>Größe der abgefragten Fläche:</td>
                        <td>13 km²</td>
                    </tr>
                </tbody></table>
                <div class="hinweis additional-text">
                    <!--Datum 09.05.2011-->
                    <span>Datenquelle Metropolregion ohne Hamburg:</span> Bevölkerung insgesamt im 100 Meter-Gitter, Zensus 2011. Stand der Zensus-Daten 09.05.2011.
                </div>
                <div><a target="_blank" href="http://metaver.de/trefferanzeige?docuuid=46969C7D-FAA8-420A-81A0-8352ECCFF526">Quelle MRH</a></div><a target="_blank" href="http://metaver.de/trefferanzeige?docuuid=46969C7D-FAA8-420A-81A0-8352ECCFF526">
                */
            // });

            // it("allows drawing a rectangle outside MRH, resulting in an alert message", async () => {
            // use [ 644587.2725996148, 5857114.771826906 ]
            // 5.18.5. Rechteck aufziehen sodass es außerhalb der MRH liegt (Bsp. Celle) (1h)
            // --> Alert mit Fehlermeldung "Suchgebiet liegt nicht in dem Gebiet der Metropolregion Hamburg; Bitte Suchgebiet anpassen" erscheint
            /*
                <div id="messages" class="top-center">
                    <div id="813" class="alert alert-info alert-dismissable" role="alert">
                    <button type="button" class="close" data-bs-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                    <p>
                        "Suchgebiet liegt nicht in dem Gebiet der Metropolregion Hamburg; Bitte Suchgebiet anpassen"
                */
            // });

            // it("allows drawing a a circle in FHH, resulting in resident count with hints", async () => {
            // 5.18.6. In dropdown Feld “Kreis aufziehen” auswählen und in der Karte in der FHH einen Kreis aufziehen (30m)
            // -> Einwohneranzahl für den Kreis wird berechnet und angezeigt.
            // -> Größe der Kreisfläche wird angezeigt in Fenster und Karte.
            // ->Die Datenquelle “Quelle FHH” wird angezeigt.
            // TODO reported as bug - should also check geometry
            // });

            // it("allows drawing a a polygon in FHH, resulting in resident count with hints", async () => {
            // 5.18.7. In dropdown Feld “Fläche Zeichnen” auswählen und eine Fläche in der FHH zeichnen (30m)
            // -> Einwohneranzahl für die Fläche wird berechnet und angezeigt.
            // -> Größe der fläche wird angezeigt in Fenster und Karte.
            // TODO reported as bug - should also check geometry
            // });
        });
    }
}

module.exports = PopulationRequestTests;
