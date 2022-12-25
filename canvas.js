function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

var UPDATE_INFO = function(brick, canvas) {

	$("#brickPosition")
	.text(canvas.selectedBrickPosition + 1)

	$("#countryName")
	.text(brick.name)

	$("#countryDeaths")
	.text(brick.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

	$("#flag")
	.attr("src", brick.flagLink)


}

var ERASE_INFO = function() {

	$("#brickPosition")
	.text("?")

	$("#countryName")
	.text("??????????")

	$("#countryDeaths")
	.text("???")

	$("#flag")
	.attr("src", "images/blanck.png")


}


class Brick {

	constructor(country, p) {

		this.population = country.deaths
		this.flagLink = country.image
		this.flag = p.loadImage(country.image)
		this.name = country.name

		this.state = 0
		this.visible = false

		this.vel = 0
		this.y = 0
		this.height = (this.population/1000)/10 * 40

	}

	draw(p, canvas) {

		if (this.visible) {

			p.noStroke()
			p.fill(255)
			p.rect(window.innerWidth/2 - 300, this.y, 600, this.height)

			for(var j = 0; j < Math.ceil(this.height/40); j++) {

				for(var i = 0; i < 10; i++) {

					p.image(this.flag, i*60 - 2 + window.innerWidth/2 - 300, this.y + this.height - j*40 + 12, 64, -64)

				}

			}

			p.fill(230, 231, 244)
			p.rect(window.innerWidth/2 - 320, this.y, 640, -50)

			if (this == canvas.selectedBrick) {

				p.strokeWeight(2)
				p.stroke(0)
				p.noFill()

			
			} else {

				p.strokeWeight(2)
				p.stroke(0)
				p.fill(50, 50, 50, 160)

			}
			
			
			p.rect(window.innerWidth/2 - 300, this.y, 600, this.height)

		}

		if (this.state == 1) {



			this.y += this.vel
			this.vel += 15

			if (canvas.brickBase < this.y + this.height + this.vel) {

				this.updateState(canvas)

			}

		}

	}

	updateState(canvas) {

		if (this.state == 0) {

			canvas.camera.moveCamera(true, this, canvas)
			canvas.rumbling = true
			canvas.rumble.play()
			canvas.shadow = true

			sleep(4000)
			.then(() => {

				this.vel = 1
				this.y = -200 - this.height - canvas.camera.y

				this.state = 1
				this.visible = true

				console.log("FALLING")

			})


		} else if (this.state == 1) {

			canvas.rumble.pause()
			canvas.rumble.currentTime = 0
			
			canvas.rumbling = false
			canvas.thud.play()

			$("#newCountryButton")
			.attr("disabled", false)

			$("#nextCountry")
			.attr("disabled", false)

			$("#previousCountry")
			.attr("disabled", false)

			UPDATE_INFO(canvas.selectedBrick, canvas)

			sleep(800)
			.then(() => {

				$(".mainDiv")
				.fadeIn(200)

			})

			

			canvas.smoke.generateSmoke(canvas.brickBase)

			this.y = canvas.brickBase - this.height
			canvas.brickBase = this.y

			this.state = 2



		}

	}


}

class CameraController {

	constructor() {

		this.moving = false
		this.upward = false
		

		this.focus  = null

		this.y = 0

		this.noiseX = 0
		this.noiseY = 0

		this.vel = 0

		this.targetY = null
		this.startingY = null

	}

	moveCamera(newBrick, brick, canvas) {

		this.moving = true
		this.startingY = this.y

		this.vel = this.vel * 0.5
		
		if (newBrick) this.targetY = canvas.originalBase - canvas.brickBase
		else this.targetY = canvas.originalBase - (brick.y + brick.height)

		console.log(brick.y + brick.height + " " + canvas.originalBase)
		console.log(this.startingY + " " + this.targetY)
		console.log(brick)


		if (this.targetY <= this.startingY) this.upward = false
		else this.upward = true


	}

	updateCamera() {

		if (this.moving) {

			this.y += this.vel

			if(this.upward) {

				if(this.y + this.vel >= this.targetY) {
					this.y = this.targetY
					this.vel = false
					this.moving = false
				}

			} else {

				if(this.y +  this.vel <= this.targetY) {
					this.y = this.targetY
					this.moving = false
					this.vel = false
				}

			}

			console.log(this.upward)

			if ((Math.abs(this.y - this.startingY) <= Math.abs(this.y - this.targetY))) {

				if(this.upward) this.vel += 0.8
				else this.vel -= 0.8

			} else if (Math.abs(this.vel) > 1) {

				if(this.upward) this.vel -= 0.8
				else this.vel += 0.8

			}

		}

		if (canvas.rumbling) {

			this.noiseX = Math.random() * 20 - 10
			this.noiseY = Math.random() * 20 - 10

		}

	}

}

class SmokeParticle {

	constructor(x, y, velX, velY) {

		this.x = x
		this.y = y
		this.velX = velX
		this.velY = velY

		this.diameter = 30

		this.alpha = 255

	}

	draw(p) {

		this.x += this.velX
		this.y += this.velY
		this.velY -= 5

		p.noStroke()
		p.fill(150, 150, 150, this.alpha)
		p.ellipse(this.x, this.y, this.diameter, this.diameter)

		this.alpha -= 20

	}

}

class SmokeController {

	constructor() {

		this.particleArray = []

	}

	generateSmoke(y) {

		this.particleArray = []

		for(var i = 0; i < 500; i++){

			var particleX = (window.innerWidth/2 - 300) + Math.random() * 600
			var particleVelX = (Math.random() + 1) * (-(window.innerWidth/2 - particleX)/20)

			this.particleArray.push(new SmokeParticle(particleX, y + (Math.random() * 140 - 70),  particleVelX, -5))

		}
	}

	draw(p) {

		for(var i = 0; i < this.particleArray.length; i++) {

			if(this.particleArray[i] != null) {

				if (this.particleArray[i].alpha < 0) this.particleArray[i] = null
				else this.particleArray[i].draw(p)

			}

		}

	}
}

var canvas = function(p) {

	ERASE_INFO()

	canvas.brickArray = []

	fetchData()
	.then(() => { 
			
		for(var i = 0; i < COUNTRY_DATA_LIST.length; i++) {
			canvas.brickArray.push(new Brick(COUNTRY_DATA_LIST[i], p))
		}

		REMOVE_LOADING_SCREEN()
	})

	canvas.brickBase = 7/10 * window.innerHeight
	canvas.originalBase = canvas.brickBase

	canvas.selectedBrick = null
	canvas.selectedBrickPosition = null

	canvas.bricksDropped = 0


	canvas.camera = new CameraController()
	canvas.rumbling = false

	canvas.smoke = new SmokeController()

	canvas.shadow = false
	canvas.shadowAlpha = 0


	canvas.dropBrick = function(canvas) {

		DROP_TRIGGER = false

		var newBrick = canvas.brickArray[canvas.bricksDropped]

		if (newBrick != null) {

			$("#newCountryButton")
			.attr("disabled", true)

			$("#nextCountry")
			.attr("disabled", true)

			$("#previousCountry")
			.attr("disabled", true)

			$(".mainDiv")
			.fadeOut(200)


			canvas.selectedBrick = newBrick
			canvas.bricksDropped += 1

			canvas.selectedBrickPosition = canvas.bricksDropped - 1

			//Switch Info Here

			console.log(newBrick)
			newBrick.updateState(canvas)

		}

	}

	canvas.previousBrick = function(canvas) {

		PREVIOUS_BRICK = false

		if(canvas.selectedBrickPosition > 0) {

			canvas.selectedBrickPosition -= 1
			canvas.selectedBrick = canvas.brickArray[canvas.selectedBrickPosition]
			canvas.camera.moveCamera(false, canvas.selectedBrick, canvas)
			UPDATE_INFO(canvas.selectedBrick, canvas)



		}

	}

	canvas.nextBrick = function(canvas) {

		NEXT_BRICK = false

		if(canvas.selectedBrickPosition < canvas.bricksDropped - 1) {

			console.log("THE SELECTED BRICK IS: ")
			console.log(canvas.selectedBrick)

			canvas.selectedBrickPosition += 1
			canvas.selectedBrick = canvas.brickArray[canvas.selectedBrickPosition]
			canvas.camera.moveCamera(false, canvas.selectedBrick, canvas)
			UPDATE_INFO(canvas.selectedBrick, canvas)

		}


	}

	p.preload = function() {

		canvas.thud = new Audio("sounds/thud.wav")
		canvas.rumble = new Audio("sounds/rumble.wav")

	}

	p.setup = function() {

		p.createCanvas(window.innerWidth, window.innerHeight)
		p.frameRate(36)


	}

	p.draw = function() {

		if (DROP_TRIGGER) canvas.dropBrick(canvas)
		if (PREVIOUS_BRICK) canvas.previousBrick(canvas)
		if (NEXT_BRICK) canvas.nextBrick(canvas)


		canvas.camera.updateCamera()

		p.push()

			p.translate(canvas.camera.noiseX, canvas.camera.y + canvas.camera.noiseY)


			p.background(230, 231, 244)

			//p.stroke(100)
			//p.strokeWeight(2)
			p.noStroke()
			p.fill(112,128,144)
			p.rect(-90, canvas.originalBase-99, window.innerWidth + 220, window.innerHeight-(canvas.originalBase-100) + 110)

			if (canvas.shadow) {

				p.fill(50, 50, 50, canvas.shadowAlpha)
				p.noStroke()

				var arcAmount = p.PI * (0.081) * -1

				p.arc(window.innerWidth/2, canvas.originalBase, 1000, 300, arcAmount, p.PI - arcAmount, p.CHORD)


				if(canvas.shadowAlpha < 150) canvas.shadowAlpha += 2

			}


			for (var i = 0; i < canvas.brickArray.length; i++) {

				canvas.brickArray[i].draw(p, canvas)

			}

			canvas.smoke.draw(p)

		p.pop()
		
	}

	$(window).resize(function() {

		p.resizeCanvas(window.innerWidth, window.innerHeight)

	})

}
