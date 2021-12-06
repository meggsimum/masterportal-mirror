# backbone Addons #

ACHTUNG: das masterportal wird vom Backbone nach Vue.js migriert. Daher ist es ratsam neue addons in vue.js zu schreiben, um die später notwendige Migrierung zu vermeiden! [Vue Addons]()

Um eigene Entwicklungen in das MasterPortal zu integrieren existiert ein Mechanismus der es erlaubt, Code von außerhalb des MasterPortal-Repositories in die MasterPortal Sourcen zu integrieren. Siehe auch **[lokale Entwicklungsumgebung einrichten](setup-dev.md)**.

Dadurch werden die Models der externen Sourcen erst ganz zum Schluß initialisiert. Es wird temporär ein Platzhalter-Model in der Model-List angelegt.

Die View-Klasse der externen Sourcen muss das zugehörige Model neu anlegen. Dieses wird dann in der Model-Liste mit dem Platzhalter-Model ausgetauscht.

Das Addon selbst ist identisch wie ein natives Modul zu programmieren (siehe auch **[Tutorial 01: Ein neues Modul erstellen (Scale Switcher)](02_tutorial_new_module_scale_switcher.md)**). Es liegt lediglich außerhalb des Repository und erlaubt so eine getrennte Verwaltung.

Alle Addons liegen in einem Ordner namens "addons" auf Root-Ebene des Masterportals. Beliebig viele dieser Addons lassen sich in einem Portal in der **[config.js](config.js.md)** konfigurieren.

Folgende Struktur ist dabei zu beachten:

## 1. Dateistruktur von Addons ##

1.1. Jedes *Addon* liegt in einem eigenen Ordner, welcher so heißt, wie in **addonsConf.json** als key definiert. In diesen Ordnern liegen alle für die jeweiligen *Addons* benötigten Dateien. Dazu gehören auch die Ordner **doc**, **jsdoc** und **unittests** mit den jeweiligen **.md**, **.js** und **.test.js** Dateien.
Es ist möglich, dass Addons eine eigene `package.json` Datei besitzen, um weitere Dependencies zu definieren.

#### Beispiel entsprechende Ordnerstruktur ####
```
myMasterPortalFolder/
    addons/
        myAddon1/
            view.js
            model.js
            doc/
                config.json.md
            jsdoc/
                events.js
                namespaces.js
            unittests/
                model.test.js
            package.json
            [...]
        myAddon2/
            subFolder/
                init.js
                [...]
            doc/
                beschreibung.md
            jsdoc/
                events.js
                namespaces.js
            unittests/
                addon.test.js
            anotherFile.js
            [...]
    devtools/
    doc/
    [...]
```

1.2. Direkt in dem Ordner muss die Konfigurationsdatei **addonsConf.json** liegen. Diese beinhaltet einen JSON bestehend aus den *Namen* der *Addons* als Keys und die vom *addons/[key]* Ordner aus relativen Pfade zu deren *Entrypoints* als Values. Das nachfolgende Beispiel basiert auf der oben beschriebenen beispielhaften Ordnerstruktur.

#### Beispiel **addonsConf.json** ####
```json
{
  "exampleAddon": "entrypoint.js",
  "myAddon1": "view.js",
  "myAddon2": "subFolder/init.js"
}
```
1.3. Entrypoint des Addons sollte wenn vorhanden der View Constructor sein.

1.4. Es sollen hier ausschließlich nur die Dateien landen, welche zu *addons* gehören.

1.5 Falls weitere Dependencies die noch nicht im Masterportal vorhanden sind für ein Addon benötigt werden, können diese
über eine eigene `package.json` installiert werde. Dazu reicht eine minimale `package.json` aus:

```json
{
  "name": "exampleAddon",
  "version": "1.0.0",
  "description": "I'm an example! I can say hello world.",
  "dependencies": {
    "hello": "^0.3.2"
  }
}
```
`npm install` muss für jedes Addon separat ausgeführt werden!

## 2. Beispiel-Addon ##

Hier legen wir kurz ein Beispiel-Addon an!

2.1. Dateien Erstellen: Das Beispiel-Addon trägt den Namen *exampleAddon* und seine Enrypoint-Datei heißt *entrypoint.js*. Daraus ergibt sich eine Dateistruktur wie folgt:

```
myMasterPortalFolder/
    addons/
        exampleAddon/
            view.js
            model.js
            template.html
    devtools/
    doc/
    [...]
```

2.2. Addon-Code schreiben:

```js
// myMasterPortalFolder/addons/exampleAddon/model.js
import Tool from "../../modules/core/modelList/tool/model";

const exampleAddon = Tool.extend({
    defaults: Object.assign({}, Tool.prototype.defaults, {
        icon: "bi-example",
        renderToWindow: true,
        id: "exampleAddon",
        name: "Example Tool"
    }),
    initialize: function () {
        this.superInitialize();
    }
});

export default exampleAddon;

```
```js
// myMasterPortalFolder/addons/exampleAddon/view.js
import ExampleTemplate from "text-loader!./template.html";
import ExampleModel from "./model";

const ExampleView = Backbone.View.extend({

    initialize: function ()
     {
        this.model = new ExampleModel();
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    template: _.template(ExampleTemplate),

    // Konvention: Die Methode fürs zeichnen der View, heißt render.
    render: function (model, value) {
        const attr = model.toJSON();

        if (value) {
            //do something like this
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
        }
        return this;
    }
});

```
2.3. Die Addons-Config-Datei erstellen:

// myMasterPortalFolder/addons/addonsConf.json
```json
{
  "exampleAddon": "view.js"
}
```

2.4. Das Beispiel-Addon in der config.js Datei des Portals aktivieren:
```js
// myMasterPortalFolder/config.js

const Config = {
    // [...]
    addons: ["exampleAddon"],
    // [...]
};
```
2.5. Das Beispiel-Addon als Werkzeug in der config.json definieren, damit es als Menüpunkt erscheint.
```
// myMasterPortalFolder/config.json
...
    "tools": {
        "name": "Werkzeuge",
        "icon": "bi-wrench",
        "children": {
          "exampleAddon": {
            "name": "Beispiel Addon"
          },
```

2.5. JSDoc schreiben. Dazu einen im Ordner jsdoc einen Datei namespaces.js anlegen und als memberOf Addons **eintragen**.

```js
/**
 * @namespace ExampleAddon
 * @memberof Addons
 */
```

2.6. In der model.js muss bei memberOf als Prefix Addons. angegeben werden.

```js
/**
* @class ExampleAddonModel
* @extends Tool
* @memberof Addons.ExampleAddon
* @constructs
*/
```
