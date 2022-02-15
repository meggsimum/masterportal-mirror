# The BasicResizeHandle Component #

This component may be used to make a container "resizable". The components is the handle itself.

Component may be used like this:

```
<script>

import BasicResizeHandle from "./share-components/BasicResizeHandle.vue";

// [...]

export default {
    name: "MyComponent",
    components: {
        BasicResizeHandle
    },
    methods: {
        onStartResizing: function (event) {
            console.log(event);
        },
        onEndResizing: function (event) {
            console.log(event);
        },
        onLeftScreen: function (event) {
            console.log(event);
        },
        onResizing: function (event) {
            console.log(event);
        }
    }
};
</script>

<template>
    <div 
        id="container-to-resize"
        @startResizing="onStartResizing"
        @endResizing="onEndResizing"
        @leftScreen="onLeftScreen"
        @resizing="onResizing"
    >
        <BasicResizeHandle
            v-for="hPos in ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l']"
            :key="hPos"
            :hPos="hPos"
            targetEl="#container-to-resize"
            grid="10"
            minW="50"
            minH="50"
        />
    </div>
</template>

<style lang="scss" scoped>
    #container-to-resize {
        width:100px;
        height:100px;
        background-color:#AAAAAA;
        
        .basic-resize-handle {
            position:absolute;
            width:6px;
            height:6px;
            background-color:#FF0000;
        }
        #basic-resize-handle-tl { top:0px; left:0px; }
        #basic-resize-handle-t { top:0px; left:50%; }
        #basic-resize-handle-tr { top:0px; right:0px;}
        #basic-resize-handle-r { top:50%; right:0px;}
        #basic-resize-handle-br { bottom:0px; right:0px;}
        #basic-resize-handle-b { bottom:0px; right:50%;}
        #basic-resize-handle-bl { bottom:0px; left:0px;}
        #basic-resize-handle-l { bottom:50%; left:0px;}
    }
</style>

```

## Parameters of Component ##
|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|targetEl|no|String|""|Selector used on document node downwards to find the "draggable" node. If omitted, param "targetSel" will be used instead.|
|targetSel|no|String|"offsetParent"|Selector to find "draggable" node upwards, starting at handle itself. If "offsetParent" ist used as value, "draggable" element will be the offsetParent node. This param is only used, when "targetEl" is omitted.|
|grid|no|Number|1|A snapping grid may be defined with this param.|
|hPos|no|String|"bl"|Handle position. This position only changes handle's behaviour, not its actual position on screen. Possible Values are "tl" (top left), "t" (top), "tr" (top right), "r" (right), "br" (bottom right), "b" (bottom), "bl" (bottom left), "l" (left).|
|symResize|no|Boolean|false|Flag for symmetric resizing. If true, the element will scale relative to its center point. If false, it will scale relative to its opposing handle's point.|
|minW|no|Number|-Infinity|Minimum width of element.|
|maxW|no|Number|Infinity|Maximum width of element.|
|minH|no|Number|-Infinity|Minimum height of element.|
|minH|no|Number|Infinity|Maximum height of element.|

## Events ##
BasicResizeHandle Component throws following events:
startResizing, endResizing, leftScreen, resizing
