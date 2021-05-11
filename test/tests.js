/**
 * @license
 * File: tests.js
 * Copyright (c) 2012-2017, LGS Innovations Inc., All rights reserved.
 *
 * This file is part of SigPlot.
 *
 * Licensed to the LGS Innovations (LGS) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  LGS licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* globals QUnit, sigplot, ColorMap, sigplot_plugins, assert, assert.strictEqual, QUnit.asyncTest, assert.notEqual, alert, BlueFileReader, start, ok, throws */

var fixture = document.getElementById("qunit-fixture");
var ifixture = document.getElementById("interactive-fixture");

var enableInteractive = true;
sigplot.m.log.setLevel("trace");
if (/PhantomJS/.test(window.navigator.userAgent)) {
    enableInteractive = false;
    sigplot.m.log.setLevel("error");
}

function interactiveTest(testName, msg, callback) {
    if (!ifixture) {
        return;
    }
    var wrapped_callback = function (assert) {
        var done = assert.async();

        callback(assert);

        if (enableInteractive) {
            var toolbar = document.getElementById("qunit-testrunner-toolbar");
            var question = document.createElement("div");
            toolbar.appendChild(question);
            question.innerHTML =
                "<input id='askOkYes' type='button' value='Yes'></input>" +
                "<input id='askOkNo' type='button' value='No'></input>" +
                "<span>" +
                msg +
                "?</span>";
            var askOkYes = document.getElementById("askOkYes");
            askOkYes.onclick = function () {
                question.innerHTML = "";
                assert.ok(true, msg);
                done();
            };
            var askOkNo = document.getElementById("askOkNo");
            askOkNo.onclick = function () {
                question.innerHTML = "";
                assert.ok(false, msg);
                done();
            };
        } else {
            done();
        }
    };
    QUnit.test(testName, wrapped_callback);
}

function interactiveBeforeEach() {
    ifixture.innerHTML = "";
    var plotdiv = document.createElement("div");
    plotdiv.id = "plot";
    plotdiv.style.margin = "0 auto";
    plotdiv.style.width = "600px";
    plotdiv.style.height = "400px";
    ifixture.appendChild(plotdiv);
    plotdiv = document.createElement("div");
    plotdiv.id = "plot2";
    plotdiv.style.margin = "0 auto";
    plotdiv.style.width = "600px";
    plotdiv.style.height = "400px";
    plotdiv.style.display = "none";
    ifixture.appendChild(plotdiv);
}

function interactiveAfterEach() {
    ifixture.innerHTML = "";
    if (ifixture.interval) {
        window.clearInterval(ifixture.interval);
        ifixture.interval = undefined;
    }
}
