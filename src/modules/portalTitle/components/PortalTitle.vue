<script>
import {mapGetters, mapActions} from "vuex";
import getters from "../store/gettersPortalTitle";

export default {
    name: "PortalTitle",
    computed: {
        ...mapGetters("PortalTitle", Object.keys(getters)),
        ...mapGetters(["uiStyle", "mobile"])
    },

    created () {
        const myBus = Backbone.Events;

        myBus.listenTo(Radio.channel("Title"), {
            "setSize": () => {
                setTimeout(() => {
                    if (this.title !== "" || this.logo !== "" || this.link !== "" || this.toolTip !== "") {
                        this.renderDependingOnSpace();
                    }
                }, 500);
            }
        });
    },
    mounted () {
        if (this.showTitle()) {
            this.$nextTick(() => {
                const navBar = document.getElementsByClassName("navbar-collapse")[0],
                    searchBar = document.getElementById("searchbar");

                navBar.insertBefore(this.$el, searchBar);
                if (this.title !== "" || this.logo !== "" || this.link !== "" || this.toolTip !== "") {
                    this.renderDependingOnSpace();
                }

                this.initialize();
            });
        }
    },
    methods: {
        ...mapActions("PortalTitle", ["initialize"]),
        /**
         * Returns true, if the title should be shown.
         * uistyle TABLE does not show the title.
         * @returns {boolean} true, if the title should be shown
         */
        showTitle () {
            return !(this.uiStyle === "TABLE" || this.mobile);
        },
        /**
        * Depending on the available space, the titletext and titlelogo is rendered.
        * @returns {void}
        */
        renderDependingOnSpace: function () {
            let navMenuWidth,
                searchbarWidth,
                navBarWidth,
                titleWidth,
                titleTextWidth,
                rest,
                logo;
            const titleEl = document.getElementsByClassName("portal-title"),
                titlePadding = 10;

            this.$el.style.display = "block";
            document.getElementById("title-text").style.display = "inline-block";

            if (document.getElementById("searchbar")) {
                navMenuWidth = document.getElementById("root").offsetWidth;
                searchbarWidth = document.getElementById("searchbar").offsetWidth;
                navBarWidth = document.getElementById("main-nav").offsetWidth;
                titleTextWidth = document.getElementById("title-text").offsetWidth;
                if (document.getElementById("logo")) {
                    logo = document.getElementById("logo").offsetWidth;
                }
                titleWidth = titleEl ? titleEl[0].offsetWidth : 0;

                if (!this.$store.state.PortalTitle.titleWidth) {
                    if (titleWidth > titlePadding) {
                        this.$store.state.PortalTitle.titleWidth = titleWidth;
                    }
                }

                rest = navBarWidth - navMenuWidth - searchbarWidth;
                document.getElementById("title-text").style.width = (rest - logo - titlePadding).toString() + "px";

                if (logo < rest && this.$el.style.display === "none") {
                    this.$el.style.display = "block";
                }
                else if (rest < logo && this.$el.style.display === "block") {
                    this.$el.style.display = "none";
                }
                if (rest - titleTextWidth - logo - titlePadding < (30 / titleTextWidth * 100) - titleTextWidth && document.getElementById("title-text").style.display === "inline-block") {
                    document.getElementById("title-text").style.display = "none";
                }
                else if (rest - titleTextWidth - logo - titlePadding > (30 / titleTextWidth * 100) && document.getElementById("title-text").style.display === "none") {
                    document.getElementById("title-text").style.display = "inline-block";
                }
            }
        }
    }
};
</script>

<template>
    <div
        v-if="title !== '' || logo !== '' || link !== '' || toolTip !== ''"
        class="portal-title"
    >
        <a
            :href="link"
            target="_blank"
            :data-bs-toggle="title"
            data-bs-placement="bottom"
            :title="toolTip"
            class="tabable"
        >

            <img
                v-if="logo !== ''"
                id="logo"
                :src="logo"
                :alt="title"
            >
            <span
                id="title-text"
                v-html="title"
            />
        </a>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.portal-title {
    margin-left: 10px;
    overflow: hidden;
    line-height: 50px;
    float: left;
    a {
        text-decoration: none;
        display: block;
        img {
            margin: 0 5px 0 5px;
            max-height: 40px;
            display: inline-block;
            vertical-align: middle;
        }
        span {
            color: $secondary_contrast;
            margin-left: 5px;
            font-size: 26px;
            font-family: $font_family_narrow;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
            vertical-align: middle;
        }
    }
}

</style>
