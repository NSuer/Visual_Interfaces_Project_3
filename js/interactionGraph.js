class InteractionGraph {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            barChartLeftElement: _config.barChartLeftElement, // Left bar chart container
            barChartRightElement: _config.barChartRightElement, // Right bar chart container
            width: 1200, // Graph width
            height: 800, // Graph height
            barChartWidth: 500, // Increased bar chart width
            barChartHeight: 250, // Increased bar chart height
            margin: { top: 40, right: 40, bottom: 40, left: 40 }
        };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Set up SVG area for the graph
        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.width)
            .attr("height", vis.config.height);

        vis.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(200))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(vis.config.width / 2, vis.config.height / 2));

        // Set up left bar chart container
        vis.barChartLeft = d3.select(vis.config.barChartLeftElement)
            .append("svg")
            .attr("width", vis.config.barChartWidth)
            .attr("height", vis.config.barChartHeight)
            .append("g")
            .attr("transform", "translate(60, 40)");

        // Set up right bar chart container
        vis.barChartRight = d3.select(vis.config.barChartRightElement)
            .append("svg")
            .attr("width", vis.config.barChartWidth)
            .attr("height", vis.config.barChartHeight)
            .append("g")
            .attr("transform", "translate(60, 40)");

        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // Prepare nodes and links
        const nodes = Array.from(new Set(vis.data.flatMap(d => [d.Speaker, d.Listener])))
            .map(id => ({ id }));

        const links = vis.data.map(d => ({
            source: d.Speaker,
            target: d.Listener,
            words: d.words
        }));

        // Add links
        const link = vis.svg.selectAll(".link")
            .data(links)
            .join("line")
            .attr("class", "link")
            .style("stroke", "#ccc")
            .style("stroke-width", 2)
            .on("mouseover", (event, d) => {
                console.log("Mouseover link:", d); // Debugging log
                vis.updateBarCharts(d);
            })
            .on("mouseout", () => vis.clearBarCharts());

        // Add nodes
        const node = vis.svg.selectAll(".node")
            .data(nodes)
            .join("circle")
            .attr("class", "node")
            .attr("r", 12)
            .style("fill", "#69b3a2")
            .style("stroke", "#333")
            .style("stroke-width", 1.5)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Add labels
        const label = vis.svg.selectAll(".label")
            .data(nodes)
            .join("text")
            .attr("class", "label")
            .attr("dy", -15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(d => d.id);

        // Update simulation
        vis.simulation.nodes(nodes).on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        vis.simulation.force("link").links(links);

        function dragstarted(event, d) {
            if (!event.active) vis.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) vis.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    updateBarCharts(link) {
        const vis = this;
    
        console.log("Updating bar charts for link:", link); // Debugging log
    
        // Clear both charts first
        vis.clearBarCharts();
    
        // Get source and target IDs properly
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
        // Left bar chart will show the original link (source → target)
        const leftWords = link.words.split(", ").slice(0, 20).map(word => {
            const [wordText, count] = word.split(" ");
            return { 
                word: wordText.replace(/[()]/g, ""), 
                count: parseInt(count.replace(/[()]/g, ""), 10) 
            };
        });
        vis.updateBarChart(vis.barChartLeft, leftWords, `${sourceId} → ${targetId}`);
    
        // Find reverse link (target → source)
        const reverseLink = vis.data.find(d => {
            const dSource = typeof d.Speaker === 'object' ? d.Speaker.id : d.Speaker;
            const dTarget = typeof d.Listener === 'object' ? d.Listener.id : d.Listener;
            return dSource === targetId && dTarget === sourceId;
        });
    
        // Right bar chart will show the reverse link if it exists
        if (reverseLink) {
            const rightWords = reverseLink.words.split(", ").slice(0, 20).map(word => {
                const [wordText, count] = word.split(" ");
                return { 
                    word: wordText.replace(/[()]/g, ""), 
                    count: parseInt(count.replace(/[()]/g, ""), 10) 
                };
            });
            vis.updateBarChart(vis.barChartRight, rightWords, `${targetId} → ${sourceId}`);
        } else {
            // Show empty chart with message if no reverse link exists
            vis.updateBarChart(vis.barChartRight, [], `${targetId} → ${sourceId}`);
            vis.barChartRight.append("text")
                .attr("x", 100)
                .attr("y", 100)
                .attr("text-anchor", "middle")
                .text("No interaction data");
        }
    }

    updateBarChart(container, data, title) {
        const vis = this;

        // Set up scales with fallback for empty data
        const x = d3.scaleBand()
            .domain(data.length ? data.map(d => d.word) : [])
            .range([0, vis.config.barChartWidth - 100]) // Adjusted for larger width
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, data.length ? d3.max(data, d => d.count) : 1])
            .range([vis.config.barChartHeight - 100, 0]); // Adjusted for larger height

        // Add title (always shown)
        container.selectAll(".title")
            .data([title])
            .join("text")
            .attr("class", "title")
            .attr("x", (vis.config.barChartWidth - 100) / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px") // Increased font size
            .text(d => d);

        // Add bars (empty if no data)
        container.selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.word))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => vis.config.barChartHeight - 100 - y(d.count))
            .style("fill", "#69b3a2");

        // Add axes (always shown)
        container.selectAll(".x-axis")
            .data([0])
            .join("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.config.barChartHeight - 100})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "12px") // Adjusted font size for axis labels
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        container.selectAll(".y-axis")
            .data([0])
            .join("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(5))
            .selectAll("text")
            .style("font-size", "12px"); // Adjusted font size for axis labels
    }

    clearBarCharts() {
        const vis = this;

        // Clear both bar charts
        vis.barChartLeft.selectAll("*").remove();
        vis.barChartRight.selectAll("*").remove();
    }
}

// Load data and initialize the graph
d3.csv("data/adjacency_matrix_top_words.csv").then(data => {
    const processedData = data.filter(d => d["Top Words"] !== "").map(d => ({
        Speaker: d.Speaker,
        Listener: d.Listener,
        words: d["Top Words"]
    }));

    new InteractionGraph({
        parentElement: "#interactionGraph",
        barChartLeftElement: "#barChartLeft",
        barChartRightElement: "#barChartRight"
    }, processedData);
}).catch(error => {
    console.error("Error loading the adjacency matrix data:", error);
});