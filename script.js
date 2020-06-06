var CANVAS = new p5(canvas, "canvasDiv")

var DROP_TRIGGER = false
var NEXT_BRICK = false
var PREVIOUS_BRICK = false


var REMOVE_LOADING_SCREEN = function() {

	$("#loadingDiv")
	.fadeOut(2000)

}

$("#newCountryButton")
.click(() => {DROP_TRIGGER = true})

$("#previousCountry")
.click(() => {PREVIOUS_BRICK = true})

$("#nextCountry")
.click(() => {NEXT_BRICK = true})



