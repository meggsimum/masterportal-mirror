<script>
import {mapGetters, mapActions} from "vuex";
import getters from "../store/gettersSearchBar";
import SearchBarSuggestionList from "./SearchBarSuggestionList.vue";
import SearchBarResultList from "./SearchBarResultList.vue";

export default {
    name: "SearchBar",
    components: {
        SearchBarSuggestionList,
        SearchBarResultList
    },
    computed: {
        ...mapGetters("SearchBar", Object.keys(getters))
    },
    mounted () {
        this.initialize();
        this.overwriteDefaultValues();
    },
    methods: {
        ...mapActions("SearchBar", ["initialize", "overwriteDefaultValues"])
    }
};
</script>

<template lang="html">
    <div id="search-bar">
        <SearchBarSuggestionList />
        <SearchBarResultList />
    </div>
</template>

<style lang="scss" scoped>
</style>

