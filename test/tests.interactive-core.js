//////////////////////////////////////////////////////////////////////////////
// QUnit 'sigplot-interactive-core' module
//
// This module tests all the core-basic behaviors and should be kept short
// so it's easier for a developer to quickly determine if they broke anything.
// If too many tests are included in the core set then developers will be 
// discouraged from running them.
//
//////////////////////////////////////////////////////////////////////////////
QUnit.module('sigplot-interactive-core', {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach
});

interactiveTest('sigplot empty', 'Do you see an empty plot scaled from -1 to 1 on both axis?', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(ifixture.childNodes.length, 2);
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    assert.equal(container.childNodes.length, 1);
    assert.equal(container.childNodes[0], plot._Mx.parent);
    assert.equal(plot._Mx.parent.childNodes.length, 2);
    assert.equal(plot._Mx.parent.childNodes[0], plot._Mx.canvas);
    assert.equal(plot._Mx.parent.childNodes[1], plot._Mx.wid_canvas);
    assert.equal(plot._Mx.canvas.width, 600);
    assert.equal(plot._Mx.canvas.height, 400);
    assert.equal(plot._Mx.canvas.style.position, "absolute");
    assert.equal(plot._Mx.wid_canvas.width, 600);
    assert.equal(plot._Mx.wid_canvas.height, 400);
    assert.equal(plot._Mx.wid_canvas.style.position, "absolute");
});

interactiveTest('sigplot 1d overlay', 'Do you see a ramp from 0 to 1023?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp"
    });
});

interactiveTest('sigplot 1d reload', 'Do you see a ramp from 0 to 1023?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var lyr_n = plot.overlay_array([], {}, {
        layerType: sigplot.Layer1D
    });

    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }

    plot.reload(lyr_n, ramp, {
        file_name: "ramp"
    });
});

interactiveTest('sigplot file overlay', 'Do you see a sin wave?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_href("dat/sin.tmp", null, {
        name: "x"
    });
});

interactiveTest('scrolling line', 'Do you see a scrolling random data plot (0 to 1 ) that does not scale', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        ymin: -2,
        ymax: 2
    });
    var lyr0 = plot.overlay_pipe({
        type: 1000
    }, {
        framesize: 32768,
        drawmode: "scrolling"
    });
    ifixture.interval = window.setInterval(function() {
        var random = [];
        for (var i = 0; i < 100; i += 1) {
            random.push(Math.random());
        }
        plot.push(lyr0, random);
    }, 100);
});

interactiveTest('autoy with all zeros', 'Does the autoscaling properly work and keep both magenta and blue lines fully visible?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autoy: 3
    });
    assert.notEqual(plot, null);
    var random = [];
    var zeros = [];
    for (var i = 0; i <= 1000; i += 1) {
        random.push(Math.random());
        zeros.push(0);
    }
    var zeros_lyr = plot.overlay_array(zeros);
    var rand1_lyr = plot.overlay_array(zeros);
    var rand2_lyr = plot.overlay_array(zeros);
    var iter = 1;
    ifixture.interval = window.setInterval(function() {
        plot.reload(zeros_lyr, zeros, {});
        for (var i = 0; i <= 1000; i += 1) {
            random[i] = iter * Math.random();
        }
        plot.reload(rand1_lyr, random, {});
        for (var i = 0; i <= 1000; i += 1) {
            random[i] = -1 * iter * Math.random();
        }
        plot.reload(rand2_lyr, random, {});
        iter += 1;
    }, 500);
});

interactiveTest('autoy with all zeros (pipe)', 'Does the autoscaling properly work?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autol: 2,
        autoy: 3
    });
    assert.notEqual(plot, null);
    var random = [];
    var zeros = [];
    for (var i = 0; i <= 1000; i += 1) {
        random.push(Math.random());
        zeros.push(0);
    }
    var zeros_lyr = plot.overlay_pipe({}, {
        framesize: 1000
    });
    var rand1_lyr = plot.overlay_pipe({}, {
        framesize: 1000
    });
    var rand2_lyr = plot.overlay_pipe({}, {
        framesize: 1000
    });
    var iter = 1;
    ifixture.interval = window.setInterval(function() {
        plot.push(zeros_lyr, zeros);
        for (var i = 0; i <= 1000; i += 1) {
            random[i] = iter * Math.random();
        }
        plot.push(rand1_lyr, random);
        for (var i = 0; i <= 1000; i += 1) {
            random[i] = -1 * iter * Math.random();
        }
        plot.push(rand2_lyr, random);
        iter += 1;
    }, 500);
});

interactiveTest('sigplot symbol', 'Do you see 5 triangle symbols on a line?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 5; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, null, {
        name: "x",
        symbol: 6,
    });
});

interactiveTest('sigplot symbol', 'Do you see 5 triangle symbols?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 5; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, null, {
        name: "x",
        symbol: 6,
        line: 0
    });
});

interactiveTest('complex dots', 'Do you see a cluster of dots near 0,0?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        cmode: 5
    });
    var framesize = 1024;
    var lyr0 = plot.overlay_pipe({
        file_name: "constellation",
        format: "CF"
    }, {
        framesize: framesize,
        line: 0,
        radius: 1,
        symbol: 1
    });
    plot.change_settings({
        cmode: 5,
        ymin: -2,
        ymax: 2,
        xmin: -2,
        xmax: 2
    });
    ifixture.interval = window.setInterval(function() {
        var data = [];
        for (var i = 0; i < framesize; i += 1) {
            data.push((Math.random() * 2) - 1);
            data.push((Math.random() * 2) - 1);
        }
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('rescale', 'Do you see a plot that scales -2 to 2?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var data1 = [];
    for (var i = 0; i < 1024; i++) {
        data1.push(i % 2);
    }
    plot.overlay_array(data1, {
        file_name: "data1"
    });
    var data2 = [];
    for (var i = 0; i < 2048; i++) {
        if (i % 2) {
            data2.push(2);
        } else {
            data2.push(-2);
        }
    }
    plot.overlay_array(data2, {
        file_name: "data2"
    });
    plot.rescale();
});

interactiveTest('rescaling after remove', 'do you seen a line in the upper left?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    plot.remove_layer(0);
    plot.overlay_array([1, 2, 3, 4, 5, 6]);
    plot.change_settings({
        xmin: 1,
        xmax: 6
    });

    plot.remove_layer(0);
    plot.overlay_array([3, 4, 5, 6, 7]);
    plot.change_settings({
        xmin: 3,
        xmax: 7
    });
});

interactiveTest('sigplot 2d overlay', 'Do you see a raster? Is alignment of x/y axes correct?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var data = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0]
    ];
    plot.overlay_array(data);
});

interactiveTest('sigplot 2d reload', 'Do you see a raster? Is alignment of x/y axes correct?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var lyr_n = plot.overlay_array([], {}, {
        layerType: sigplot.Layer2D
    });
    var data = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0]
    ];
    plot.reload(lyr_n, data);
});

interactiveTest('sigplot 2d overlay ArrayBuffer', 'Do you see a raster? Is alignment of x/y axes correct?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var data = [];

    var data = [
        new Float32Array([1, 2, 3, 4, 5]),
        new Float32Array([6, 7, 8, 9, 0]),
        new Float32Array([1, 2, 3, 4, 5]),
        new Float32Array([6, 7, 8, 9, 0])
    ];
    plot.overlay_array(data);
});

interactiveTest('sigplot penny', 'Do you see a raster of a penny', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
});

// By default, rasters have their autolevel set by the
// first 16 raster-lines.
interactiveTest('t2000 file (default autol)', 'Is the plot red below the ~16th line?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    var framesize = 128;
    var height = 120;

    var raster = [];
    for (var j = 0; j < height; j += 1) {
        for (var i = 0; i < framesize; i += 1) {
            raster.push(j);
        }
    }

    plot.overlay_array(raster, {
        type: 2000,
        subsize: framesize,
        file_name: "raster"
    });
});

interactiveTest('scrolling raster', 'Do you see a scrolling raster?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(-1 * (i + 1));
        }
        plot.push(lyr0, ramp);
    }, 100);
});

interactiveTest('falling raster', 'Do you see a falling raster?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    }, {
        drawmode: "falling"
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp);
    }, 100);
});

interactiveTest('rising raster', 'Do you see a rising raster?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    }, {
        drawmode: "rising"
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp);
    }, 100);
});

interactiveTest('large framesize falling raster', 'Do you see a falling raster?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5,
        all: true
    });
    var framesize = 128000;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i);
        }
        plot.push(lyr0, ramp);
    }, 100);
});

interactiveTest('complex data falling raster', 'Do you see a falling raster?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        format: "CF",
        ydelta: 0.25
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
            ramp.push(-1 * (i + 1));
        }
        plot.push(lyr0, ramp);
    }, 100);
});

