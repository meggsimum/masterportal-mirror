import setBackgroundImage from "../../src/lib/setBackgroundImage";
import defaults from "../../src/defaults";

describe("setBackgroundImage.js", function () {
    beforeEach(() => {
        document.body.innerHTML = "<div><div id='map'></div><div id='custom'></div></div>";
    });

    it("uses defaults fallback to get div", function () {
        const backgroundImage = "example.com/background.png";

        setBackgroundImage({backgroundImage});

        expect(document.getElementById("map").style.backgroundImage).toContain(backgroundImage);
        expect(document.getElementById("custom").style.backgroundImage).not.toContain(backgroundImage);
    });

    it("uses custom id if given", function () {
        const backgroundImage = "example.com/background.png";

        setBackgroundImage({backgroundImage, target: "custom"});

        expect(document.getElementById("map").style.backgroundImage).not.toContain(backgroundImage);
        expect(document.getElementById("custom").style.backgroundImage).toContain(backgroundImage);
    });

    it("does nothing if specified div was not found", function () {
        const backgroundImage = "example.com/background.png";

        setBackgroundImage({backgroundImage, target: "asdf"});

        expect(document.getElementById("map").style.backgroundImage).not.toContain(backgroundImage);
        expect(document.getElementById("custom").style.backgroundImage).not.toContain(backgroundImage);
    });

    it("preserves empty string as input to set explicitly no background image", function () {
        const backgroundImage = "";

        setBackgroundImage({backgroundImage});

        expect(document.getElementById("map").style.backgroundImage).toBe("url()");
    });

    it("sets the default background image if none was given", function () {
        setBackgroundImage();

        expect(document.getElementById("map").style.backgroundImage).toContain(defaults.backgroundImage);
    });
});
