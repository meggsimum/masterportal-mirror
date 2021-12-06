#### Beschreibung
Hier tauchen alle Funktionen auf, die sich unter dem Menüpunkt "Werkzeuge" befinden.
Die Einträge werden in einer Liste verwaltet. Jeder Eintrag hat einen Titel, ein Icon
und "Aktivierungs-Attribut" (default = false). Alle Attribute sind optional und werden über
die config.json gesteuert. Die Konfiguration gibt die Reihenfolge der Tools in der Werkzeuge-Liste
im Portal wieder.

Alle Tools sind in der config.json unter “Portalconfig.menu.tools.children” aufgelistet. Hier finden Sie eine Auswahl:

* parcelSearch (Flurstückssuche)
* gfi (GetFeatureInfo)
* coordToolkit (Koordinaten Abfrage und Koordinatesuche)
* print (Drucken)
* measure (Messen)
* draw (Zeichnen)
* record (WFS-T)

#### Konfiguration

```js
{
    "tools": {
        "parcelSearch": {
            "title": "Flurstückssuche",
            "icon": "bi-search"
        },
        "gfi": {
            "title": "Informationen abfragen",
            "icon": "bi-info-circle-fill",
            "active": true
        },
        "coordToolkit": {},
        // ...
    }
}
```
