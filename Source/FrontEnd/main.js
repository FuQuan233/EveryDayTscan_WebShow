var dates = []
var dateIndex = -1
var curDate = "无数据"
var pattern = /\[.+\/(.+\/.+)\].*\((Information|Critical|Serious|Warning)\)(.+)/

window.onload = function(){
	getRecordDate(true)
}

var timer = setInterval(function() {
	var hours = new Date().getHours();
	var min = new Date().getMinutes();
	console.log(hours, min)
	if(hours == '3' && min=='0'){
		getRecordDate(true)	
	}
}, 50000)

// date list
function getRecordDate(load){
	axios.get('/getRecord')
		.then(function (response) {
			dates = response.data
			for(var i = 0; i < dates.length; i++){
				console.log(dates[i])
			}
			if(load && dates.length){
				pagVue.selectDate(0)
			}
		})
		.catch(function (error) {
			alert(error);
		});
}

var resultVue = new Vue({
	delimiters: ['[[', ']]'],
	el:'#result',
	data: {
		results: [""],
		tmpResults: [""]
	},
	methods:{
		getDayResult:function(){
			axios.get('/getDay',{
				params:{
					date: curDate
				}
			})
			.then(response => (this.tmpResults = response.data))
			.catch(function (error) { 
				console.log(error);
			});
		},
		getAllResult:function(){
			axios.get('/getAll')
			.then(response => (this.tmpResults = response.data))
			.catch(function (error) { 
				console.log(error);
			});
		}
	},
	watch:{
		tmpResults: function (value) {
			$('#tabletable').bootstrapTable('removeAll')
			this.results = []
			if(!value){
				console.log("tmpResults null")
				return
			}
			console.log("tmplength:", value.length)
			
			var rows = []

			for(i = 0; i < value.length; ++i){
				var arr = pattern.exec(value[i])
				console.log(arr)
				if (arr) {
					rows.push({
						id: i+1,
						level: arr[2],
						file: arr[1],
						info: arr[3]
					})
				}
			}

			console.log(rows)
			$('#tabletable').bootstrapTable('load', rows)
		}
	}
});

var optionVue = new Vue({
	delimiters: ['[[', ']]'],
	el:'#option',
	data: {
		selected: '昨日新增'
	},
	methods:{
		makeSelect:function(value){
			if(value == 1){
				this.selected = "昨日新增";
				$("#zuori").addClass("active");
				$("#quanbu").removeClass("active");
				pagVue.selectDate(0)
				$("#pag").show();
			}
			else if(value == 2){
				this.selected = "全部";
				$("#quanbu").addClass("active");
				$("#zuori").removeClass("active");
				resultVue.getAllResult()
				$("#pag").hide();
			}
		}
	}
});

var pagVue = new Vue({
	delimiters: ['[[', ']]'],
	el:'#pag',
	data:{
		date : curDate,
		disable : 0
	},
	methods:{
		selectDate:function(value){
			this.disable = 0
			if(dates.length == 0)
				return
			if(value == 0){
				dateIndex = dates.length - 1
			}
			else if(value > 0){
				if(dateIndex < dates.length - 1)
					dateIndex += 1
			}
			else if(value < 0){
				if(dateIndex > 0)
					dateIndex -= 1
			}
			if(dateIndex < dates.length){
				curDate = dates[dateIndex]
				this.date = curDate
				resultVue.getDayResult()
			}
			if(dateIndex == 0)
				this.disable += 1
			if(dateIndex == dates.length - 1)
				this.disable += 2
		}
	}
});


$(document).ready(function () {
	$('#table').bootstrapTable();
});

function cellStyle(value, row, index) {
	var classes = [
		'bg-blue',
		'bg-green',
		'bg-orange',
		'bg-yellow',
		'bg-red'
	]

	if (value == 'Warning') {
		return {
			classes: "table-warning"
		}
	}
	if (value == 'Critical') {
		return {
			classes: "table-danger"
		}
	}
	if (value == 'Serious') {
		return {
			classes: "table-info"
		}
	}
	if (value == 'Information') {
		return {
			classes: "table-success"
		}
	}
	return {
	}
}

function normalcellStyle(value, row, index) {
	return {
		css: {
			style:"word-wrap:break-word; word-break:break-all"
		}
	}
}
