<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersSearchBar";

export default {
    name: "SearchBarSuggestionList",
    computed: {
        ...mapGetters("SearchBar", Object.keys(getters))
    }
};
</script>

<template lang="html">
    <div id="search-bar-suggestion-list">
        <!-- do something -->
    </div>
</template>

<style lang="scss" scoped>
</style>

