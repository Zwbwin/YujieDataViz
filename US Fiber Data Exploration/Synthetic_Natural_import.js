//Setting up the SVG where we'll be appending everything for our chart
const width = document.querySelector("#chart").clientWidth;
const height = document.querySelector("#chart").clientHeight;
const margin = { top: 15, left: 150, right: 50, bottom: 80 };

//Function to set up the tabs interaction
function showVis(evt) {
    // Declare all variables
    let i, tablinks;

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    evt.currentTarget.className += " active";
}

const initialBtn = d3.select("#initialData");
const updateBtn = d3.select("#updateData")

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let xAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height-margin.bottom})`)

let yAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)

// let bar=svg.append("bar").attr("class","myBar")


d3.csv("./data/USTextile.csv", parse).then(function (data) {

    /* filter subset of data, grabbing only the rows where the country = China */
    const filtered_synthetic_import = data.filter(d => d.import_export === "import" && d.year === 2020 && d.fiber_type === "raw_synthetic");
    const filtered_natural_import = data.filter(d => d.import_export === "import" && d.year === 2020 && d.fiber_type !== "raw_synthetic");

    console.log(filtered_synthetic_import);
    console.log(filtered_natural_import);


    function draw(dataset) {

        //different form-different code? how to do?
        let nested = d3.nest()
            .key(d => d.month)
            .rollup(d => d3.sum(d, g => g.value))
            .entries(dataset)

        nested.forEach(d => d.key = +d.key)

        console.log(nested)
        //scales: we'll use a band scale for the bars
        const xScale = d3.scaleBand()
            .domain(nested.map(d => d.key))
            .range([margin.left, width - margin.right])
            .padding(0.5);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(nested, d => d.value)])
            .range([height - margin.bottom, margin.top]);

        //a little helper function for better transitions
        function zeroState(selection) {
            selection.attr('y', yScale(0));
            selection.attr('height', 0);
        }

        /*making the bars in the barchart:
        uses filtered data
        defines height and width of bars
        */
        let bar = svg.selectAll("rect")
            .data(nested)

        bar
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.key))
            .attr("width", xScale.bandwidth())
            .call(zeroState)
            .merge(bar)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))

            .attr("height", d => height - margin.bottom - yScale(d.value))
            .attr("fill", "palevioletred");

        bar.exit()
            .transition()
            .duration(1000)
            .call(zeroState)
            .remove();


        xAxis.transition().duration(500).call(d3.axisBottom().scale(xScale));
        yAxis.transition().duration(500).call(d3.axisLeft().scale(yScale));
    }

    const xAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", width / 2.2)
        .attr("y", height - margin.bottom / 2.5)
        .text("Year 2020 by Month");

    const yAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 1.6)
        .attr("y", margin.left / 2.5)
        .text("Seasonal Import Sum");

    draw(filtered_natural_import);

    initialBtn.on("click", function () {
        draw(filtered_natural_import)
    });
    updateBtn.on("click", function () {
        draw(filtered_synthetic_import)
    });


});

//get the data in the right format




function parse(d) {
    return {
        fiber_type: d.fiber_type, //cotton, silk, wool, etc.
        import_export: d.import_export, //this is a binary value
        category: d.category, //yarn, apparel, home, etc.
        sub_category: d.sub_category, //type of yarn, type of home
        year: +d.year, //we want this as a number
        month: +d.month, //we want this as a number
        value: +d.value //we want this as a number
    }
}