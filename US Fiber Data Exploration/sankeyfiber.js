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


function _1(md){return(
md``
)}


async function _data(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("US_Textile_Fiber_Trade.csv").text(), d3.autoType)
)}

// filtered_sankey_import = data.filter(d => d.import_export === "import" && d.year === 2020);
// filtered_sankey_export = data.filter(d => d.import_export === "export" && d.year === 2020);

function _filtered(data){return(
data.filter(d => d.import_export === "import" && d.year === 2020)
)}


function _keys(){return(
["category", "fiber_type", "import_export"]
)}

function _chart(d3,width,height,sankey,graph,color)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height-190]);

  const {nodes, links} = sankey({
    nodes: graph.nodes.map(d => Object.assign({}, d)),
    links: graph.links.map(d => Object.assign({}, d))
  });

  svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
    .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => color(d.names[0]))
      .attr("stroke-width", d => d.width)
      .style("mix-blend-mode", "multiply")
    .append("title")
      .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .style("font", "8px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
    .append("tspan")
      .attr("fill-opacity", 0.7)
      .text(d => ` ${d.value.toLocaleString()}`);

  return svg.node();
}

function _width(){return(
720
)}
function _height(){return(
480
)}

function _sankey(d3,width,height){return(
d3.sankey()
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(5)
    .nodePadding(12)
    .extent([[50, 10], [width-50, height - 200]])
)}

function _graph(keys,filtered_sankey_import)
{
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map;
  const indexByKey = new Map;
  const links = [];

  for (const k of keys) {
    for (const d of filtered_sankey_import) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map;
    for (const d of filtered_sankey_import) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  return {nodes, links};
}


function _color(d3){return(
d3.scaleOrdinal(["apparel"], ["palevioletred"]).unknown("#ccc")
)}

function _d3(require){return(
require("d3@6", "d3-sankey@0.12")
)}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["US_Textile_Fiber_Trade.csv", {url: new URL("./files/7ae5b30af1fa70279d3aa9ffab644020f95cb4ca2afe7138b6c39f879b6f748dda8c43415b92e3cd3e8a7eee61f723813b04ba0953ac0ec1a56d5b63279835fe.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], _data);
  main.variable(observer("filtered")).define("filtered", ["data"], _filtered);
  main.variable(observer("keys")).define("keys", _keys);
  main.variable(observer("chart")).define("chart", ["d3","width","height","sankey","graph","color"], _chart);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("sankey")).define("sankey", ["d3","width","height"], _sankey);
  main.variable(observer("graph")).define("graph", ["keys","filtered"], _graph);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
