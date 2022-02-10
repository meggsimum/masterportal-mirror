<script>
// TODO this is just the HTML copied in - functions/CSS are still to be migrated
import PortalTitle from "./modules/portalTitle/components/PortalTitle.vue";
import LegendMenu from "./modules/legend/components/LegendMenu.vue";
import {mapState, mapGetters} from "vuex";
export default {
    name: "MainNav",
    components: {
        PortalTitle,
        LegendMenu
    },
    computed: {
        ...mapState([
            // listen to configJson changes for mounting the tools
            "configJson"
        ]),
        ...mapGetters(["legendConfig"])
    }
};
</script>

<template>
    <header>
        <nav
            id="main-nav"
            class="navbar navbar-default"
            role="navigation"
        >
            <div class="container-fluid">
                <div id="navbarRow">
                    <div class="navbar-header">
                        <button
                            type="button"
                            class="navbar-toggle"
                            data-toggle="collapse"
                            data-target=".navbar-collapse"
                        >
                            <span class="sr-only">Navigation ein-/ausblenden</span>
                            <span class="icon-bar" />
                            <span class="icon-bar" />
                            <span class="icon-bar" />
                        </button>
                    </div>
                    <div class="collapse navbar-collapse">
                        <ul
                            id="root"
                            class="nav-menu"
                        />
                    </div>
                    <LegendMenu v-if="legendConfig" />
                    <PortalTitle />
                </div>
            </div>
        </nav>
    </header>
</template>

<style lang="scss" scoped>
    #main-nav{
        flex-grow:0;
    }
</style>
