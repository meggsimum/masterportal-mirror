>**[Return to the Masterportal documentation](doc.md)**.

# QuickHelp Documentation

This documentation describes how the QuickHelp window of the Masterportal can be modified, extended and new QuickHelp windows can be created.
The QuickHelp window - if activated - is currently integrated in three places in the Masterportal by default.

1. At the Top on the right side of the search bar as ?-button (hereinafter referred to as "search" QuickHelp).
2. When using the "custom" topic tree type, when you expand the topic tree, the ?-icon at the very top of the topic tree (hereafter called "tree" QuickHelp).
3. In the routing tool.

All default QuickHelp windows are given standard content in all languages available for the Masterportal.


## Structure of this documentation

[TOC]


## First part - activate the QuickHelp

The default QuickHelp is activated in the config.js file of your portal.
Here, an additional entry in the config object {quickHelp: true} is needed.
This activates the standard "search" and "tree" QuickHelp.

```json
const Config = {
    // (...)
    "quickHelp": true,
    // (...)
};
```


### set the image path

With the simple {"quickHelp": true} only, the QuickHelp is displayed without screenshots and looks broken.

- You can remove the broken default images ([see third part](#markdown-header-complex-addition-of-content)).
- Or you can store them for correct display and link them correctly.

To link the standard images correctly create the images ([see image table](#markdown-header-default-images)) and set the basic path to the images by using an object instead of the simple {"quickHelp": true}.

In the following example, the images are loaded from the LGV Hamburg servers and the screenshots are displayed correctly. You can use this setting for your project, but you woun't be able to change our screenshots.
If you have your own server, create your own screenshots or download the images ([see image table](#markdown-header-default-images)), upload them to your server and adjust the imgPath in config.js.

```json
const Config = {
    // (...)
    "quickHelp": {
        "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
    },
    // (...)
};
```


### rename the images

The QuickHelp uses standard images. The image names are mostly in German language. If you want to create your own images/screenshots in your own language, change the imgPath to point to one of your servers and create new images as you like.

You can overconfigure any default image name by using the respective image key. A list of usable image keys can be found [here](#markdown-header-default-images).

Example:

```json
const Config = {
    // (...)
    "quickHelp": {
        "imgPath": "https://example.com/myFolder/",
        "searchbarAllgemeines1": "labusca_común.png",
        "searchbarAllgemeines2": "labusca_común2.png"
    },
    // (...)
};
```


## Second part - removing the default content

Each section in the prepared standard contents of the QuickHelp windows can be removed using its Section Key.
A list of all available Section Keys are listed [here](#markdown-header-section-keys).

For example, if you want to remove the first section of the "search" QuickHelp, use the Section Key "generalInfo".
To do this, open your config.json and use the "quickHelp" element at the highest structure level to manipulate the QuickHelp window.

```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "content": [
                        {"hide": "generalInfo"}
                    ]
                }
            }
        },
        // (...)
    }
}
```


## Third part - adding your own sections

You can extend the default content via config.json as you like and change already existing sections by a delete-add combination.


### Easy addition of content

To add new content as section to existing content, you can add a section object with "title" and a list "list" of paragraphs and images to config.json.
The new section is inserted at the end of the existing content.

Here is the example of a simple add of a new section at the end of the "search" QuickHelp.

```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "content": [
                        {
                            "title": "Title of the new section",
                            "list": [
                                {
                                    "text": "This is the first paragraph.",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                },
                                {
                                    "text": "This is the second <i>paragraph</i> with html content.",
                                    "type": "text/html"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // (...)
    }
}
```


### Complex addition of content

You can insert new sections into the standard QuickHelp at any position if you use the "before" and "after" attributes with the appropriate Section Keys ([see Section Keys](#markdown-header-section-keys)).
 
Here is the example of adding a new section after the first section with Section Key "generalInfo" into the default "search" QuickHelp.

```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {-
            "configs": {
                "search": {
                    "content": [
                        {
                            "after": "generalInfo",
                            "title": "Title of the new section",
                            "list": [
                                {
                                    "text": "This is the first paragraph.",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                },
                                {
                                    "text": "This is the second <i>paragraph</i> with html content.",
                                    "type": "text/html"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // (...)
    }
}
```


### Replacing content

You can replace existing sections with new content by adding your content and removing old sections.

Here is an example of adding a section identical to "generalInfo" - only without screenshots - and then removing the old "generalInfo" section from the content.

```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "content": [
                        {
                            "after": "generalInfo",
                            "title": "common:modules.quickHelp.search.generalInfo",
                            "list": [
                                {
                                    "text": "common:modules.quickHelp.search.generalInfoHelp1",
                                    "type": "text/html"
                                },
                                {
                                    "text": "common:modules.quickHelp.search.generalInfoHelp2",
                                    "type": "text/html"
                                }
                            ]
                        },
                        {
                            "hide": "generalInfo"
                        }
                    ]
                }
            }
        },
        // (...)
    }
}
```


## Fourth part - creating a new QuickHelp window

You can create and fill completely new custom QuickHelp windows with content via your config.json and attach them to any element (e.g. a button) in the Masterportal. You may want to use your own addon or help to improve the core with new features.


### Connection of QuickHelp to the portal logic

In the code, use the VueX store and activate the desired QuickHelp via a specific store commit.

Here is an example of a function that sets the QuickHelp to the "search" content and opens or closes it.

```javascript
import store from "./src/app-store/index";

export default function toggleQuickHelpOfSearchBar () {
    if (!store.getters["QuickHelp/active"]) {
        store.commit("QuickHelp/setQuickHelpKey", "search");
        store.commit("QuickHelp/setActive", true);
    }
    else {
        store.commit("QuickHelp/setActive", false);
    }
}
```


### Integration of a custom QuickHelp into the portal logic

Combining a custom function that can enable/disable QuickHelp via the VueX store and creating entirely new content in config.json, you can generate an arbitrary QuickHelp window.

Here is an example of the configuration and activation of a new QuickHelp window "testhelp" via code and config.json:

code:
```javascript
import store from "./src/app-store/index";

export default function toggleQuickHelpOfSearchBar () {
    if (!store.getters["QuickHelp/active"]) {
        store.commit("QuickHelp/setQuickHelpKey", "testhelp");
        store.commit("QuickHelp/setActive", true);
    }
    else {
        store.commit("QuickHelp/setActive", false);
    }
}
```

config.json:
```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "testhelp": {
                    "title": "Test help",
                    "content": [
                        {
                            "title": "Title of the first section",
                            "list": [
                                {
                                    "text": "This is a completely new paragraph.",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                }
                            ]
                        },
                        {
                            "title": "Title of the second section",
                            "list": [
                                {
                                    "text": "This is an <b>even more recent</b> paragraph.",
                                    "type": "text/html"
                                },
                                {
                                    "imgName": "allgemein.png",
                                    "imgPath": "https://geodienste.hamburg.de/lgv-config/img/"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // (...)
    }
}
```


### Request existence of QuickHelp

You may want to show your QuickHelp open button only if QuickHelp is configured to be displayed.
The QuickHelp can be deactivated by setting it to {"quickHelp": false} in the config.js.

To request the state, use the getter for QuickHelp isSet in the VueX store:
```javascript
import store from "./src/app-store/index";

export default function isQuickHelpEnabled () {
    return store.getters["QuickHelp/isSet"];
}
```


## Part Five - Pitfalls, Tips & Tricks

In this part we go into things worth knowing, some of which have been omitted from the rest of this documentation due to their complexity.


### Pitfall: Removing a section before adding a section

If you want to insert a new section before or after an existing section (with "before" or "after"), but first remove the existing section you are referring to (with "hide"), the new section will not be displayed.

**This is a false example (!).** The section "generalInfo" is not displayed.
```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "content": [
                        {
                            "hide": "generalInfo"
                        },
                        {
                            "after": "generalInfo",
                            "title": "False example! This section is never displayed as its reference is hidden before.",
                            "list": [
                                "common:this.is.never.displayed.anyway"
                            ]
                        }
                    ]
                }
            }
        },
        // (...)
    }
}
```


### Pitfall: Use of translation keys

If you prefer to use translation keys instead of plain text, you can simply insert it as value for the text attribute of paragraph elements.
Please note the specification of the correct namespace ("common:" for core, "additional:" for addons) and that the text is available in language files in the different languages of your project.


### Tips & Tricks: Translation keys and interpolation

When using translation keys, it may happen that you want to use a so-called "interpolation". Interpolation for translations is the inclusion of a variable into the translation.

Here is an example of the correct use of interpolation in a QuickHelp paragraph:

```json
// additional Translation file
{
    "addons": {
        "myAddon": {
            "quickHelp": {
                "info": "If you see this icon (<span class=\"{{iconCls}}\"></span>) you are good to go."
            }
        }
    }
}

// config.json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "content": [
                        {
                            "title": "Yet another Title",
                            "list": [
                                {
                                    "text": "additional:addons.myAddon.quickHelp.info",
                                    "type": "text/html",
                                    "interpolation": {
                                        "iconCls": "bi-info-circle-fill"
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // (...)
    }
}

```


### Tips & Tricks: Shortened spelling

You can abbreviate/shorten the paragraphs notation if your paragraph is "text/plain" (has no html in it).
You can also abbreviate/shorten the image notation if you want the image to use the imgPath in config.js of the QuickHelp.

Note that free text must always be specified as object {text, type}, because only translation keys are automatically recognized and converted to a "text/plain" object.
Also note that image names that have a ":" in their file name (imgName) must be specified as image object {imgName, imgPath}, otherwise they will be misinterpreted as translation key.

The following two examples are identical in their outcome (with different titles only):

Example A:
```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "content": [
                        {
                            "title": "This is an example of a simplified notation.",
                            "list": [
                                "common:modules.quickHelp.search.generalInfoHelp1",
                                "an_image_that_is_on_imgPath.jpg"
                            ]
                        }
                    ]
                }
            }
        },
        // (...)
    }
}
```

Example B:
```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "content": [
                        {
                            "title": "This is an example that corresponds to the simplified example shown above.",
                            "list": [
                                {
                                    "text": "common:modules.quickHelp.search.generalInfoHelp1",
                                    "type": "text/plain"
                                },
                                {
                                    "imgName": "an_image_that_is_on_imgPath.jpg",
                                    "imgPath": "https://default_url_to_imgPath_in_config.js/"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // (...)
    }
}
```


### Tips & Tricks: Your own Hashtags

If you click on the headings tabs in your newly created QuickHelp window (should jump down to the section in doing so), you will see the addition of a hashtag (e.g. "#info-239") in the url of the browser.
These are unique keys that are automatically generated by QuickHelp as jump markers.
If you want to get control over these hashtags, instead of a content array, specify a content object with the desired hash values as keys.

In the following example clicking on the second tab ("Title of the second section"), the browser will jump to the second section using "#yourOwnHashtagB" as hashtag in the browser url.

```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "testhelp": {
                    "title": "This is a test with hashtags as content keys.",
                    "content": {
                        "yourOwnHashtagA": {
                            "title": "Title of the first section",
                            "list": [
                                // (...)
                            ]
                        },
                        "yourOwnHashtagB": {
                            "title": "Title of the second section",
                            "list": [
                                // (...)
                            ]
                        }
                    }
                }
            }
        },
        // (...)
    }
}
```


### Tips & Tricks: Change the title

You can change the title of an existing QuickHelp with a new title using the "title" key. The default search QuickHelp will stay as it is in the following example, only the general title of the QuickHelp window is altered:

```json
{
    "Portalconfig": {
        // (...)
        "quickHelp": {
            "configs": {
                "search": {
                    "title": "Changed title of search QuickHelp"
                }
            }
        }
    }
}
```


### Tips & Tricks: Open the QuickHelp via url

You can conveniently open the QuickHelp by url by using the standard functions of the Masterportal to set the VueX store by url.

Example:
```
https://www.geoportal-hamburg.de/bildungsatlas/?QuickHelp/active=true

```

If you have built your own QuickHelp or you want to open a specific QuickHelp, set the "quickHelpKey" the same way.

Examples:
```
https://www.geoportal-hamburg.de/bildungsatlas/?QuickHelp/quickHelpKey=tree&QuickHelp/active=true
https://www.geoportal-hamburg.de/bildungsatlas/?QuickHelp/quickHelpKey=routing&QuickHelp/active=true

https://www.geoportal-hamburg.de/bildungsatlas/?QuickHelp/quickHelpKey=myOwnQuickHelp&QuickHelp/active=true
```


## Tables

The following tables contain contents for a quick overview. In other parts of this documentation, the meaning of these tables and their usage is discussed.


### Section Keys

Section Keys are Strings used to identify the sections of existing QuickHelp content.

|"search" QuickHelp Section Keys|
|-------------------------------|
|generalInfo|
|addressSearch|
|houseNumberHelp|
|topicSearchHelp|
|parcelSearch|

|"tree" QuickHelp Section Keys|
|-----------------------------|
|generalInfo|
|topics|
|selection|
|saveSelection|

|"routing" QuickHelp Section Keys|
|-----------------------------|
|generalInfo|
|routePlanning|
|routingBatchProcessing|
|isochrones|
|isochronesBatchProcessing|

### Default Images

See **[config.js documentation](config.js.md)** for similar details.

Default images are used for existing content. This is a list of these images.
For historical reasons the image keys and names are in German language.
You may use image names in your own language, but the keys are fix.

|Key|"search" QuickHelp Images|
|---|-------------------------|
|searchbarAllgemeines1|https://geodienste.hamburg.de/lgv-config/img/allgemein.png|
|searchbarAllgemeines2|https://geodienste.hamburg.de/lgv-config/img/allgemein_2.png|
|searchbarAllgemeines3|https://geodienste.hamburg.de/lgv-config/img/allgemein_3.png|
|searchbarFlurstueckssuche|https://geodienste.hamburg.de/lgv-config/img/allgemein_4.png|

|Key|"tree" QuickHelp Images|
|---|-----------------------|
|aufbau1|https://geodienste.hamburg.de/lgv-config/img/themen.png|
|aufbau2|https://geodienste.hamburg.de/lgv-config/img/themen_2.png|

|Key|"routing" QuickHelp Images|
|---|--------------------------|
|routingTool1|https://geodienste.hamburg.de/lgv-config/img/routing_1.png|
|routingTool2|https://geodienste.hamburg.de/lgv-config/img/routing_2.png|
|routingTool3|https://geodienste.hamburg.de/lgv-config/img/routing_3.png|
|routingTool4|https://geodienste.hamburg.de/lgv-config/img/routing_4.png|
|routingTool5|https://geodienste.hamburg.de/lgv-config/img/routing_5.png|
|routingTool6|https://geodienste.hamburg.de/lgv-config/img/routing_6.png|
|routingTool7|https://geodienste.hamburg.de/lgv-config/img/routing_7.png|
|routingTool8|https://geodienste.hamburg.de/lgv-config/img/routing_8.png|
|routingTool9|https://geodienste.hamburg.de/lgv-config/img/routing_9.png|
|routingTool10|https://geodienste.hamburg.de/lgv-config/img/routing_10.png|
|routingTool11|https://geodienste.hamburg.de/lgv-config/img/routing_11.png|
|routingTool12|https://geodienste.hamburg.de/lgv-config/img/routing_12.png|
|routingTool13|https://geodienste.hamburg.de/lgv-config/img/routing_13.png|
|routingTool14|https://geodienste.hamburg.de/lgv-config/img/routing_14.png|
|routingTool15|https://geodienste.hamburg.de/lgv-config/img/routing_15.png|
|routingTool16|https://geodienste.hamburg.de/lgv-config/img/routing_16.png|
