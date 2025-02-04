(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../release/go.js"], factory);
    }
})(function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    /*
    *  Copyright (C) 1998-2022 by Northwoods Software Corporation. All Rights Reserved.
    */
    var go = require("../release/go.js");
    var myDiagram;
    var myPalette;
    function init() {
        if (window.goSamples)
            window.goSamples(); // init for these samples -- you don't need to call this
        var $ = go.GraphObject.make; // for conciseness in defining templates
        myDiagram =
            $(go.Diagram, 'myDiagramDiv', // must name or refer to the DIV HTML element
            {
                'LinkDrawn': showLinkLabel,
                'LinkRelinked': showLinkLabel,
                'undoManager.isEnabled': true // enable undo & redo
            });
        // when the document is modified, add a "*" to the title and enable the "Save" button
        myDiagram.addDiagramListener('Modified', function (e) {
            var button = document.getElementById('SaveButton');
            if (button)
                button.disabled = !myDiagram.isModified;
            var idx = document.title.indexOf('*');
            if (myDiagram.isModified) {
                if (idx < 0)
                    document.title += '*';
            }
            else {
                if (idx >= 0)
                    document.title = document.title.slice(0, idx);
            }
        });
        // helper definitions for node templates
        function nodeStyle() {
            return [
                // The Node.location comes from the "loc" property of the node data,
                // converted by the Point.parse static method.
                // If the Node.location is changed, it updates the "loc" property of the node data,
                // converting back using the Point.stringify static method.
                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                {
                    // the Node.location is at the center of each node
                    locationSpot: go.Spot.Center
                }
            ];
        }
        // Define a function for creating a "port" that is normally transparent.
        // The "name" is used as the GraphObject.portId,
        // the "align" is used to determine where to position the port relative to the body of the node,
        // the "spot" is used to control how links connect with the port and whether the port
        // stretches along the side of the node,
        // and the boolean "output" and "input" arguments control whether the user can draw links from or to the port.
        function makePort(name, align, spot, output, input) {
            var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
            // the port is basically just a transparent rectangle that stretches along the side of the node,
            // and becomes colored when the mouse passes over it
            return $(go.Shape, {
                fill: "transparent",
                strokeWidth: 0,
                width: horizontal ? NaN : 8,
                height: !horizontal ? NaN : 8,
                alignment: align,
                stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
                portId: name,
                fromSpot: spot,
                fromLinkable: output,
                toSpot: spot,
                toLinkable: input,
                cursor: "pointer",
                mouseEnter: function (e, port) {
                    if (!e.diagram.isReadOnly && port instanceof go.Shape)
                        port.fill = "rgba(255,0,255,0.5)";
                },
                mouseLeave: function (e, port) {
                    if (port instanceof go.Shape)
                        port.fill = "transparent";
                }
            });
        }
        function textStyle() {
            return {
                font: "bold 11pt Helvetica, Arial, sans-serif",
                stroke: "whitesmoke"
            };
        }
        // define the Node templates for regular nodes
        myDiagram.nodeTemplateMap.add("", // the default category
        $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto", $(go.Shape, "Rectangle", { fill: "#00A9C9", strokeWidth: 0 }, new go.Binding("figure", "figure")), $(go.TextBlock, textStyle(), {
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true
        }, new go.Binding("text").makeTwoWay())),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true), makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true), makePort("R", go.Spot.Right, go.Spot.RightSide, true, true), makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)));
        myDiagram.nodeTemplateMap.add("Conditional", $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto", $(go.Shape, "Diamond", { fill: "#00A9C9", strokeWidth: 0 }, new go.Binding("figure", "figure")), $(go.TextBlock, textStyle(), {
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true
        }, new go.Binding("text").makeTwoWay())),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.Top, false, true), makePort("L", go.Spot.Left, go.Spot.Left, true, true), makePort("R", go.Spot.Right, go.Spot.Right, true, true), makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)));
        myDiagram.nodeTemplateMap.add("Start", $(go.Node, "Table", nodeStyle(), $(go.Panel, "Auto", $(go.Shape, "Circle", { minSize: new go.Size(40, 40), fill: "#79C900", strokeWidth: 0 }), $(go.TextBlock, "Start", textStyle(), new go.Binding("text"))),
        // three named ports, one on each side except the top, all output only:
        makePort("L", go.Spot.Left, go.Spot.Left, true, false), makePort("R", go.Spot.Right, go.Spot.Right, true, false), makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)));
        myDiagram.nodeTemplateMap.add("End", $(go.Node, "Table", nodeStyle(), $(go.Panel, "Auto", $(go.Shape, "Circle", { minSize: new go.Size(40, 40), fill: "#DC3C00", strokeWidth: 0 }), $(go.TextBlock, "End", textStyle(), new go.Binding("text"))),
        // three named ports, one on each side except the bottom, all input only:
        makePort("T", go.Spot.Top, go.Spot.Top, false, true), makePort("L", go.Spot.Left, go.Spot.Left, false, true), makePort("R", go.Spot.Right, go.Spot.Right, false, true)));
        // taken from ../extensions/Figures.ts:
        go.Shape.defineFigureGenerator('File', function (shape, w, h) {
            var geo = new go.Geometry();
            var fig = new go.PathFigure(0, 0, true); // starting point
            geo.add(fig);
            fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
            fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
            fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
            fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
            var fig2 = new go.PathFigure(.75 * w, 0, false);
            geo.add(fig2);
            // The Fold
            fig2.add(new go.PathSegment(go.PathSegment.Line, .75 * w, .25 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
            geo.spot1 = new go.Spot(0, .25);
            geo.spot2 = go.Spot.BottomRight;
            return geo;
        });
        myDiagram.nodeTemplateMap.add("Comment", $(go.Node, "Auto", nodeStyle(), $(go.Shape, "File", { fill: "#DEE0A3", strokeWidth: 0 }), $(go.TextBlock, textStyle(), {
            margin: 5,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            editable: true,
            font: "bold 12pt Helvetica, Arial, sans-serif",
            stroke: '#454545'
        }, new go.Binding("text").makeTwoWay())
        // no ports, because no links are allowed to connect with a comment
        ));
        // replace the default Link template in the linkTemplateMap
        myDiagram.linkTemplate =
            $(go.Link, // the whole link panel
            {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5, toShortLength: 4,
                relinkableFrom: true,
                relinkableTo: true,
                reshapable: true,
                resegmentable: true,
                // mouse-overs subtly highlight links:
                mouseEnter: function (e, link) { if (link instanceof go.Link)
                    link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
                mouseLeave: function (e, link) { if (link instanceof go.Link)
                    link.findObject("HIGHLIGHT").stroke = "transparent"; }
            }, new go.Binding("points").makeTwoWay(), $(go.Shape, // the highlight shape, normally transparent
            { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }), $(go.Shape, // the link path shape
            { isPanelMain: true, stroke: "gray", strokeWidth: 2 }), $(go.Shape, // the arrowhead
            { toArrow: "standard", strokeWidth: 0, fill: "gray" }), $(go.Panel, "Auto", // the link label, normally not visible
            { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 }, new go.Binding("visible", "visible").makeTwoWay(), $(go.Shape, "RoundedRectangle", // the label shape
            { fill: "#F8F8F8", strokeWidth: 0 }), $(go.TextBlock, "Yes", // the label
            {
                textAlign: "center",
                font: "10pt helvetica, arial, sans-serif",
                stroke: "#333333",
                editable: true
            }, new go.Binding("text").makeTwoWay())));
        // Make link labels visible if coming out of a "conditional" node.
        // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
        function showLinkLabel(e) {
            var label = e.subject.findObject('LABEL');
            if (label !== null)
                label.visible = (e.subject.fromNode.data.figure === 'Diamond');
        }
        // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
        myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
        myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
        load(); // load an initial diagram from some JSON text
        // initialize the Palette that is on the left side of the page
        myPalette =
            $(go.Palette, 'myPaletteDiv', // must name or refer to the DIV HTML element
            {
                nodeTemplateMap: myDiagram.nodeTemplateMap,
                model: new go.GraphLinksModel([
                    { category: 'Start', text: 'Start' },
                    { text: 'Step' },
                    { category: 'Conditional', text: '???' },
                    { category: 'End', text: 'End' },
                    { category: 'Comment', text: 'Comment' }
                ])
            });
        // Attach to the window so you can manipulate in the console
        window.myDiagram = myDiagram;
        window.myPalette = myPalette;
    } // end init
    exports.init = init;
    // Show the diagram's model in JSON format that the user may edit
    var mySavedModel = document.getElementById('mySavedModel');
    function save() {
        mySavedModel.value = myDiagram.model.toJson();
        myDiagram.isModified = false;
    }
    function load() {
        myDiagram.model = go.Model.fromJson(mySavedModel.value);
    }
    // print the diagram by opening a new window holding SVG images of the diagram contents for each page
    function printDiagram() {
        var svgWindow = window.open();
        if (!svgWindow)
            return; // failure to open a new Window
        var printSize = new go.Size(700, 960);
        var bnds = myDiagram.documentBounds;
        var x = bnds.x;
        var y = bnds.y;
        while (y < bnds.bottom) {
            while (x < bnds.right) {
                var svg = window.myDiagram.makeSvg({ scale: 1.0, position: new go.Point(x, y), size: printSize });
                svgWindow.document.body.appendChild(svg);
                x += printSize.width;
            }
            x = bnds.x;
            y += printSize.height;
        }
        setTimeout(function () { return svgWindow.print(); }, 1);
    }
    // Add listeners for the buttons:
    document.getElementById('SaveButton').addEventListener('click', save);
    document.getElementById('LoadButton').addEventListener('click', load);
    document.getElementById('SVGButton').addEventListener('click', printDiagram);
});
