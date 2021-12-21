
## Tutorial: Ein neues Tool erstellen (Scale-Switcher)
Eine Schritt für Schritt Dokumentation zur Erstellung eines neuen Tools (Moduls).

### Beispiel Anforderung
Wir wollen ein Tool schreiben, über welches man den Kartenmaßstab steuern kann. Dabei soll über ein Drop-Down-Menü der Maßstab ausgewählt werden. Sobald der Maßstab gesetzt wurde, soll sich die Karte anpassen.
Darüber hinaus soll unser Tool auf Änderungen des Kartenmaßstabes reagieren und den entsprechend aktuellen Maßstab im Drop-Down-Menu anzeigen.

### Neues Tool anlegen
In das Verzeichnis "modules -> tools" wechseln und einen neuen Ordner erstellen. Aus dem Ordnernamen sollte ersichtlich sein, um was für ein Tool es sich dabei handelt - z.B. "scale". Die für dieses Tool benötigten Dateien anlegen. In der View (view.js) wird auf Interaktion mit dem Nutzer reagiert und das Tool neu gerendert. Dazu wird das Template (template.html) benötigt, welches den Bauplan des Tools enthält. Im Model (model.js) werden die Daten und deren Logik vorgehalten. Stylingparameter werden in der style.scss konfiguriert.
```
-  modules
   | -> tools
   |    |-> scale
   |    |    | -> view.js
   |    |    | -> model.js
   |    |    | -> template.html
   |    |    | -> style.css
```

### Scale View erstellen und zurückgeben
Datei *modules/tools/scale/view.js* öffnen und die View mit folgendem Standardschema erzeugen.
```js

const ScaleView = Backbone.View.extend({
      // wird aufgerufen wenn die View erstellt wird
      initialize: function () {
      }
    });

export default ScaleView;

```

### Scale View initialisieren
In die datei *js/app.js* wechseln, Scale View importieren und initialiseren. Darauf achten, dass das Tool grundsätzlich erst nach dem Core initialsiert werden. (Dies gilt für jedes Modul) Das Initialsieren eines Tools erfolgt als switch-case Anweiszung innerhalb einer vorgesehene _.each Schleife Zurzeit ab Zeile 157.
```js

// View importieren
import ScaleView from "../modules/tools/scale/view";
// View initialsieren
 _.each(Radio.request("ModelList", "getModelsByAttributes", {type: "tool"}), function (tool) {
      switch (tool.id) {
          case "scale": {
            new ScaleView({model: tool});
            break;
          }
          ... // weitere Tools
      }
  });


```

### Template erstellen
Datei *modules/tools/scale/template.html* öffnen, Template coden und mit Bootstrap Klassen versehen
```html
<!DOCTYPE html>
<select class="form-select form-select-sm">
  <option>1</option>
  <option>2</option>
  <option>3</option>
</select>
```

### Template in die View einbinden
Das Template muss in die View eingebunden werden. Hierzu wird in einer neuen Variable (ScaleTemplate) das Template importiert und mithilfe von underscore ("_") als Template zur Verfügung gestellt. Dieses Template wird dem View als Attribut "template" zugefügt.
```js

   import ScaleTemplate from "text-loader!./template.html";


const ScaleView = Backbone.View.extend({
    initialize: function () {
    },
    // underscore template Funktion
    template: _.template(ScaleTemplate)
});

export default ScaleView;

```
### Template initial rendern
Beim Laden der View, soll sich sofort das Tool in rendern wenn der Parameter "isActive" auf true gesetzt ist. Dazu wird in der initialize()-Funktion eine if-Abfrage definiert, welche die render-Funktion aufruft. Beim späteren aktivieren soll sich das Tool ebenfalls zeichnen. Dies wird über einen Listener realisert, der auf Verändeurngen des Paramters "isActive" wartet und anschließend die render-Funktion aufruft.In der render-Funktion passiert folgendes, wenn das Tool aktiv ist:
Die View wird and das HTML win-body gezeichnet.
Der View wird das Template zugefügt.
```js


const ScaleView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    template: _.template(ScaleTemplate),

    // Konvention: Die Methode fürs zeichnen der View, heißt render.
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template());
        }

        return this;
    }
});

export default ScaleView;

```
Jede View bekommt automatisch ein top level DOM Element (this.el) zugewiesen.
Standardeinstellung für das DOM Element ist ein *div* Tag. In diesem Fall zeichnet sich beim rendern ein *div* an den Body. Dieser *div* ist befüllt mit dem Inhalt des *templates*.

### scss Regeln definieren
Datei *modules/tools/scale/style.scss* öffnen und folgenden Code eingeben.
```css
.scale-switcher {
    border: 2px solid red;
}

Damit es keine Probleme mit scss Regeln anderer Module/Tools gibt, wird über eine definierte Klasse "scale-switcher" gestylt.
```

### Model erstellen und zurückgeben
Datei *modules/tools/scale/model.js* öffnen und Model definieren. Das Model erbt vom der Elternklasse *Tool* das im Core *moduels/core/modelList/tool/model.js* definiert ist. Über den Aufruf der Funktion *superInitialize* wird der Listener, der die Aktivierung der Tools regelt, von der Elternklasse übernommen. Dem Parameter defaults werden alle Attribute mit einem Default-Wert eingetragen, die in diesem Model konfiguriert werden können (z.B. ein Bootstrap Icon). Dort wird auch das Attribute "renderToWindow" auf true gestezt, damit sich der Scale-Switcher im vererbten Fenster zeichnet.
```js

import Tool from "../../core/modelList/tool/model";

const ScaleModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        icon: "bi-arrows-angle-expand",
        renderToWindow: true
    }),
    // wird aufgerufen wenn das Model erstellt wird
    initialize: function () {
        this.superInitialize();
    }
});

export default ScaleModel;

```

### Model der View zuweisen
In der ModelList *modules/core/modelList/list.js* wird das Model import und unter dem Eintrag *model* in dem vorgesehenen if-else Statement per new ScaleModel() instanziiert.
```js

import ScaleModel from "../../tools/scale/model";

 else if (attrs.type === "tool") {
    else if (attrs.id === "scale") {
        return new ScaleModel(attrs, options);
    }
    ... // weitere Tool-Models
 }

```

### Setter Methoden für das Model schreiben
Mithilfe von Setter-Methoden werden Member-Variablen im Model definiert bzw überschrieben.
Dazu werden Default-Werte eingetragen.
```js

const ScaleModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        icon: "bi-arrows-angle-expand",
        renderToWindow: true,
        scales: "",
        currentScale: ""
    },
    initialize: function () {
        this.superInitialize();
    },

    // Setter für alle verfügbaren Maßstäbe
    setScales: function (value) {
        this.set("scales", value);
    },
    // Setter für den aktuellen Maßstab
    setCurrentScale: function (value) {
        this.set("currentScale", value);
    }
});

export default ScaleModel;

```

### Maßstäbe der Karte abfragen und setzen
Die Kommunikation mit anderen Modulen/Tools erfolgt über Backbone.Radio. In diesem Fall mit dem *MapView* Modul (*modules/core/mapView.js*), in dem alle Scales definiert sind. Das *MapView* Modul stellt bereits über Backbone.Radio die Funktion *getScales* zur Verfügung, über die alle Scales abgefragt werden können.
 Diese Maßstäbe werden mittels *Radio* requested und im ScaleModel über die entsprechende Setter-Funktion gesetzt. Um sicher zu gehen, dass die *Map* bereits geladen ist wird ein Listener definiert, der auf eine entsprechende Nachricht wartet, bevor getScales getriggert wird.
```js

const ScaleModel = Tool.extend({
    initialize: function () {
        this.superInitialize();
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                // initial alle Scales der Karte abfragen
                this.setScales(Radio.request("MapView", "getScales"));
            }
        });
    },
    ...
});

export default ScaleModel;

```
### Aktuellen Kartenmaßstab abfragen und setzen
Analog zu "getScales" können von der MapView auch der aktuelle Maßstab abgefragt werden. Hierzu werden die aktuellen Optionen requested und von diesem Objekt das Attribut "scale" verwendet. Dieses wird über den entsprechenden Setter als Model-Variable gesetzt.
```js

const ScaleModel = Tool.extend({
    initialize: function () {
        this.superInitialize();
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                ...
                this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
            }
        });
    },
    ...
});

export default ScaleModel;
```

### Model Attribute ans Template übergeben
Da sich das Template dynamisch aus den Daten des Models erzeugen soll, muss die render()-Funktion erweitert werden. Indem das Model an das Template übergeben wird, können die Model-Variablen im Template verwendet werden.
```js

const ScaleView = Backbone.View.extend({
    initialize: function () {
        ...
    },
    template: _.template(ScaleTemplate),
    render: function (model, value) {
        // alle Model Attribute (currentScale, scales)
        var attr = model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
        }

        return this;
    }
});

export default ScaleView;

```

### Maßstäbe in der View anzeigen bzw. ins Template scripten
Im Tag "select" wird die Klasse "scale-switcher" definiert.

```html
<!DOCTYPE html>
<select class="form-select form-select-sm scale-switcher">
  <% _.each(scales, function (scale) { %>
    <% if (scale === currentScale) { %>
        <option selected><%= scale %></option>
    <% }
    else { %>
        <option><%= scale %></option>
    <% } %>
  <% }); %>
</select>
```

### User Input in der View registrieren
In der View haben wir die Möglichkeit auf events im HTML zu hören. In diesem Fall wollen wir darauf hören, wenn sich im Drop-Down-Menü ein Eintrag geändert hat. Wenn dieses Event eintrifft, überschreiben wir im Model das Attribut "currentScale" mit dem Wert aus dem Drop-Down-Menü. Dafür verwenden wir die Setter-Methode "setCurrentScale" des Models.
```js

const ScaleView = Backbone.View.extend({
    ...,
    events: {
        // DOM Change Event führt this.setCurrentScale aus
        "change .form-select": "setCurrentScale"
    },
    initialize: function () {...},
    template: _.template(ScaleTemplate),
    render: function () {...},
    // Ruft im Model die Methode setCurrentScale auf
    setCurrentScale: function (evt) {
        this.model.setCurrentScale(parseInt(evt.target.value, 10));
    }
});

export default ScaleView;
```

### Model Listener auf change:currentScale
Durch einen Listener wird bei Veränderung der currentScale der neue Maßstab an die Mapview gesendet. Das Attribut "currentScale" wird über die Getter-Funktion von Backbone geholt.

```js

const ScaleModel = Tool.extend({
    initialize: function () {
        ...
        this.listenTo(this, {
            "change:currentScale": function () {
                // Sendet den neuen Maßstab an die MapView
                // Dadurch zoomt die Karte in diesen Maßstab
                Radio.trigger("MapView", "setScale", this.get("currentScale"));
            }
        });
        ...
    },
    setScales: function (value) {...},
    setCurrentScale: function (value) {...}
});

export default ScaleModel;
```

### Model Listener auf MapView changedOptions
Wir wollen nicht nur den Maßstab der Karte setzen können , sondern auch auf Veränderungen des Maßstabs reagieren. Ändert sich der Kartenmaßstab, soll sich in unserem Tool der aktuelle Maßstab anpassen.
Dazu wird in der Initialize-Funktion ein Listener geschrieben. Dieser Hört per Radio auf ein "changedOptions"-Event des Radio-Channels "MapView". Sobald ein solches Event getriggert wird, wird mithilfe unserer Setter-Methode *setCurrentScale()* der aktuelle Maßstab im Model überschrieben.
```js

const ScaleModel = Tool.extend({
    initialize: function () {
        ...
        this.listenTo(Radio.channel("MapView"), {
            // Wird ausgelöst wenn sich Zoomlevel, Center
            // oder Resolution der Karte ändert
            "changedOptions": function (value) {
                this.setCurrentScale(value.scale);
            }
        });
        ...
    },
    ...
});

export default ScaleModel;
```

### View Listener auf change currentScale im Model
Bisher erkennt nur das Model eine Veränderung des aktuellen Kartenmaßstabes. Die View muss jedoch auch darauf hören, wenn sich in seinem Model der aktuelle Maßstab verändert. Denn dann muss sich das Tool neu zeichnen, sodass der aktuelle Maßstab angezeigt wird.
```js
const ScaleView = Backbone.View.extend({
    ...
    events: {...}
    initialize: function () {
        this.listenTo(this.model, {
            // Verändert sich der Maßstab der Karte und damit der currentScale
            // des Models, wird die View neu gezeichnet.
            "change:currentScale": this.render
        });
        ...
    },
    render: function () {...},
    setCurrentScale: function (evt) {...}
});

export default ScaleView;

```

### Tool in der config.json konfigurieren
Um das Tool in einem Portal zu verwenden, muss dies in der config.json konfiguriert werden
```js
      "tools":
      {
        "name": "Werkzeuge",
        "icon": "bi-wrench",
        "children": {
          "scale":
          {
            "name": "Scale Switcher",
            "icon": "bi-arrows-angle-expand"
          },
          ... // weitere Tools
        }
      }
```
