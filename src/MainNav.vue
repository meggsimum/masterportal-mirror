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
            class="navbar navbar-expand-md navbar-light"
            role="navigation"
        >
            <div class="container-fluid">
                <div
                    id="navbarRow"
                    class="w-100"
                >
                    <div class="navbar-header d-flex justify-content-between">
                        <button
                            type="button"
                            class="navbar-toggler"
                            data-bs-toggle="collapse"
                            data-bs-target=".navbar-collapse"
                            aria-controls="navbarMenu"
                            aria-expanded="false"
                            aria-label="Navigation ein-/ausblenden"
                        >
                            <span class="navbar-toggler-icon" />
                        </button>
                    </div>
                    <div
                        id="navbarMenu"
                        class="collapse navbar-collapse"
                    >
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

    .navbar-toggler {
        margin: 8px 15px 8px 0;
    }

    .navbar-toggler-icon {
        width: 1.125em;
        height: 1.125em;
    }
</style>
