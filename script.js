function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

let canvas_h = 824
let canvas_w = 568

class Player {
    constructor() {
        this.size = 40

        this.py = 250
        this.px = 250 + this.size / 2

        this.fall_speed = 3

        this.jump_speed = 170

    }

    renderHandler() {
        this.entityAutoFall()
    }

    entityAutoFall() {
        if (this.py + this.size + this.fall_speed > canvas_h) {
            this.py = canvas_h - this.size
            return
        }
        this.py += this.fall_speed
    }

    keyboardHandler(event) {
        if (event.code == 'Space') {
            this.entityJump()
        } 
    }
   
    entityJump() {
        let cont = this.jump_speed

        let interval = setInterval(() => {
            if (cont < 0) {
                clearInterval(interval)
                return
            }
            this.py -= 10
            cont -= 10

        }, 10);

        if (this.py < 0) {
            console.log('[PASSED TOP]')
            return
        }
    }

}

class Obstacles {
    constructor() {
        this.size_w = 50

        this.obstacles_list = []

        this.open_size = 200

        this.dist_size = 300

        this.speed = 1
    }

    renderHandler() {
        this.moveObstacle()
    }

    generateObstacle() {
        let top = randint(50, canvas_h / 2)
        let bottom = canvas_h - (top + this.open_size)

        if (this.obstacles_list.length == 0) {
            this.obstacles_list.push({top, bottom, px: canvas_w, pointed: false})
        } else {
            this.obstacles_list.push({top, bottom, px: this.obstacles_list.at(-1).px + this.dist_size, pointed: false})
        }
    }

    moveObstacle() {
        if (!this.obstacles_list[0]) {
            this.generateObstacle()
            this.generateObstacle()
            this.generateObstacle()
        }

        for (let index in this.obstacles_list) {
            let obs = this.obstacles_list[index]

            if (obs.px <= -this.size_w) {
                this.obstacles_list.splice(index, 1)
                this.generateObstacle()
            } else {
                obs.px -= this.speed
            }

        } 
    }
}

class Game {
    constructor(root, obstacles_instance, player_instance) {
        this.frames = 100
        this.points = 0

        this.Obstacles = obstacles_instance
        this.Player = player_instance

        this.ctx = root.getContext('2d')

        this.run = true

        this.displayText = 'PONTOS: 0'
    }

    init() {
        this.render()
        
        setInterval(() => {
            if (this.run) {
                this.Player.renderHandler()
                this.Obstacles.renderHandler()

                
                this.checkPointed() 
                this.checkColision()
                this.render()

                this.attText()
            }
        }, 1000 / this.frames)
    }

    attText() {
        document.querySelector('.screenText').textContent = this.displayText
    }

    checkPointed() {
        for (let obs of this.Obstacles.obstacles_list) {
            if (!this.run) {return}

            if (obs.px <= this.Player.px && !obs.pointed) {
                this.points++
                obs.pointed = true
            
                this.displayText = `PONTOS: ${this.points}`
            }
        }
    }

    checkColision() {
        for (let obs of this.Obstacles.obstacles_list) {
            if (!(this.Player.px + this.Player.size >= obs.px && this.Player.px <= obs.px + this.Obstacles.size_w)) {
                return
            }

            // CHECK-TOP
            if (this.Player.py < obs.top) {
                this.run = false
            }

            // CHECK-BOTTOM
            if (this.Player.py + this.Player.size > canvas_h - obs.bottom) {
                this.run = false
            }

            if (!this.run) {
                this.displayText = `PERDEU! PONTUAÇÃO: ${this.points}`
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, canvas_w, canvas_h)

        // OBSTACLES RENDER
        for (let obs of this.Obstacles.obstacles_list) {
            this.ctx.fillStyle = '#002F59'
            this.ctx.fillRect(obs.px, 0, this.Obstacles.size_w, obs.top)
            this.ctx.fillRect(obs.px, canvas_h - obs.bottom, this.Obstacles.size_w, obs.bottom)
        }

        this.ctx.fillStyle = '#F7B15B'
        this.ctx.fillRect(this.Player.px, this.Player.py, this.Player.size, this.Player.size)
    }
}


let GameInstance = new Game(document.querySelector('#screen'), new Obstacles(), new Player())
GameInstance.init()


document.addEventListener('keydown', (event) => {
    GameInstance.Player.keyboardHandler(event)
    // GameInstance.Player.moveEntity(key)
})



