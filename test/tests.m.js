/**
 * @license
 * File: tests.js
 * Copyright (c) 2012-2017, LGS Innovations Inc., All rights reserved.
 * Copyright (c) 2019-2020, Spectric Labs Inc., All rights reserved.
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

/* globals QUnit, sigplot, ColorMap, sigplot_plugins, assert, assert.strictEqual, QUnit.asyncTest, assert.notEqual, alert, BlueFileReader, start, ok, throws, interactiveBeforeEach, interactiveAfterEach, interactiveTest, fixture, ifixture */
//////////////////////////////////////////////////////////////////////////////
// QUnit 'm' module
//////////////////////////////////////////////////////////////////////////////
QUnit.module("m", {
    setup: function () {},
    teardown: function () {},
});
QUnit.test("m sec2tod test", function (assert) {
    var secs = 0;
    assert.equal(sigplot.m.sec2tod(0), "00:00:00.000000");
    assert.equal(sigplot.m.sec2tod(1), "00:00:01.000000");
    assert.equal(sigplot.m.sec2tod(60), "00:01:00.000000");
    assert.equal(sigplot.m.sec2tod(3600), "01:00:00.000000");
    assert.equal(sigplot.m.sec2tod(43200), "12:00:00.000000");
    assert.equal(sigplot.m.sec2tod(86399), "23:59:59.000000");
    assert.equal(sigplot.m.sec2tod(86400), "24:00:00.000000");
    assert.equal(sigplot.m.sec2tod(86401), "1::00:00:01.000000");
    assert.equal(sigplot.m.sec2tod(86400 + 43200), "1::12:00:00.000000");
    assert.equal(sigplot.m.sec2tod(31535999), "364::23:59:59.000000");
    assert.equal(sigplot.m.sec2tod(31536000), "1951:01:01::00:00:00.000000");
    assert.equal(sigplot.m.sec2tod(-31535999), "-364::23:59:59.000000");
    assert.equal(sigplot.m.sec2tod(-31536000), "1949:01:01::00:00:00.000000");
    assert.equal(sigplot.m.sec2tod(-31536001), "1948:12:31::23:59:59.000000");
    assert.equal(sigplot.m.sec2tod(0.5), "00:00:00.500000");
    assert.equal(sigplot.m.sec2tod(-0.5), "-0::00:00:00.500000");
    assert.equal(sigplot.m.sec2tod(86400.5), "1::00:00:00.500000");
    assert.equal(sigplot.m.sec2tod(86401.5), "1::00:00:01.500000");
    assert.equal(sigplot.m.sec2tod(86400.5), "1::00:00:00.500000");
    assert.equal(sigplot.m.sec2tod(31535999.5), "364::23:59:59.500000");
    assert.equal(sigplot.m.sec2tod(-31535999.5), "-364::23:59:59.500000");
    assert.equal(sigplot.m.sec2tod(-31536000.5), "1948:12:31::23:59:59.500000");
    assert.equal(sigplot.m.sec2tod(-31536001.5), "1948:12:31::23:59:58.500000");
    assert.equal(sigplot.m.sec2tod(0.5, true), "00:00:00.5");
    assert.equal(sigplot.m.sec2tod(-0.5, true), "-0::00:00:00.5");
    assert.equal(sigplot.m.sec2tod(86400.5, true), "1::00:00:00.5");
    assert.equal(sigplot.m.sec2tod(86401.5, true), "1::00:00:01.5");
    assert.equal(sigplot.m.sec2tod(86400.5, true), "1::00:00:00.5");
    assert.equal(sigplot.m.sec2tod(31535999.5, true), "364::23:59:59.5");
    assert.equal(sigplot.m.sec2tod(-31535999.5, true), "-364::23:59:59.5");
    assert.equal(
        sigplot.m.sec2tod(-31536000.5, true),
        "1948:12:31::23:59:59.5"
    );
    assert.equal(
        sigplot.m.sec2tod(-31536001.5, true),
        "1948:12:31::23:59:58.5"
    );
});
