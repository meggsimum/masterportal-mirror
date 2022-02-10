# The BasicDragHandle Component #

This component may be used to make a container "draggable". The component itself is the handle to move the
container.

Component may be used like this:

```
<script>

import BasicDragHandle from "./share-components/BasicDragHandle.vue";

// [...]

export default {
    name: "MyComponent",
    components: {
        BasicDragHandle
    },
    methods: {
        onStartDragging: function (event) {
            console.log(event);
        },
        onEndDragging: function (event) {
            console.log(event);
        },
        onLeftScreen: function (event) {
            console.log(event);
        },
        onDragging: function (event) {
            console.log(event);
        }
    }
};
</script>

<template>
    <div id="containment-element">
        <div 
            id="container-to-drag"
            @startDragging="onStartDragging"
            @endDragging="onEndDragging"
            @leftScreen="onLeftScreen"
            @dragging="onDragging"
        >
            <BasicDragHandle
                targetEl="#container-to-drag"
                margin="12"
                grid="10"
            >
                <p>
                    Use this drag handle!
                </p>
            </BasicDragHandle>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    #containment-element {
        position:relative;
        height:500px;
        width:500px;
        border:1px solid #AAAAAA;
    }
    #container-to-drag {
        position:absolute;
        width:100px;
        height:100px;
        background-color:#FF0000;
        
        p {
            position:absolute;
            top:0;
            right:0;
            left:0;
            height:20px;
            text-align:center;
            cursor:move;
        }
    }
</style>

```

## Parameters of Component ##
|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|targetEl|no|String|""|Selector used on document node downwards to find the "draggable" node. If omitted, param "targetSel" will be used instead.|
|targetSel|no|String|"offsetParent"|Selector to find "draggable" node upwards, starting at handle itself. If "offsetParent" ist used as value, "draggable" element will be the offsetParent node. This param is only used, when "targetEl" is omitted.|
|grid|no|Number|1|A snapping grid may be defined with this param.|
|isEnabled|no|Boolean|true|Flag determining if component is enabled.|
|margin|no|Number|0|Margin of "draggable" element respective to offsetParent.|
|marginTop|no|Number|0|Margin-top of "draggable" element respective to offsetParent. Overrides "margin".|
|marginRight|no|Number|0|Margin-right of "draggable" element respective to offsetParent. Overrides "margin".|
|marginBottom|no|Number|0|Margin-bottom of "draggable" element respective to offsetParent. Overrides "margin".|
|marginLeft|no|Number|0|Margin-left of "draggable" element respective to offsetParent. Overrides "margin".|

## Events ##
BasicDragHandle Component throws following events:
startDragging, endDragging, leftScreen, dragging
