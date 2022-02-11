<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersSearchBar";
import SearchBarResultListItem from "./SearchBarResultListItem.vue";

export default {
    name: "SearchBarResultList",
    components: {
        SearchBarResultListItem
    },
    computed: {
        ...mapGetters("SearchBar", Object.keys(getters))
    }
};
</script>

<template lang="html">
    <div id="search-bar-result-list">
        <SearchBarResultListItem />
    </div>
</template>

<style lang="scss" scoped>
</style>

