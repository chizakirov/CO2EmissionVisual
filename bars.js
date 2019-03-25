// select all existing divs inside the body
// and tie data to them
// var bars = d3.select("body")
//             .selectAll("div")
//             .data([4, 8, 15, 16, 20, 12]); //.data() joins elements to the data provided. in this case, a div is an element
// We create the bars variable to hang onto our previous d3 selection
// and preserve the data/elements that we console logged previously.
// In other words, we don't want to lose the _enter and _exit collections.
// As soon as we execute .data(), the _enter and _exit collections are determined.
// Now let's ENTER and create the right amount of divs to supplement our data
// This will append to the body element since we saved the selection previously into
// the bars variable
// bars.enter().append("div"); //enter() invoke these nodes (elements) to be built; append() add whatever elements we choose. The .enter().append() combination builds elements for the data that don't have element representation yet

// Now EXIT and remove any lingering divs we might have had
// In this case we had no surplus of divs to remove.
// bars.exit().remove();

// var getJSON = function(url, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.open('get', url, true);
//   xhr.responseType = 'json';
//   xhr.onload = function() {
//     var status = xhr.status;
//     if (status == 200) {
//       callback(null, xhr.response);
//     } else {
//       callback(status);
//     }
//   };
//   xhr.send();
// };
// getJSON('https://raw.githubusercontent.com/kyleconyers/truthTreeClimate/master/client/public/csvjson.json',     function(err, data) {

  var api = 'https://raw.githubusercontent.com/kyleconyers/truthTreeClimate/master/client/public/csvjson.json';
  document.addEventListener("DOMContentLoaded", function(event) {
  fetch(api)
     .then(function(response) { return response.json(); })
     .then(function(data){
      var parsedData = parseData(data);
      drawChart(parsedData);
     })
  });

function parseData(data){
  var resultArray = [];
  var countryArray = [];
  for(i = 0; i < data.length; i++){
    if(data[i].NAME == "Malaysia"){
      countryArray.push(data[i].NAME);
      console.log("country/state/county name ", data[i].NAME);
      console.log("population ", data[i].POPULATION);
      document.getElementById("search-result").innerHTML = "CO2 Emission with Population Comparable to " + data[i].NAME;
      var popMax = data[i].POPULATION * 1.3;
      var popMin = data[i].POPULATION * 0.9;
    }
    if(data[i].POPULATION <= popMax && data[i].POPULATION >= popMin && data[i].NAME != ""){
      resultArray.push({
        id: +i,
        country: data[i].NAME,
        population: +data[i].POPDENSITY/1000000, //convert string to number
        carbon: +data[i].CARBON
      });
    }
  };

  //sort array of objects
  function compare(a, b){
    const popA = a.population;
    const popB = b.population;
    let comparison = 0;
    if (popA > popB) {
      comparison = 1;
    } else if (popA < popB) {
      comparison = -1;
    }
    return comparison;
  }
  var sortedData = resultArray.sort(compare);
  console.log("population list ", resultArray);
  return sortedData;
}

function drawChart(data){
  var svgWidth = 800, svgHeight = 400;
  var margin = { top: 20, right: 20, bottom: 30, left: 50 };
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  var svg = d3.select('svg')
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  var g = svg.append("g")
              .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")" );
  var x = d3.scaleLinear().rangeRound([0, width]);
  var y = d3.scaleLinear().rangeRound([height, 0]);
  var line= d3.line()
              .x(function(d) { return x(d.population)})
              .y(function(d) { return y(d.carbon)});

  x.domain(d3.extent(data, function(d) { return d.population; }));
  y.domain([0, d3.max(data, function(d) { return d.carbon; })]);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .select(".domain")
    .remove();

  g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Carbon (million tons)");

  g.append("text")
    .call(d3.axisBottom(x))
    .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 20) + ")")
    .attr("text-anchor", "middle")
    .text("Population (million)");

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);
}

function Search(data){
  var input, filter, ul, li, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase(); //search term, convert it to upper case
  ul = document.getElementById("myUL");
  li = ul.getElementsByTagName("li");

  for(i = 0; i < data.length; i++){
    a = data[i].getElementsByTagName("a")[0]; //first letter of each li text
    txtValue = a.textContent || a.innerHTML; //grab the entire li text
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

//BAR CHART
// document.addEventListener('DOMContentLoaded', function(e){
//   var data = [4, 15, 8, 16, 20, 12];
//   d3.select("body")
//             .selectAll("div")
//             .data(data)
//             .enter().append("div")
//             .style("height", function(d) {return d*20+"px"}) // width dynamically changes based on each data 
//             .style("background-color", function(c) { // background-color based on value
//               if(c <= 12){
//                   return "rgb(0,80,0)";
//                 }
//               else{
//                 return "rgb(0,200,0)";
//               }
//             })
//             .text(function(t) {return t});
// });

