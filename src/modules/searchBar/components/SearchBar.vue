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
    watch: {
        searchResults (searchResults) {
            /* eslint-disable no-console */
            console.log("SearchResults:");
            console.log(searchResults);
        },
        searchSuggestions (searchSuggestions) {
            /* eslint-disable no-console */
            console.log("SearchSuggestions:");
            console.log(searchSuggestions);
        }
    },
    mounted () {
        this.initialize();
        this.overwriteDefaultValues();
        this.instantiateSearchInterfaces();

        // Testcase
        setTimeout(() => {
            const testSearchInput = "Neuenfelder Straße";

            /* eslint-disable no-console */
            console.log("Testcase:");
            console.log(`Search for "${testSearchInput}"`);
            console.log("SearchInterfaceInstaces:");
            console.log(this.searchInterfaceInstances);
            this.search({searchInput: testSearchInput});
        }, 500);
    },
    methods: {
        ...mapActions("SearchBar", ["initialize", "instantiateSearchInterfaces", "overwriteDefaultValues", "search"])
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

