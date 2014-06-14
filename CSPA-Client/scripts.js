
var activeMethod = 'ts'; 
var activeResult = 1;
var defaultPrespec = 'RSA0';
var defaultSpec = 1;
var activePrespec,activeSpec,newMethod;
var graph = {margin : {top:10, right:10, bottom:30, left:50}};
var seriesData = [];
var seriesName = '';

initMethod(activeMethod);
initPrespec(defaultPrespec);  
spec(defaultSpec);              
initGraph();

function spec(newSpec) {
    jQuery('#spec'+activeSpec).attr('class','tabPassive');
    jQuery('#spec'+newSpec).attr('class','tabActive');
    jQuery('#'+activeMethod+activeSpec).hide();
	jQuery('#'+newMethod+newSpec).show();	
    activeSpec=newSpec;   
}

function result(newResult) {
    jQuery('#result'+activeResult).attr('class','tabPassive');
    jQuery('#result'+newResult).attr('class','tabActive');
    jQuery('#res'+activeResult).hide();
	jQuery('#res'+newResult).show();	
    activeResult=newResult;   
}

function initMethod(method) {
	$('#methodSelect').children('[value$="'+method+'"]').prop('selected',true);
	activeMethod = newMethod = method;
}

function changeMethod() {
	newMethod = $('#methodSelect').find(":selected").val();
	initPrespec(defaultPrespec); spec(defaultSpec);
	activeMethod = newMethod;
}

function initPrespec(preSpec) {
	$('#prespecSelect').children('[value$="'+preSpec+'"]').prop('selected',true);
	activePrespec = preSpec;
}

function changePrespec() {
	activePrespec = $('#prespecSelect').find(":selected").val();
	spec(defaultSpec);
}

function changeAutoModel(type) {
	$('#'+type+'arima').toggle();
}

function changeCalendarOption(type) {
	if ($('#'+type+'-calendarSpec-option').find(":selected").val() != 'none') $('#'+type+'caldetail').show();
	else $('#'+type+'caldetail').hide();
}

function changeEasterOption(type) {
	if ($('#'+type+'-calendarSpec-movingHolidays-easter-option').find(":selected").val() != 'none') $('#'+type+'eastdetail').show();
	else $('#'+type+'eastdetail').hide();
}

function selectSeries() {
	$('#selectSeries').click();
}

function loadSeries() {
	var files = $('#selectSeries').prop('files');
    if (!files.length || !files[0]) return;
    $('#loadName').hide();
    seriesData = [];
    newGraph();
    $('#adjust').hide();
    $('#loadSpinner').show();
    var reader = new FileReader();
    reader.onload = function(event) {
        if (event.target.readyState == FileReader.DONE) {
        	seriesData = readCsv(event.target.result);
        	seriesName = files[0].name;
        	$('#loadSpinner').hide();
        	if (seriesData) {
        		$('#loadName').text(seriesName).show();
        		$('#adjust').show();
        		plotGraph(seriesData);
        	}	
        }
     };
     reader.readAsText(files[0]);
}

function readCsv(file) {
	
  var lines = file.split(/\r?\n/);
  if (lines.length==0) {alert("Empty file or cannot read file"); return null;}
  var line=lines.shift();
  
  var pattern1 = /^\d+(?:[\.,]\d+)?([,;])\d{2}\D\d{2}\D\d{4}$/;
  var pattern2 = /^\d{2}\D\d{2}\D\d{4}([,;])\d+(?:[\.,]\d+)?$/;
  var ivalue = 0; var sep = ''; 
  while (line) {
	if (pattern1.test(line)) {ivalue=0; var match = pattern1.exec(line); sep = match[1]; break;}  
	if (pattern2.test(line)) {ivalue=1; var match = pattern2.exec(line); sep = match[1]; break;}   
	line = lines.shift();
  }
  if (lines.length==0) {alert("Empty file or cannot read file"); return null;}
  
  var elements, value, date; var data = [];
  while (line) {
	elements = line.split(sep);
	value = parseFloat(elements[ivalue].replace(",","."));
	elements = elements[1-ivalue].split(/\D/); 
	date = new Date(parseInt(elements[2]),parseInt(elements[1])-1,parseInt(elements[0]),0,0,0);
	if (isFinite(value) && isFinite(date)) {data.push({value:value, date:date});}
	line = lines.shift();
  }
  return data;
}

function showSeries() {
	alert(seriesData);
}

function initGraph() {
	graph.width = $('#graph').width() - graph.margin.left - graph.margin.right;
	graph.height = $('#graph').height() - graph.margin.top - graph.margin.bottom;
	graph.x = d3.time.scale().range([0, graph.width]);
	graph.y = d3.scale.linear().range([graph.height, 0]);
}

function newGraph() {
	
	d3.select("svg").remove();
	
	graph.svg = d3.select("#graph")
    			.append("svg").attr("width", $('#graph').width()).attr("height", $('#graph').height())
    			.append("g").attr("transform","translate(" + graph.margin.left + "," + graph.margin.top + ")");
	
	graph.line = d3.svg.line()
				.x(function(d) {return graph.x(d.date);})
				.y(function(d) {return graph.y(d.value);});

	graph.xAxis = d3.svg.axis().scale(graph.x).orient("bottom");
	graph.yAxis = d3.svg.axis().scale(graph.y).orient("left");	
}
 
function plotGraph(data) {
	
	graph.x.domain(d3.extent(data, function(d) { return d.date; }));
	graph.y.domain(d3.extent(data, function(d) { return d.value; }));
	
	graph.svg.append("g")
	         .attr("class","x axis")
	         .attr("transform", "translate(0," + graph.height + ")")
	         .call(graph.xAxis);
    graph.svg.append("g")
	         .attr("class","y axis")
	         .call(graph.yAxis);
	graph.svg.append("path")
	         .datum(data)
	         .attr("class", "line")
	         .attr("d", graph.line);
}
