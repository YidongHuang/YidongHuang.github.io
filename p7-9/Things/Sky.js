var grobjects = grobjects || [];

var Sky = undefined;
var texture = undefined;
var bg = undefined;

(function(){
	"use strict";
	var shaderProgram = undefined;
	var skyBuff = undefined;

	Sky = function Sky(){
		this.name = "sky";
	}

	Sky.prototype.init = function(drawingState){
		//console.log("here");
		var gl = drawingState.gl;
		if(!shaderProgram)
			shaderProgram = twgl.createProgramInfo(gl, ["sky-vs","sky-fs"]);
		//console.log(shaderProgram);

		if(!skyBuff){
			var arrays = twgl.primitives.createSphereVertices(20,30,30);
			var ball = {vpos:arrays.position, texPos:arrays.texcoord, indices:arrays.indices};
			skyBuff = twgl.createBufferInfoFromArrays(gl, ball);
      //console.log(ball);
		}
		
		texture = "Things/sky.jpg";
		var opt = {color: [0, 0, 0, 1], src: texture};
		bg = twgl.createTexture(gl);
		twgl.loadTextureFromUrl(gl, bg, opt, function(err, tex, img) {
			twgl.setTextureFromElement(gl, tex, img);
		});
	};
	
	Sky.prototype.draw = function(drawingState){
		
		
		var gl = drawingState.gl;
		gl.useProgram(shaderProgram.program);
		twgl.setBuffersAndAttributes(gl,shaderProgram, skyBuff);
		twgl.setUniforms(shaderProgram, {view: drawingState.view, proj:drawingState.proj, uTexture:bg});
		
		twgl.drawBufferInfo(gl,gl.TRIANGLES, skyBuff);
	
	};	
		
	Sky.prototype.center = function(drawingState){
		return [0,0,0];
	}

})();

grobjects.push(new Sky());
