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

        // set the dimensions and margins of the graph
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10}
        vis.width = 400 - vis.margin.left - vis.margin.right
        vis.height = 450 - vis.margin.top - vis.margin.bottom;

        // append the svg object to the body of the page
        cloudSVG = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("id", "superAwesomeSVG")
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("id", "hi")

        vis.updateVis()

    }

    updateVis() {

        let vis = this
        const myNode = document.getElementById("hi");
        myNode.innerHTML = '';

        console.log("data into UpdateVis")
        vis.data.map(function(d) { console.log(d); return {text: d.word, size:d.size}; })

        // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
        // Wordcloud features that are different from one word to the other must be here
        cloudLayout = d3.layout.cloud()
            .size([vis.width, vis.height])
            .words(vis.data.map(function(d) { return {text: d.word, size: d.count / 5 + 15}; }))
            .padding(10)        //space between words
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(function(d) { return d.size; })      // font size of words
            .on("end", vis.draw);
        cloudLayout.start();

    }

    // This function takes the output of 'layout' above and draw the words
// Wordcloud features that are THE SAME from one word to the other can be here
    draw(words) {

        let vis = this;

        console.log("data in draw()")
        console.log(cloudLayout)

        let svg = document.getElementById("superAwesomeSVG")
        console.log(svg)
        //myNode.innerHTML = '';
        console.log(cloudLayout.size())

        cloudSVG
            .append("g")
            //.attr("transform", "translate(" + cloudLayout.size()[0] / 2 + "," + cloudLayout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size; })
            .style("fill", "#69b3a2")
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function(d) {
                return "translate(" + [d.x + 325, d.y + 220] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }


}