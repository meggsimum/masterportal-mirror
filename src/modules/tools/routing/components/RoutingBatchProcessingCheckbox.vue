<script>
export default {
    name: "RoutingBatchProcessingCheckbox",
    props: {
        batchProcessing: {
            type: Object,
            required: true
        }
    }
};
</script>

<template>
    <label
        id="routing-batch-processing-checkbox"
        class="pointer mb-0 d-flex"
    >
        <input
            :checked="batchProcessing.active"
            class="mt-0 d-flex flex-column align-self-center"
            type="checkbox"
            @input="$emit('input', $event.target.checked)"
        >
        <span class="ms-2">
            {{ $t('common:modules.tools.routing.batchProcessing.header') }}
        </span>
    </label>
</template>

<style scoped>
.pointer {
    cursor: pointer;
}
</style>
