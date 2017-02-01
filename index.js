#!/usr/bin/env node


var cliArgs = require("optimist").argv;
var hbs = require("handlebars");

detectInputs(process.stdin, cliArgs, function transform(err, { data, template }) {
    if (err) {
        throw err;
    };
    // hbs.registerHelper('include', function(file, context, opt) {
    //     var context = null == context ? args : context;
    //     var f = fs.readFileSync(file);
    //     return handle(f, context);
    // });
    // FIXME: let user include helpers with cli
    // do not include by default
    require('./helpers.js'); // self registering, also usable with node -r ./helpers other-cli.js

    //console.log("data", data);

    var transformed = template(data);
    // avoid printing useless whitespace
    // FIXME: node ./index.js '{"name":"slon"}' '{{name}}' is OK, 
    // but echo -e '{{name}}' |  node ./index.js '{"name":"slon"}' | wc -l is extra new line, why ?
    transformed && process.stdout.write(transformed + require('os').EOL);
});


// supported CLI usage:
// cat test/data.json | handlebars-cmd test/templ.hbs
// cat test/templ.hbs | handlebars-cmd test/data.templ
// cat test/templ.hbs | hanedlebars-cmd --prop1=test1 --prop2=test2
// hanedlebars-cmd test/templ.hbs --prop1=test1 --prop2=test2

// hanedlebars-cmd test/templ.hbs '{"data1":"test 1"}'
// hanedlebars-cmd '{"data1":"test 1"}' test/templ.hbs 
// hanedlebars-cmd "{{template}}"" test/data.json 


function detectInputs(stdin, cliArgs, callback) {

    var inputs = {}; // this will be built from anywhere and passed to callback

    var fs = require("fs");

    var argsFiles = cliArgs._; //  CLI specified files
    //  CLI specified data (eg --name=Test)
    var argsData = JSON.parse(JSON.stringify(cliArgs, (k, v) => k == "_" || k == "$0" ? undefined : v));



    if (!stdin.isTTY) { //something on pipe
        readStream(stdin, function(err, string) { //no json nor template streaming api, so read fully
            // something shell be on stdin, data or remplate
            tryData(string) && tryTemplate(argsFiles[0]) || tryTemplate(string) && tryData(argsFiles[0]);
            // poison data from cli args
            inputs.data = Object.assign(inputs.data || {}, argsData); //mix CLI args
            callback(check(inputs), inputs);
        });
    } else { //nothing on pipe all must be args
        tryData(argsFiles[1]) && tryTemplate(argsFiles[0]) || tryTemplate(argsFiles[1]) && tryData(argsFiles[0]);
        // poison data from cli args
        inputs.data = Object.assign(inputs.data || {}, argsData); // mix CLI args
        callback(check(inputs), inputs);
    }
    //-----------------------------------------------------

    function readStream(s, done) {
        var bufs = [];
        s.on('data', function(d) {
            bufs.push(d);
        });
        s.on('end', function() {
            done(null, Buffer.concat(bufs).toString());
        });
        s.resume();
    }

    function tryData(stringOrPath) {
        if (inputs.data) return;
        var r;
        try {
            r = JSON.parse(stringOrPath);
        } catch (ex) { reportError(ex); }
        if (!r) {
            try {
                r = fs.readFileSync(stringOrPath).toString();
            } catch (ex) { reportError(ex); }
        }
        return inputs.data = r;
    }

    function tryTemplate(stringOrPath) {
        if (inputs.template) return;
        var r;
        try {
            try {
                r = hbs.compile(fs.readFileSync(stringOrPath).toString()); // REVIEW:
            } catch (ex) { reportError(ex); }

        } catch (ex) { reportError(ex); }
        if (!r) {
            r = hbs.compile(stringOrPath);
        }
        return inputs.template = r;
    }

    function reportError() {
        //console.error(error);
    }

    function check({ data, template }) {
        return data && template ? null : new Error("Missing Data or Template");
    }
}
