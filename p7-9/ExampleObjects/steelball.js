var grobjects = grobjects || [];

var Steelball = undefined;

(function(){
	"use strict";
	var shaderProgram = undefined;
	var ballBuff = undefined;
	var index = 0;
	//var parts = ['head', 'body','arm','leg'];

	Steelball = function Steelball(name, texture){
		this.name = name ||"ball"+index;
		this.position = [0,1,0];
		this.orientation = [0,0,0];
		this.texture = texture;
		this.sign = 1;
		index ++;
	}

	Steelball.prototype.init = function(drawingState){
		var gl = drawingState.gl;

		if(!shaderProgram)
			shaderProgram = twgl.createProgramInfo(gl, ["ball-vs","ball-fs"]);
	console.log(shaderProgram);
		if(!ballBuff){
			var arrays = twgl.primitives.createSphereVertices(5,10,10);
			var ball = {vpos:arrays.position, vnormal:arrays.normal, indices:arrays.indices};
			ballBuff = twgl.createBufferInfoFromArrays(gl, ball);
			//console.log(cubeBuff);
		}
		
		var self = this;
		this.bColor = [1,1,1];
		//console.log(this.position);
	};
	
	Human.prototype.draw = function(drawingState){
		//onsole.log(this.legAng);
		/*
		if(!drawingState.toFrameBuffer)
			walk(this, drawingState);
		*/
		
		var normTrans = twgl.m4.identity();
		var centerMat = twgl.m4.identity();
		//twgl.m4.multiply(centerMat, twgl.m4.translation([4,5,0]), centerMat);
		/*
		twgl.m4.rotateX(centerMat, this.orientation[0], centerMat);
		twgl.m4.rotateY(centerMat, this.orientation[1], centerMat);
		twgl.m4.rotateZ(centerMat, this.orientation[2], centerMat);
		*/
		twgl.m4.setTranslation(centerMat, this.position, centerMat);
		
		var gl = drawingState.gl;
		gl.useProgram(shaderProgram.program);
		
		twgl.setUniforms(shaderProgram, {view: drawingState.view, proj:drawingState.proj});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, sunView:drawingState.sunView, sunPorj:drawingState.sunProj});
		
		var bodyMat = twgl.m4.identity();
		twgl.m4.multiply(bodyMat, centerMat, bodyMat);
		twgl.m4.transpose(twgl.m4.inverse(bodyMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram,{model:bodyMat, normTrans:normTrans, cubeColor:this.bColor});
		twgl.setBuffersAndAttributes(gl,shaderProgram, ballBuff);
		twgl.drawBufferInfo(gl,gl.TRIANGLES, ballBuff);
	
	};	
		
	Human.prototype.center = function(drawingState){
		return this.position;
	}

	function walk(human, drawingState){
		
		var random = Math.random();
		if(random > 0.99){
			human.orientation[1] += Math.random()*Math.PI/3;
		}
		if(Math.abs(human.position[0])>=12.5)
			human.position[0] = -human.position[0];
		if(Math.abs(human.position[2]) >= 12.5)
			human.position[2] = -human.position[2];
		
		human.position[0] += Math.sin(human.orientation[1])/50;
		human.position[2] += Math.cos(human.orientation[1])/50;
		if(human.legAng >= 0.5)
			human.sign = -1;
		if(human.legAng <= -0.5)
			human.sign = 1;
		human.legAng += human.sign/30;
		human.leftArmAng += human.sign/30;
		human.rightArmAng -= human.sign/30;

		
	}
	

})();

grobjects.push(new Steelball());