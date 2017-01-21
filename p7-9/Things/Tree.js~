var grobjects = grobjects || [];

var Tree = undefined;
var leaves = undefined;
var stem = undefined;
var index = 0;

(function(){
	"use strict";
	var shaderProgram = undefined;
	var stemBuff = undefined;
  var coneBuff = undefined;

	Tree = function Tree(){
		this.name = "tree" + index;
    this.position = [5,0,2];
    index++;
	}

	Tree.prototype.init = function(drawingState){
		var gl = drawingState.gl;
		if(!shaderProgram)
			shaderProgram = twgl.createProgramInfo(gl, ["tree-vs","tree-fs"]);
		//.log(shaderProgram);
		
		if(!stemBuff){
			var arrays = twgl.primitives.createCylinderVertices(0.5,2,5,5);
			var stem = {vpos:arrays.position, vnormal:arrays.normal, indices:arrays.indices, texPos:arrays.texcoord};
			stemBuff = twgl.createBufferInfoFromArrays(gl, stem);
		}
		
    if(!coneBuff){
			var arrays = twgl.primitives.createTruncatedConeVertices(2,0.1,3,10,10);
			var cone = {vpos:arrays.position, vnormal:arrays.normal, indices:arrays.indices, texPos:arrays.texcoord};
			coneBuff = twgl.createBufferInfoFromArrays(gl, cone);
			//console.log(ball);
		}

    //var imgSrc =  "Things/bronze.jpg";
		//var opt = {src: imgSrc};
    /*
		ballTex = twgl.createTexture(gl);
		twgl.loadTextureFromUrl(gl, ballTex, opt, function(err, ballTex, imgSrc) {
      console.log("in call back");
			twgl.setTextureFromElement(gl, ballTex, imgSrc);
		});
    */
		//ballTex = twgl.createTexture(gl, opt);
    //console.log(this.ballTex);
		
	};
	
	Tree.prototype.draw = function(drawingState){
		
		
		if(!drawingState.toFrameBuffer)
			fall(this, drawingState);
		
		
		var normTrans = twgl.m4.identity();
		var centerMat = twgl.m4.identity();
		twgl.m4.setTranslation(centerMat, this.position, centerMat);
		
		var gl = drawingState.gl;
		gl.useProgram(shaderProgram.program);
    twgl.setBuffersAndAttributes(gl,shaderProgram, ballBuff);
		
		twgl.setUniforms(shaderProgram, {view: drawingState.view, proj:drawingState.proj});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, sunView:drawingState.sunView, sunPorj:drawingState.sunProj});
		
		var bodyMat = twgl.m4.identity();
		twgl.m4.multiply(bodyMat, centerMat, bodyMat);
		twgl.m4.transpose(twgl.m4.inverse(bodyMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram,{model:bodyMat, normTrans:normTrans, uTexture: ballTex});
		twgl.drawBufferInfo(gl,gl.TRIANGLES, ballBuff);
	
	};	
		
	Tree.prototype.center = function(drawingState){
		return this.position;
	}

})();

grobjects.push(new Tree());
