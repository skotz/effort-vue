/**
 * Based on Identicon
 */

(function () {
    var PNGlib;
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        PNGlib = require('./pnglib');
    } else {
        PNGlib = window.PNGlib;
    }

    var Avatar = function (pixels, options) {
        this.defaults = {
            foreground: [0, 0, 0, 255],
            background: [255, 255, 255, 128],
            margin: 0.08,
            size: 48,
            saturation: 0.7,
            brightness: 0.5,
            format: 'png'
        };

        this.options = typeof (options) === 'object' ? options : this.defaults;

        if (typeof (arguments[1]) === 'number') { this.options.size = arguments[1]; }
        if (arguments[2]) { this.options.margin = arguments[2]; }

        this.pixels = pixels
        this.foreground = this.options.foreground || this.defaults.foreground;
        this.background = this.options.background || this.defaults.background;
        this.size = this.options.size || this.defaults.size;
        this.format = this.options.format || this.defaults.format;
        this.margin = this.options.margin !== undefined ? this.options.margin : this.defaults.margin;
    };

    Avatar.prototype = {
        background: null,
        foreground: null,
        pixels: null,
        margin: null,
        size: null,
        format: null,

        image: function () {
            return this.isSvg()
                ? new Svg(this.size, this.foreground, this.background)
                : new PNGlib(this.size, this.size, 256);
        },

        render: function () {
            var image = this.image(),
                size = this.size,
                baseMargin = Math.floor(size * this.margin),
                cell = Math.floor((size - (baseMargin * 2)) / 5),
                margin = Math.floor((size - cell * 5) / 2),
                bg = image.color.apply(image, this.background),
                fg = image.color.apply(image, this.foreground);

            var i, color;
            for (i = 0; i < 25; i++) {
                if (this.pixels.charAt(i) == '1') {
                    color = fg;
                    var y = Math.floor(i / 5);
                    var x = i % 5;
                    this.rectangle(x * cell + margin, y * cell + margin, cell, cell, color, image);
                }
            }

            return image;
        },

        rectangle: function (x, y, w, h, color, image) {
            if (this.isSvg()) {
                image.rectangles.push({ x: x, y: y, w: w, h: h, color: color });
            } else {
                var i, j;
                for (i = x; i < x + w; i++) {
                    for (j = y; j < y + h; j++) {
                        image.buffer[image.index(i, j)] = color;
                    }
                }
            }
        },

        // adapted from: https://gist.github.com/aemkei/1325937
        hsl2rgb: function (h, s, b) {
            h *= 6;
            s = [
                b += s *= b < .5 ? b : 1 - b,
                b - h % 1 * s * 2,
                b -= s *= 2,
                b,
                b + h % 1 * s,
                b + s
            ];

            return [
                s[~~h % 6] * 255, // red
                s[(h | 16) % 6] * 255, // green
                s[(h | 8) % 6] * 255  // blue
            ];
        },

        toString: function (raw) {
            // backward compatibility with old toString, default to base64
            if (raw) {
                return this.render().getDump();
            } else {
                return this.render().getBase64();
            }
        },

        isSvg: function () {
            return this.format.match(/svg/i)
        }
    };

    var Svg = function (size, foreground, background) {
        this.size = size;
        this.foreground = this.color.apply(this, foreground);
        this.background = this.color.apply(this, background);
        this.rectangles = [];
    };

    Svg.prototype = {
        size: null,
        foreground: null,
        background: null,
        rectangles: null,

        color: function (r, g, b, a) {
            var values = [r, g, b].map(Math.round);
            values.push((a >= 0) && (a <= 255) ? a / 255 : 1);
            return 'rgba(' + values.join(',') + ')';
        },

        getDump: function () {
            var i,
                xml,
                rect,
                fg = this.foreground,
                bg = this.background,
                stroke = this.size * 0.005;

            xml = "<svg xmlns='http://www.w3.org/2000/svg'"
                + " width='" + this.size + "' height='" + this.size + "'"
                + " style='background-color:" + bg + ";'>"
                + "<g style='fill:" + fg + "; stroke:" + fg + "; stroke-width:" + stroke + ";'>";

            for (i = 0; i < this.rectangles.length; i++) {
                rect = this.rectangles[i];
                if (rect.color == bg) continue;
                xml += "<rect "
                    + " x='" + rect.x + "'"
                    + " y='" + rect.y + "'"
                    + " width='" + rect.w + "'"
                    + " height='" + rect.h + "'"
                    + "/>";
            }
            xml += "</g></svg>"

            return xml;
        },

        getBase64: function () {
            if ('function' === typeof btoa) {
                return btoa(this.getDump());
            } else if (Buffer) {
                return new Buffer(this.getDump(), 'binary').toString('base64');
            } else {
                throw 'Cannot generate base64 output';
            }
        }
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Avatar;
    } else {
        window.Avatar = Avatar;
    }
})();