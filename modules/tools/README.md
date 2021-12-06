# README

## Description

All tools appearing in the menu "tools" are located in this folder. Entries are maintained in a list. Each list entry has a title, a icon, and an active state (default: `false`). All attributes are optional and controlled in the `config.json` file. The order of tools in the configuration file determines the order of tools in the portal UI.

### A selection of available tools

For a complete list, please see chapter *Portalconfig.menu.tools.children* in the `config.json` file.

* parcelSearch (Parcel search)
* gfi (GetFeatureInfo)
* supplyCoord (Coordinate request)
* print (Printing)
* measure (Measuring)
* draw (Drawing)
* record (WFS-T)

## Configuration

```js
{
    "tools": {
        "parcelSearch": {
            "title": "Parcel search",
            "icon": "bi-search"
        },
        "gfi": {
            "title": "Request information",
            "icon": "bi-info-circle-fill",
            "active": true
        },
        "supplyCoord": {},
        // ...
    }
}
```
