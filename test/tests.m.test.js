/**
 * @license
 * File: tests.m.test.js
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

import { describe, it, expect } from "vitest";

describe("m", () => {
    it("m sec2tod test", () => {
        expect(sigplot.m.sec2tod(0)).toBe("00:00:00.000000");
        expect(sigplot.m.sec2tod(1)).toBe("00:00:01.000000");
        expect(sigplot.m.sec2tod(60)).toBe("00:01:00.000000");
        expect(sigplot.m.sec2tod(3600)).toBe("01:00:00.000000");
        expect(sigplot.m.sec2tod(43200)).toBe("12:00:00.000000");
        expect(sigplot.m.sec2tod(86399)).toBe("23:59:59.000000");
        expect(sigplot.m.sec2tod(86400)).toBe("24:00:00.000000");
        expect(sigplot.m.sec2tod(86401)).toBe("1::00:00:01.000000");
        expect(sigplot.m.sec2tod(86400 + 43200)).toBe("1::12:00:00.000000");
        expect(sigplot.m.sec2tod(31535999)).toBe("364::23:59:59.000000");
        expect(sigplot.m.sec2tod(31536000)).toBe("1951:01:01::00:00:00.000000");
        expect(sigplot.m.sec2tod(-31535999)).toBe("-364::23:59:59.000000");
        expect(sigplot.m.sec2tod(-31536000)).toBe("1949:01:01::00:00:00.000000");
        expect(sigplot.m.sec2tod(-31536001)).toBe("1948:12:31::23:59:59.000000");
        expect(sigplot.m.sec2tod(0.5)).toBe("00:00:00.500000");
        expect(sigplot.m.sec2tod(-0.5)).toBe("-0::00:00:00.500000");
        expect(sigplot.m.sec2tod(86400.5)).toBe("1::00:00:00.500000");
        expect(sigplot.m.sec2tod(86401.5)).toBe("1::00:00:01.500000");
        expect(sigplot.m.sec2tod(86400.5)).toBe("1::00:00:00.500000");
        expect(sigplot.m.sec2tod(31535999.5)).toBe("364::23:59:59.500000");
        expect(sigplot.m.sec2tod(-31535999.5)).toBe("-364::23:59:59.500000");
        expect(sigplot.m.sec2tod(-31536000.5)).toBe("1948:12:31::23:59:59.500000");
        expect(sigplot.m.sec2tod(-31536001.5)).toBe("1948:12:31::23:59:58.500000");
        expect(sigplot.m.sec2tod(0.5, true)).toBe("00:00:00.5");
        expect(sigplot.m.sec2tod(-0.5, true)).toBe("-0::00:00:00.5");
        expect(sigplot.m.sec2tod(86400.5, true)).toBe("1::00:00:00.5");
        expect(sigplot.m.sec2tod(86401.5, true)).toBe("1::00:00:01.5");
        expect(sigplot.m.sec2tod(86400.5, true)).toBe("1::00:00:00.5");
        expect(sigplot.m.sec2tod(31535999.5, true)).toBe("364::23:59:59.5");
        expect(sigplot.m.sec2tod(-31535999.5, true)).toBe("-364::23:59:59.5");
        expect(sigplot.m.sec2tod(-31536000.5, true)).toBe("1948:12:31::23:59:59.5");
        expect(sigplot.m.sec2tod(-31536001.5, true)).toBe("1948:12:31::23:59:58.5");
    });
});
