// just demo of generic helpers
// Math,String, Date prototype
var hbs = require('handlebars');

Object.getOwnPropertyNames(Math)
    .filter((pn) => typeof Math[pn] === "function")
    .forEach(function(pn) {
        // TODO: how to organize helpers ? dots, slashet - ?
        hbs.registerHelper("math-" + pn, function() {
            var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);;
            var r = Math[pn].apply(null, args);
            return new hbs.SafeString(r);
        });
    });
Object.getOwnPropertyNames(String.prototype)
    .filter((pn) => typeof String.prototype[pn] === "function")
    .forEach(function(pn) {
        // TODO: how to organize helpers ? dots, slashet - ?
        hbs.registerHelper("str-" + pn, function() {
            var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            var _this = args.shift();
            var r = String.prototype[pn].apply(_this, args);
            return new hbs.SafeString(r);
        });
    });

Object.getOwnPropertyNames(Date.prototype)
    .filter((pn) => typeof Date.prototype[pn] === "function")
    .forEach(function(pn) {
        // TODO: how to organize helpers ? dots, slashet - ?
        hbs.registerHelper("date-" + pn, function() {
            var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            var _this = args.shift();
            if (typeof _this === "string") {
                _this = JSON.parse('"' + _this + '"', jsonDateParser);
            }
            //console.log(typeof _this, _this)
            // TODO: else
            var r = Date.prototype[pn].apply(_this, args);
            return new hbs.SafeString(r);
        });
    });

function jsonDateParser(key, value) {
    // https://weblog.west-wind.com/posts/2014/jan/06/javascript-json-date-parsing-and-real-dates
    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
    if (typeof value === 'string') {
        var a = reISO.exec(value);
        if (a)
            return new Date(value);
        a = reMsAjax.exec(value);
        if (a) {
            var b = a[1].split(/[-+,.]/);
            return new Date(b[0] ? +b[0] : 0 - +b[1]);
        }
    }
    return value;
}

var drequire;
try { drequire = require("drequire")(); } catch (ex) {
    console.error("[Warning]: dojo helpers will not be available.");
    console.error(ex);
}
// only if dojo is available
if (drequire) {

    var dlocale = drequire("dojo/date/locale")
    hbs.registerHelper("dlocale-format", function(date, format) {
        var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        var _this = args[0];
        if (typeof _this === "string") {
            args[0] = _this = JSON.parse('"' + _this + '"', jsonDateParser);
        }
        //console.log(args);
        // TODO: else
        var r = dlocale.format.apply(null, args);
        return new hbs.SafeString(r);
    });
    hbs.registerHelper("dlocale-isWeekend", function(date) {
        var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        var _this = args[0];
        if (typeof _this === "string") {
            args[0] = _this = JSON.parse('"' + _this + '"', jsonDateParser);
        }
        //console.log(args);
        // TODO: else
        var r = dlocale.isWeekend.apply(null, args);
        return new hbs.SafeString(r);
    });
    hbs.registerHelper("dlocale-getNames", function() {
        // TODO: this return arrays, so can/shell this be used from HB ?
        var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        //console.log(args);
        var r = dlocale.getNames.apply(null, args);
        return new hbs.SafeString(r); //TODO: string ? study what can be returned from HB helpers
    });
}
