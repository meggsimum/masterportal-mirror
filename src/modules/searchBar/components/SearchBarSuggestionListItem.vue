<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersSearchBar";

export default {
    name: "SearchBarSuggestionListItem",
    computed: {
        ...mapGetters("SearchBar", Object.keys(getters))
    }
};
</script>

<template lang="html">
    <div id="search-bar-suggestion-list-item">
        <!-- do something -->
    </div>
</template>

<style lang="scss" scoped>
</style>

