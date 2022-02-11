<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersSearchBar";

export default {
    name: "SearchBarResultListItem",
    computed: {
        ...mapGetters("SearchBar", Object.keys(getters))
    }
};
</script>

<template lang="html">
    <div id="search-bar-result-list-item">
        <!-- do something -->
    </div>
</template>

<style lang="scss" scoped>
</style>

