export const wfsFilterQuery = `<?xml version="1.0" encoding="UTF-8"?>
<wfs:GetFeature service="WFS" version="1.1.0" xmlns:app="http://www.deegree.org/app" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc">
    <wfs:Query typeName="app:staatliche_schulen">
        <ogc:Filter>
            <ogc:And>
                <ogc:PropertyIsEqualTo>
                    <ogc:PropertyName>app:kapitelbezeichnung</ogc:PropertyName>
                    <ogc:Literal>Grundschulen</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:PropertyIsGreaterThan>
                    <ogc:PropertyName>app:zuegigkeit_kl_1</ogc:PropertyName>
                    <ogc:Literal>0</ogc:Literal>
                </ogc:PropertyIsGreaterThan>
            </ogc:And>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>`;