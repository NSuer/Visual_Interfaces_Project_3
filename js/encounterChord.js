class EncounterChord {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            characterNames: _config.characterNames,
        };
        this.data = _data;

        this.initVis();
    }

    initVis() {

        let vis = this

        // create the svg area
        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", 500)
            .attr("height", 500)
            .append("g")
            .attr("transform", "translate(350,250)")
            .attr("id", "gamer")

        // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
        // Its opacity is set to 0: we don't see it by default.
        vis.tooltip = d3.select(vis.config.parentElement)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        // A function that change this tooltip when the user hover a point.
        // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
        vis.showTooltip = function (event, d) {
            console.log(d)
            vis.tooltip
                .style("opacity", 1)
                .html(vis.config.characterNames[d.target.index] + " shared " + d.target.value + " scene(s) with " + vis.config.characterNames[d.source.index] + ".")

        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        vis.hideTooltip = function (event, d) {
            vis.tooltip
                .transition()
                .duration(150)
                .style("opacity", 0)
        }

        vis.updateVis()

    }

    updateVis() {

        let vis = this

        console.log("called updatevis in encounterChord")

        // nuke all previous paths/arcs
        const myNode = document.getElementById("gamer");
        myNode.innerHTML = '';

        // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
        const res = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending)
            (vis.data)

        // add the groups on the inner part of the circle
        vis.innerPaths = vis.svg
            .datum(res)
            .append("g")
            .selectAll("g")
            .data(d => d.groups)
            .join("g")
            .append("path")
            .style("fill", "grey")
            .style("stroke", "black")
            .attr("d", d3.arc()
                .innerRadius(230)
                .outerRadius(240)
            )

        

        // Add the links between groups
        vis.svg
            .datum(res)
            .append("g")
            .selectAll("path")
            .data(d => d)
            .join("path")
            .attr("d", d3.ribbon()
                .radius(220)
            )
            .style("fill", "#69b3a2")
            .style("stroke", "black")
            .on("mouseover", vis.showTooltip)
            .on("mouseleave", vis.hideTooltip)
    }


}