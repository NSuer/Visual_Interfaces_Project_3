class WordCloud {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            colors: _config.colors
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


        vis.updateVis()

    }

    updateVis() {

        let vis = this


    }


}