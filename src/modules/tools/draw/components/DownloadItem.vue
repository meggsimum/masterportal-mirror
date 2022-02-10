<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

import * as constants from "../store/constantsDraw";

export default {
    name: "DownloadItem",
    computed: {
        ...mapGetters("Tools/Draw", constants.keyStore.getters)
    },
    mounted () {
        this.setDownloadSelectedFormat(this.download.preSelectedFormat);
        this.setDownloadFeatures();

    },
    methods: {
        ...mapMutations("Tools/Draw", constants.keyStore.mutations),
        ...mapActions("Tools/Draw", constants.keyStore.actions)
    }
};
</script>

<template>
    <div>
        <hr>
        <p class="bold">
            {{ $t("common:button.download") }}
        </p>
        <form
            id="tool-draw-download"
            class="form-horizontal"
            role="form"
        >
            <div class="form-group form-group-sm">
                <label
                    class="col-md-5 col-sm-5 control-label"
                    for="tool-draw-download-format"
                >
                    {{ $t("common:modules.tools.draw.download.format") }}
                </label>
                <div class="col-md-7 col-sm-7">
                    <select
                        id="tool-draw-download-format"
                        class="form-control"
                        @change="setDownloadSelectedFormat($event.target.value)"
                    >
                        <option value="none">
                            {{ $t("common:modules.tools.draw.download.pleaseChoose") }}
                        </option>
                        <option
                            v-for="format in download.formats"
                            :key="'tool-draw-download-format-' + format"
                            :value="format"
                            :selected="format === download.preSelectedFormat"
                        >
                            {{ format }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="form-group form-group-sm">
                <label
                    class="col-md-5 col-sm-5 control-label"
                    for="tool-draw-download-filename"
                >
                    {{ $t("common:modules.tools.draw.download.filename") }}
                </label>
                <div class="col-md-7 col-sm-7">
                    <input
                        id="tool-draw-download-filename"
                        type="text"
                        class="form-control"
                        :placeholder="$t('common:modules.tools.draw.download.enterFilename')"
                        @keyup="setDownloadFileName"
                    >
                </div>
            </div>
            <div class="form-group form-group-sm">
                <div class="col-md-12 col-sm-12 col-xs-12">
                    <a
                        id="tool-draw-download-file"
                        class="col-xs-12 downloadFile"
                        :href="download.fileUrl"
                        :download="download.file"
                    >
                        <button
                            class="btn btn-sm btn-block btn-lgv-grey"
                            :disabled="disableFileDownload"
                            type="button"
                            @click="fileDownloaded"
                        >
                            <span class="glyphicon glyphicon-floppy-disk" />
                            {{ $t("common:modules.tools.draw.button.saveDrawing") }}
                        </button>
                    </a>
                </div>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

a {
    color: #000;
}
.bold {
    font-weight: bold;
}
.disabled {
    cursor: not-allowed;
}

#tool-draw-download-file {
    background-color: buttonface;
    text-decoration: none;
    padding: 0;
}
</style>
