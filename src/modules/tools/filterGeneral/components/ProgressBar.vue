<script>
export default {
    name: "ProgressBar",
    props: {
        paging: {
            type: Object,
            required: false,
            default: () => {
                return {
                    page: 1,
                    total: 1
                };
            }
        }
    },
    methods: {
        getValueInPercent () {
            return this.paging.total > 0 ? Math.round(100 / this.paging.total * this.paging.page) : 100;
        }
    }
};
</script>

<template>
    <div
        v-show="paging.page < paging.total"
        class="progress-container"
    >
        <progress
            id="progressbar"
            :value="paging.page"
            :max="paging.total"
        />
        <span class="progress-value">{{ getValueInPercent() }}%</span>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    progress {
        border-radius: 7px;
        margin-top: 20px;
        width: 100%;
        height: 12px;
        box-shadow: 1px 1px 4px rgba( 0, 0, 0, 0.2 );
    }

    progress::-webkit-progress-bar {
        background-color: #fff;
        border-radius: 5px;
    }

    progress::-webkit-progress-value {
        background-color: #3177b1;
        border-radius: 5px;
    }

    progress::-moz-progress-bar {
        background-color: #fff;
        border-radius: 5px;
    }
    .progress-container {
        text-align: center;
    }
    .progress-value {
        text-align: left;
        margin: 0 auto;
        font-weight: bold;
    }
</style>
