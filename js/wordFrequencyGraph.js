class WordFrequencyGraph {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            characters: _config.characters,
            width: 800,
            height: 400,
            margin: { top: 50, right: 30, bottom: 50, left: 60 }
        };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Set up SVG area
        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.width)
            .attr("height", vis.config.height);

        vis.chartArea = vis.svg.append("g")
            .attr("transform", `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.chartWidth = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.chartHeight = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

        // Scales
        vis.xScale = d3.scaleBand().range([0, vis.chartWidth]).padding(0.2);
        vis.yScale = d3.scaleLinear().range([vis.chartHeight, 0]);

        // Axes
        vis.xAxis = vis.chartArea.append("g")
            .attr("transform", `translate(0, ${vis.chartHeight})`);
        vis.yAxis = vis.chartArea.append("g");

        // Axes labels
        vis.svg.append("text")
            .attr("x", vis.config.margin.left + vis.chartWidth / 2)
            .attr("y", vis.config.height - 10)
            .attr("text-anchor", "middle")
            .text("Words");

        vis.svg.append("text")
            .attr("x", -vis.config.margin.top - vis.chartHeight / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Frequency");

        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // Filter data for selected characters
        const filteredData = vis.data.filter(d => 
            d.characters.includes(vis.selectedCharacters[0]) &&
            d.characters.includes(vis.selectedCharacters[1])
        );

        // Count word frequencies
        const wordCounts = {};
        filteredData.forEach(scene => {
            scene.words.forEach(word => {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            });
        });

        // Prepare data for the bar chart
        const chartData = Object.entries(wordCounts).map(([word, count]) => ({ word, count }));
        chartData.sort((a, b) => b.count - a.count); // Sort by frequency

        // Update scales
        vis.xScale.domain(chartData.map(d => d.word));
        vis.yScale.domain([0, d3.max(chartData, d => d.count)]);

        // Update axes
        vis.xAxis.call(d3.axisBottom(vis.xScale).tickFormat(d => d.length > 10 ? d.slice(0, 10) + "..." : d));
        vis.yAxis.call(d3.axisLeft(vis.yScale));

        // Bind data to bars
        const bars = vis.chartArea.selectAll(".bar")
            .data(chartData, d => d.word);

        // Enter
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.xScale(d.word))
            .attr("y", d => vis.yScale(d.count))
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => vis.chartHeight - vis.yScale(d.count))
            .style("fill", "steelblue");

        // Update
        bars.attr("x", d => vis.xScale(d.word))
            .attr("y", d => vis.yScale(d.count))
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => vis.chartHeight - vis.yScale(d.count));

        // Exit
        bars.exit().remove();
    }

    setSelectedCharacters(characters) {
        this.selectedCharacters = characters;
        this.updateVis();
    }
}

// Load data and initialize the graph
d3.csv("data/scene_word_bank.csv").then(data => {
    // Preprocess data
    const processedData = data.map(d => ({
        scene: d.Scene,
        characters: d.Speaker.split(", "),
        words: d.Words.split(" ")
    }));

    // Initialize graph
    const wordFrequencyGraph = new WordFrequencyGraph({
        parentElement: "#wordFrequencyGraph",
        characters: ["Michael", "Dwight", "Pam", "Kevin", "Oscar", "Jim", "Angela"]
    }, processedData);

    // Add dropdowns for character selection
    const dropdown1 = d3.select("#character1")
        .on("change", function() {
            const selected1 = this.value;
            const selected2 = dropdown2.property("value");
            wordFrequencyGraph.setSelectedCharacters([selected1, selected2]);
        });

    const dropdown2 = d3.select("#character2")
        .on("change", function() {
            const selected1 = dropdown1.property("value");
            const selected2 = this.value;
            wordFrequencyGraph.setSelectedCharacters([selected1, selected2]);
        });

    // Populate dropdowns
    const characters = ["Michael", "Dwight", "Pam", "Kevin", "Oscar", "Jim", "Angela"];
    dropdown1.selectAll("option")
        .data(characters)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    dropdown2.selectAll("option")
        .data(characters)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Set initial selection
    dropdown1.property("value", "Michael");
    dropdown2.property("value", "Dwight");
    wordFrequencyGraph.setSelectedCharacters(["Michael", "Dwight"]);
});