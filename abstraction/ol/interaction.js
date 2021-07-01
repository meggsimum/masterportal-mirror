import PointerInteraction from "ol/interaction/Pointer";

export default {
    /**
     * Creates a pointer interaction.
     * @param {Function} handleMoveEvent Function handling "down" events.
     * @param {Function} handleDownEvent Function handling "drag" events.
     * @returns {ol/interaction/Pointer} The pointer interaction.
     */
    createPointerInteraction: function (handleMoveEvent, handleDownEvent) {
        return new PointerInteraction(
            {
                handleMoveEvent,
                handleDownEvent
            }
        );
    }
};
