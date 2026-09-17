"use strict";
class Camera {
	constructor(position, rotation, fov, aspect, near, far) {
		this.fov = fov;
		this.aspect = aspect;
		this.near = near;
		this.far = far;
		
		this.position = position;
		this.rotation = rotation;
	}
	
	getPerspectiveMatrix() {
		return Mat4.perspective(Mat4.create(), this.fov, this.aspect, this.near, this.far);
	}
	
	getViewMatrix() {
		return Mat4.fpsCamera(Mat4.create(), this.position, this.rotation);
	}
	
	turn(x, y, z) {
		this.rotation[0] += x;
		this.rotation[1] += y;
		this.rotation[2] += z;
	}
	
	move(x, y, z) {
		const forward = [Math.cos(this.rotation[1]), Math.sin(this.rotation[1])];
		const sideways = [-Math.sin(this.rotation[1]), Math.cos(this.rotation[1])];
		
		this.position[0] += x*forward[0] + z*sideways[0];
		this.position[1] += y;
		this.position[2] -= x*forward[1] + z*sideways[1];
	}
	
	checkKeys() {
		if(keysPressed.indexOf("i") != -1) {
			this.turn(-0.03, 0, 0);
		}
		if(keysPressed.indexOf("j") != -1) {
			this.turn(0, 0.03, 0);
		}
		if(keysPressed.indexOf("k") != -1) {
			this.turn(	0.03, 0, 0);
		}
		if(keysPressed.indexOf("l") != -1) {
			this.turn(0, -0.03, 0);
		}
		
		if(keysPressed.indexOf("w") != -1) {
			this.move(0, 0, 0.1);
		}
		if(keysPressed.indexOf("a") != -1) {
			this.move(-0.1, 0, 0);
		}
		if(keysPressed.indexOf("s") != -1) {
			this.move(0, 0, -0.1);
		}
		if(keysPressed.indexOf("d") != -1) {
			this.move(0.1, 0, 0);
		}
		if(keysPressed.indexOf("q") != -1) {
			this.move(0, -0.1, 0);
		}
		if(keysPressed.indexOf("e") != -1) {
			this.move(0, 0.1, 0);
		}
	}
}

let keysPressed = [];
document.onkeypress = function(e) {
	if(keysPressed.indexOf(e.key) != -1) {
		return;
	}
	keysPressed.push(e.key);
}
document.onkeyup = function(e) {
	keysPressed.splice(keysPressed.indexOf(e.key), 1);
}