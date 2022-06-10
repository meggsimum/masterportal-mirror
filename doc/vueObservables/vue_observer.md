# Vue Ractivity - observer erkennen und verhindern

Reactivity = Wenn ein Datenwert geändert wird, löst dies eine Aktualisierung der Seite aus, um diese Änderung widerzuspiegeln.

### Properties
Wenn eine Vue-Instanz erstellt wird, wird jede property, component prop, data etc. durchlaufen und Getter und Setter werden für jede hinzugefügt. Diese Getter und Setter ermöglichen es Vue, Änderungen an den Daten zu beobachten und Aktualisierungen auszulösen.

### Computed Properties
Computed Properties reagieren auf Änderungen des states.

### Getter
Vuex-Getter reagieren genau wie computed Properties auf Änderungen des states . Wenn eine state property geändert wird, auf die sich der Getter stützt, wird auch der Getter-Wert aktualisiert.

Die Funktion mapGetters() wird in computed aufgerufen, dadurch werden alle (?) dort angegebenen getter beobachtet.

Getter, auf die als property (z.B. in computed) zugegriffen wird, werden als Teil von Vue's reactivity system gecached. Wenn über methoden auf sie zugegriffen wird, dann wird der Inhalt nicht gecached.

Ein beobachtetes Element mit dem Observer und den konstruierten gettern und settern:

![Beobachtetes Element](elementWitObserver.jpg)

### Was wird nicht beobachtet:

- eingefrorene Objekte:
```
Object.freeze(layer)
```
- The virtual DOM node (VNode)
- die Vue Instanz

## Das Problem im masterportal

### momentan gelöst:

Die map3D und die map2D wurden beobachtet. Ausgelöst durch getter, die die Maps zurückgaben und vorher durch die maps im state. Das führte zu extremen Performance Problemen in der 3D-Ansicht durch Beobachtung und caching.

### immer wiederkehrend:

Die Layer werden noch beobachtet. Wenn diese in einer vue-Komponente oder im state auf bestimmte Art und Weise genutzt wurden dann wurde auch wieder die map3D beobachtet.
Die Beobachtung der Layer müssen wir noch beseitigen.

Beispiele in den controls und tools:

![Attributions](attributions.jpg)
![coordToolkit](coordToolkit.jpg)
![saveSelection](saveSelection.jpg)

### Erkennen, dass die map3D beobachtet wird

In der App.vue wird die Funktion ```checkVueObservation()``` im created-hook aufgerufen

```
    checkVueObservation () {
        if (process.env.NODE_ENV === "development") {
            setInterval(() => {
                const map3D = mapCollection.getMap("3D");

                if (map3D?.__ob__) {
                    console.error("map3d is observed by vue:", map3D);
                }
            }, 5000);
        }
    }
```
Das greift natürlich erst, wenn die map3D vorhanden ist, d.h. die 3D-Ansicht muss einmalig angeschaltet werden.

Dann kommt diese Fehlermeldung:
![map3DErrorMsg](map3DErrorMsg.jpg)



## Tipps:
- wenn die 3d-map beobachtet wird und man die vue-devtools aufhat, dann geht beim Anschalten von 3d nix mehr 
    
    --> neuer tab ohne dev-tools, die erst einschalten wenn man in 3d ist

- Loggen der beobachteten Objekte:

    node_modules\vue\dist\vue.runtime.esm.js

    function defineReactive$$1

    Zeile 1012: 
    
    ```console.log(obj, key, val);```


## Links    
[The mystery of reactivity](https://www.how-to-vue.com/vue/reactivity/)

[Reaktivität in Vue.js (und seine Fallstricke)](https://medium.com/js-dojo/reactivity-in-vue-js-and-its-pitfalls-de07a29c9407)

[Vuex-Getter](https://masteringjs.io/tutorials/vue/vuex-getters)

[Freeze: How to Improve Performance of Vuex Store](https://medium.com/@jiihu/how-to-improve-performance-of-vuex-store-c9e3cfb01f72)

[Vue Feature Request: determine if a reactive object is observed by any Vue instance](https://github.com/vuejs/vue/issues/4437)

[Tell Vue.js to stop wasting time, and render faster!](https://medium.com/@deadbeef404/tell-vue-js-to-stop-wasting-time-and-render-faster-7c3f7d2acaab)