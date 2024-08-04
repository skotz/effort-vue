export default {
    methods: {
        isJson: function (json) {
            try {
                JSON.parse(json);
            } catch (ex) {
                return false;
            }
            return true;
        },
        parseName: function (name) {
            if (this.isJson(name)) {
                var settings = JSON.parse(name);
                if (settings.n && settings.c && settings.p.length == 25) {
                    return settings.n;
                }
            }
            return name;
        },
        getRGB: function (hex) {
            return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
        },
        getAvatar: function (name, size) {
            // eslint-disable-next-line
            var hash = sha256("" + name);
            // eslint-disable-next-line
            var data = new Identicon(hash, {
                background: [255, 255, 255, 128],
                size: size
            }).toString();
            try {
                if (this.isJson(name)) {
                    // example: { "n": "scott", "c": "#007711", "p": "0111001000011100001001110" }
                    var settings = JSON.parse(name);
                    if (settings.n.length > 0 && settings.c.length == 7 && settings.p.length == 25) {
                        // eslint-disable-next-line
                        data = new Avatar(settings.p, {
                            background: [255, 255, 255, 128],
                            foreground: this.getRGB(settings.c),
                            size: size,
                        }).toString();
                    }
                }
            } catch (ex) {
                console.log(ex)
            }
            return data;
        }
    }
}