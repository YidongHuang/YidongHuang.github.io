var grobjects = grobjects || [];

var Superman = undefined;
var Steelball = undefined;
var contact = false;
var ready = false;
var hover = false;
var correctX = 0;
var correctZ = 0;
var orientationX = 0;
var orientationZ = 0;
var lock = true;
var ballTex;

(function(){
	"use strict";
	var ballBuff = undefined;
	var shaderProgram = undefined;
	var ballShaderProgram = undefined;
	var cubeBuff = undefined;
	var index = 0;
	var ballIndex = 0;
	//var parts = ['head', 'body','arm','leg'];

	Superman = function Superman(name, texture){
		this.name = name ||"Superman"+index;
		this.position = [0,0,0];
		this.orientation = [0,0,0];
		this.texture = texture;
		index ++;
	}

	Superman.prototype.init = function(drawingState){
		var gl = drawingState.gl;

		if(!shaderProgram)
			shaderProgram = twgl.createProgramInfo(gl, ["superman-vs","superman-fs"]);

		if(!cubeBuff){
			var arrays = twgl.primitives.createCubeVertices(1);
			var cube = {vpos:arrays.position, vnormal:arrays.normal, indices:arrays.indices};
			cubeBuff = twgl.createBufferInfoFromArrays(gl, cube);
			//console.log(cubeBuff);
		}
		
		
		var px = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
		var opt = {target: gl.TEXTURE_CUBE_MAP,
					cubeFaceOrder:[px+1, px+4,px,px+5,px+2,px+3],
					src:'Human/supermanHead.jpg'};
		this.headTex = twgl.createTexture(gl, opt);
		
		
		px = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
		opt = {target: gl.TEXTURE_CUBE_MAP,
					cubeFaceOrder:[px+1, px+4,px,px+5,px+2,px+3],
					src:'Human/supermanBody.jpg'};
		this.bodyTex = twgl.createTexture(gl, opt);
		
		this.position = [0,3,0];
		this.leftArmAng = 0;
		this.rightArmAng = 0;	
		this.legAng = 0;
		this.bColor = [7/255,84/255, 164/255];
		this.height = 6;
		this.cColor = [1.0,0.0,0.0];
		this.sColor = [1,229/255,204/255];
	};
	
	Superman.prototype.draw = function(drawingState){
		
		if(!drawingState.toFrameBuffer)
			fly(this, drawingState);
		
		var gl = drawingState.gl;
		gl.useProgram(shaderProgram.program);
		
		
		
		var normTrans = twgl.m4.identity();
		var centerMat = twgl.m4.identity();
		
		twgl.m4.rotateX(centerMat, this.orientation[0], centerMat);
		twgl.m4.rotateY(centerMat, this.orientation[1], centerMat);
		twgl.m4.rotateZ(centerMat, this.orientation[2], centerMat);
		twgl.m4.setTranslation(centerMat, this.position, centerMat);
		twgl.m4.multiply(centerMat, twgl.m4.scaling([0.4,0.4,0.4]),centerMat);		

/*
		twgl.setUniforms(shaderProgram, { view: drawingState.sunView, proj: drawingState.sunProj, 
				depthTexture: drawingState.emptyTexture, drawShadow: 1});
		
		//twgl.setUniforms(shaderProgram, {view: drawingState.view, proj:drawingState.proj});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, sunView:drawingState.sunView, sunPorj:drawingState.sunProj});
*/

    if (drawingState.drawShadow)
			twgl.setUniforms(shaderProgram, { view: drawingState.sunView, proj: drawingState.sunProj, 
				depthTexture: drawingState.emptyTexture, drawShadow: 1});
		else 
			twgl.setUniforms(shaderProgram, { view:drawingState.view, proj:drawingState.proj, 
				depthTexture: drawingState.depthTexture, drawShadow: 0});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, sunView: drawingState.sunView, 
			sunProj: drawingState.sunProj});



		
		var bodyMat = twgl.m4.identity();
		twgl.m4.scale(bodyMat, [0.5, 0.5, 0.5], bodyMat);
		twgl.m4.scale(bodyMat, [1.5,1.5,0.75], bodyMat);
		twgl.m4.multiply(bodyMat, centerMat, bodyMat);
		twgl.m4.transpose(twgl.m4.inverse(bodyMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram,{useTex: 1, uTexture: this.bodyTex, model:bodyMat, normTrans:normTrans, cubeColor:this.bColor});
		twgl.setBuffersAndAttributes(gl,shaderProgram, cubeBuff);
		twgl.drawBufferInfo(gl,gl.TRIANGLES, cubeBuff);
		
		var headMat = twgl.m4.identity();
		twgl.m4.scale(headMat, [0.5,0.5,0.5], headMat);
		twgl.m4.multiply(headMat, twgl.m4.translation([0,1.3/2,0]), headMat);		
		twgl.m4.multiply(headMat, centerMat, headMat);
		twgl.m4.transpose(twgl.m4.inverse(headMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {useTex: 1, uTexture: this.headTex});
		twgl.setUniforms(shaderProgram, {model:headMat, normTrans:normTrans, cubeColor:this.sColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var leftArmMat = twgl.m4.identity();
		twgl.m4.scale(leftArmMat, [0.5, 0.5, 0.5], leftArmMat);
		twgl.m4.scale(leftArmMat, [0.5, 1.2, 0.5], leftArmMat);
		twgl.m4.multiply(leftArmMat, twgl.m4.translation([0.75/2+0.5/4, -0.3, 0]), leftArmMat);
		twgl.m4.multiply(leftArmMat, twgl.m4.rotationX(this.leftArmAng), leftArmMat);
		twgl.m4.multiply(leftArmMat, twgl.m4.translation([0, 0.75/2, 0]), leftArmMat);
		twgl.m4.multiply(leftArmMat, centerMat, leftArmMat);
		twgl.m4.transpose(twgl.m4.inverse(leftArmMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {useTex:0, model:leftArmMat, normTrans:normTrans, cubeColor:this.bColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var rightArmMat = twgl.m4.identity();
		twgl.m4.scale(rightArmMat, [0.5,0.5,0.5], rightArmMat);
		twgl.m4.scale(rightArmMat, [0.5,1.2,0.7], rightArmMat);
		twgl.m4.multiply(rightArmMat, twgl.m4.translation([-.75/2-.5/4,-0.3,0]), rightArmMat);
		twgl.m4.multiply(rightArmMat, twgl.m4.rotationX(this.rightArmAng), rightArmMat);
		twgl.m4.multiply(rightArmMat, twgl.m4.translation([0, 0.75/2,0]),rightArmMat);
		twgl.m4.multiply(rightArmMat, centerMat, rightArmMat);
		twgl.m4.transpose(twgl.m4.inverse(rightArmMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {useTex:0, model:rightArmMat, normTrans:normTrans, cubeColor:this.bColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var leftLegMat = twgl.m4.identity();
		twgl.m4.scale(leftLegMat, [0.5,0.5,0.5], leftLegMat);
		twgl.m4.scale(leftLegMat, [0.7,1,0.7], leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.translation([-0.75/4, -0.3, 0]), leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.rotationX(this.legAng), leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.translation([0, -0.35, 0]),leftLegMat);
		twgl.m4.multiply(leftLegMat, centerMat, leftLegMat);
		twgl.m4.transpose(twgl.m4.inverse(leftLegMat, normTrans),normTrans);
		twgl.setUniforms(shaderProgram, {useTex:0, model:leftLegMat, normTrans:normTrans, cubeColor:this.bColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var rightLegMat = twgl.m4.identity();
		twgl.m4.scale(rightLegMat, [0.5,0.5,0.5], rightLegMat);
		twgl.m4.scale(rightLegMat, [0.7,1,0.7], rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.translation([0.75/4, -0.3, 0]), rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.rotationX(-this.legAng), rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.translation([0, -0.35, 0]),rightLegMat);
		twgl.m4.multiply(rightLegMat, centerMat, rightLegMat);
		twgl.m4.transpose(twgl.m4.inverse(rightLegMat, normTrans),normTrans);
		twgl.setUniforms(shaderProgram, {useTex:0, model:rightLegMat, normTrans:normTrans, cubeColor:this.bColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var capMat = twgl.m4.identity();
		twgl.m4.scale(capMat, [0.5,0.5,0.5], capMat);
		twgl.m4.scale(capMat, [1.7,2.5, 0.2], capMat);
		twgl.m4.multiply(capMat, twgl.m4.translation([0,0,-0.5]), capMat);
		twgl.m4.multiply(capMat, twgl.m4.rotationX(Math.PI/6), capMat);
		twgl.m4.multiply(capMat, twgl.m4.translation([0,-0.3,0]), capMat);	
		twgl.m4.multiply(capMat, centerMat, capMat);
		twgl.m4.transpose(twgl.m4.inverse(capMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {useTex:0, model:capMat, normTrans:normTrans, cubeColor:this.cColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
	
	};	
		
	Superman.prototype.center = function(drawingState){
		return this.position;
	}

	function fly(superman, drawingState){
		//console.log("in superman");
		//console.log(contact);
		if(contact && !ready &&!hover){
			//console.log("in true");
			superman.position[1] += 0.05;
		}else if(!contact && !ready && !hover){
			//console.log("fly down");
			if(superman.position[1] > superman.height){
				superman.position[1] -= 0.1;
				if(superman.leftArmAng < 0)
					superman.leftArmAng += Math.PI/20;
				if(superman.rightArmAng <0)
					superman.rightArmAng += Math.PI/20;
			}else{
				//console.log("hover state is "+hover);
				hover = true;
				//console.log("contact state is "+contact);
				//console.log("ready state is "+ready);
			}
		}else if(ready && !contact && !hover){
			if(!lock){
				correctX = -superman.position[0];
				correctZ = -superman.position[2];	
				var ang = Math.atan2(superman.position[2], superman.position[0]) * 180/Math.PI;
				//superman.orientation[2] = ang;
				orientationX = -superman.orientation[0];
				orientationZ = -superman.orientation[2];
				//console.log(ang);
				//superman.orientation[2] = ang;
				lock = true;
			}
			if(superman.position[0]!=0)
				superman.position[0] += correctX/25;
			if(superman.position[2]!=0)
				superman.position[2] += correctZ/25;
			if(superman.orientation[0]!=0)
				superman.orientation[0] +=orientationX/25;
			if(superman.orientation[2]!=0)
				superman.orientation[2] +=orientationZ/25;
			if(superman.leftArmAng > -Math.PI)
				superman.leftArmAng -= Math.PI/60;
			if(superman.rightArmAng > -Math.PI)
				superman.rightArmAng -= Math.PI/60;
			//hover = false;//correct position for holding the meteor
			if(superman.position[1] > 3){
				superman.position[1] -= 0.05;
				
			}
		}else if(!contact && !ready && hover){
			//console.log("hovering");
			if(superman.position[1] <= superman.height){
				if(superman.orientation[0] < Math.PI/2)
					superman.orientation[0] += Math.PI/60;
				if(superman.orientation[2] < Math.PI/2)
					superman.orientation[2] += Math.PI/60;
				if(superman.orientation[2] >= Math.PI/2 && superman.orientation[0] >= Math.PI/2){
					var random = Math.random();
					if(random > 0.99){
						superman.orientation[2] += Math.random()*Math.PI/3;
					}
					else if(random > 0.98 && random <=0.99){
						superman.orientation[2] -= Math.random()*Math.PI/3
					}
					if(Math.abs(superman.position[0])>= 15)
						superman.position[0] = -superman.position[0];
					if(Math.abs(superman.position[2]) >= 15)
						superman.position[2] = -superman.position[2];
					
					superman.position[0] -= Math.sin(superman.orientation[2])/5;
					superman.position[2] += Math.cos(superman.orientation[2])/5;		
				}
			}
		}
		
		
	}

	Steelball = function Steelball(name, texture){
		this.name = name ||"ball"+ballIndex;
		this.position = [0,10,0];
		this.orientation = [0,0,0];
		this.texture = texture;
		this.sign = -1;
		ballIndex ++;
	}

	Steelball.prototype.init = function(drawingState){
		var gl = drawingState.gl;
		if(!ballShaderProgram)
			ballShaderProgram = twgl.createProgramInfo(gl, ["ball-vs","ball-fs"]);
		//.log(shaderProgram);
		
		if(!ballBuff){
			var arrays = twgl.primitives.createSphereVertices(2.5,20,20);
			var ball = {vpos:arrays.position, vnormal:arrays.normal, indices:arrays.indices, texPos:arrays.texcoord};
			ballBuff = twgl.createBufferInfoFromArrays(gl, ball);
			//console.log(ball);
		}
		
    var imgSrc =  "Things/bronze.jpg";
		var opt = {src: imgSrc};
    /*
		ballTex = twgl.createTexture(gl);
		twgl.loadTextureFromUrl(gl, ballTex, opt, function(err, ballTex, imgSrc) {
      console.log("in call back");
			twgl.setTextureFromElement(gl, ballTex, imgSrc);
		});
    */
		ballTex = twgl.createTexture(gl, opt);
    //console.log(this.ballTex);
		
	};
	
	Steelball.prototype.draw = function(drawingState){
		
		
		if(!drawingState.toFrameBuffer)
			fall(this, drawingState);
		
		
		var normTrans = twgl.m4.identity();
		var centerMat = twgl.m4.identity();
		twgl.m4.setTranslation(centerMat, this.position, centerMat);
		
		var gl = drawingState.gl;
		gl.useProgram(ballShaderProgram.program);
    twgl.setBuffersAndAttributes(gl,ballShaderProgram, ballBuff);
/*		
		twgl.setUniforms(ballShaderProgram, {view: drawingState.view, proj:drawingState.proj});
		twgl.setUniforms(ballShaderProgram, {lightdir:drawingState.sunDirection, sunView:drawingState.sunView, sunPorj:drawingState.sunProj});
*/

    if (drawingState.drawShadow)
			twgl.setUniforms(ballShaderProgram, { view: drawingState.sunView, proj: drawingState.sunProj, 
				depthTexture: drawingState.emptyTexture, drawShadow: 1});
		else 
			twgl.setUniforms(ballShaderProgram, { view:drawingState.view, proj:drawingState.proj, 
				depthTexture: drawingState.depthTexture, drawShadow: 0});
		twgl.setUniforms(ballShaderProgram, {lightdir:drawingState.sunDirection, sunView: drawingState.sunView, 
			sunProj: drawingState.sunProj});


		
		var bodyMat = twgl.m4.identity();
		twgl.m4.multiply(bodyMat, centerMat, bodyMat);
		twgl.m4.transpose(twgl.m4.inverse(bodyMat, normTrans), normTrans);
		twgl.setUniforms(ballShaderProgram,{model:bodyMat, normTrans:normTrans, uTexture: ballTex});
		twgl.drawBufferInfo(gl,gl.TRIANGLES, ballBuff);
	
	};	
		
	Steelball.prototype.center = function(drawingState){
		return this.position;
	}

	function fall(steelball, drawingState){
		steelball.position[1] += steelball.sign * 0.02;
		if(steelball.position[1] <= 4.1){
			steelball.sign = 1;
			contact = true;
			ready = false;
		}else if(steelball.position[1] >= 13){
			steelball.sign = -1;
		}else if(steelball.position[1] >= 8){
			contact = false;
			ready = false;
		}
		if( (steelball.sign== -1) && (steelball.position[1] <= 10)){
			ready = true;
			hover = false;
			lock = false;
		}
		
	}

})();

grobjects.push(new Superman());
grobjects.push(new Steelball());
