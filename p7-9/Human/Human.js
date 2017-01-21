var grobjects = grobjects || [];

var Human = undefined;

(function(){
	"use strict";
	var shaderProgram = undefined;
	var cubeBuff = undefined;
	var index = 0;
  var t = 0;
	//var parts = ['head', 'body','arm','leg'];

	Human = function Human(curve){
		this.name = "human"+index;
		this.position = [0,1,0];
		this.orientation = [0,0,0];
		this.legAng = 0.5;
		this.leftArmAng = 0.5;
		this.rightArmAng = -0.5;
		this.sign = 1;
    this.curve = curve;
    this.back = false;
    this.cSign = 1;
		index ++;
	}

	Human.prototype.init = function(drawingState){
		var gl = drawingState.gl;

		if(!shaderProgram)
			shaderProgram = twgl.createProgramInfo(gl, ["cube-vs","cube-fs"]);

		if(!cubeBuff){
			var arrays = twgl.primitives.createCubeVertices(1);
			var cube = {vpos:arrays.position, vnormal:arrays.normal, indices:arrays.indices};
			cubeBuff = twgl.createBufferInfoFromArrays(gl, cube);
			//console.log(cubeBuff);
		}
		
		var self = this;
		//this.position = [0,1,0];
		this.leftArmAng = 0.5;
		this.rightArmAng = -0.5;	
		this.legAng = 0.5;
		this.bColor = [Math.random(),Math.random(), Math.random()];
		this.pColor = [Math.random(),Math.random(), Math.random()];
		this.sColor = [1,229/255,204/255];
		//console.log(this.position);
	};
	
	Human.prototype.draw = function(drawingState){
		//onsole.log(this.legAng);
		
		if(!drawingState.toFrameBuffer)
			walk(this, drawingState);
		
		
		var normTrans = twgl.m4.identity();
		var centerMat = twgl.m4.identity();
		//twgl.m4.multiply(centerMat, twgl.m4.translation([4,5,0]), centerMat);
		twgl.m4.rotateX(centerMat, this.orientation[0], centerMat);
		twgl.m4.rotateY(centerMat, this.orientation[1], centerMat);
		twgl.m4.rotateZ(centerMat, this.orientation[2], centerMat);
		twgl.m4.setTranslation(centerMat, this.position, centerMat);
		twgl.m4.multiply(centerMat, twgl.m4.scaling([0.4,0.4,0.4]),centerMat);
		
		var gl = drawingState.gl;
		gl.useProgram(shaderProgram.program);
/*		
		twgl.setUniforms(shaderProgram, {view: drawingState.view, proj:drawingState.proj});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, sunView:drawingState.sunView, sunPorj:drawingState.sunProj});
*/

    if (drawingState.drawShadow){
			twgl.setUniforms(shaderProgram, { view: drawingState.sunView, proj: drawingState.sunProj, depthTexture: drawingState.emptyTexture, drawShadow: 1});
		}else{ 
			twgl.setUniforms(shaderProgram, { view:drawingState.view, proj:drawingState.proj, depthTexture: drawingState.depthTexture, drawShadow: 0});
    }
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, sunView: drawingState.sunView, sunProj: drawingState.sunProj});



		
		var bodyMat = twgl.m4.identity();
		twgl.m4.scale(bodyMat, [0.5, 0.5, 0.5], bodyMat);
		twgl.m4.scale(bodyMat, [1.5,1.5,0.75], bodyMat);
		twgl.m4.multiply(bodyMat, centerMat, bodyMat);
		twgl.m4.transpose(twgl.m4.inverse(bodyMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram,{model:bodyMat, normTrans:normTrans, cubeColor:this.bColor});
		twgl.setBuffersAndAttributes(gl,shaderProgram, cubeBuff);
		twgl.drawBufferInfo(gl,gl.TRIANGLES, cubeBuff);
		
		var headMat = twgl.m4.identity();
		twgl.m4.scale(headMat, [0.5,0.5,0.5], headMat);
		twgl.m4.multiply(headMat, twgl.m4.translation([0,1.3/2,0]), headMat);		
		twgl.m4.multiply(headMat, centerMat, headMat);
		twgl.m4.transpose(twgl.m4.inverse(headMat, normTrans), normTrans);
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
		twgl.setUniforms(shaderProgram, {model:leftArmMat, normTrans:normTrans,cubeColor:this.sColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var rightArmMat = twgl.m4.identity();
		twgl.m4.scale(rightArmMat, [0.5,0.5,0.5], rightArmMat);
		twgl.m4.scale(rightArmMat, [0.5,1.2,0.7], rightArmMat);
		twgl.m4.multiply(rightArmMat, twgl.m4.translation([-.75/2-.5/4,-0.3,0]), rightArmMat);
		twgl.m4.multiply(rightArmMat, twgl.m4.rotationX(this.rightArmAng), rightArmMat);
		twgl.m4.multiply(rightArmMat, twgl.m4.translation([0, 0.75/2,0]),rightArmMat);
		twgl.m4.multiply(rightArmMat, centerMat, rightArmMat);
		twgl.m4.transpose(twgl.m4.inverse(rightArmMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {model:rightArmMat, normTrans:normTrans, cubeColor:this.sColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var leftLegMat = twgl.m4.identity();
		twgl.m4.scale(leftLegMat, [0.5,0.5,0.5], leftLegMat);
		twgl.m4.scale(leftLegMat, [0.7,1,0.7], leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.translation([-0.75/4, -0.3, 0]), leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.rotationX(this.legAng), leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.translation([0, -0.35, 0]),leftLegMat);
		twgl.m4.multiply(leftLegMat, centerMat, leftLegMat);
		twgl.m4.transpose(twgl.m4.inverse(leftLegMat, normTrans),normTrans);
		twgl.setUniforms(shaderProgram, {model:leftLegMat, normTrans:normTrans,cubeColor:this.pColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		
		var rightLegMat = twgl.m4.identity();
		twgl.m4.scale(rightLegMat, [0.5,0.5,0.5], rightLegMat);
		twgl.m4.scale(rightLegMat, [0.7,1,0.7], rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.translation([0.75/4, -0.3, 0]), rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.rotationX(-this.legAng), rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.translation([0, -0.35, 0]),rightLegMat);
		twgl.m4.multiply(rightLegMat, centerMat, rightLegMat);
		twgl.m4.transpose(twgl.m4.inverse(rightLegMat, normTrans),normTrans);
		twgl.setUniforms(shaderProgram, {model:rightLegMat, normTrans:normTrans, cubeColor:this.pColor});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
	
	};	
		
	Human.prototype.center = function(drawingState){
		return this.position;
	}

	function walk(human, drawingState){
		if(human.curve){
        curveTangent(human);
    }else{
		  var random = Math.random();
		  if(random > 0.99){
			  human.orientation[1] += Math.random()*Math.PI/3;
		  }else if(random > 0.98 && random <0.99){
		  	human.orientation[1] -= Math.random()*Math.PI/3
		  }
		  if(Math.abs(human.position[0])>=15)
		  	human.position[0] = -human.position[0];
		  if(Math.abs(human.position[2]) >= 15)
			  human.position[2] = -human.position[2];
		
		  human.position[0] += Math.sin(human.orientation[1])/30;
		  human.position[2] += Math.cos(human.orientation[1])/30;
		  if(human.legAng >= 0.5)
		  	human.sign = -1;
		  if(human.legAng <= -0.5)
			  human.sign = 1;
		  human.legAng += human.sign/30;
		  human.leftArmAng += human.sign/30;
		  human.rightArmAng -= human.sign/30;
    }
		
	}

  function curveTangent(human){
    var p0;
    var p1;
    var p2;
    var p3;

    var b0v=(1-t)*(1-t)*(1-t);
    var b1v=3*t*(1-t)*(1-t);
    var b2v=3*t*t*(1-t);
    var b3v=t*t*t;


    var b0t=-3*(1-t)*(1-t);
    var b1t=3*(1-3*t)*(1-t);
    var b2t=3*t*(2-3*t);
    var b3t=3*t*t;
    
      if(t>=1){      
        human.cSign = -1;
      }else if(t<=0){
        human.cSign = 1;
        console.log(human.position);
      }
      t = t+ human.cSign*0.005;
      p0=[0,1,6];
      p1=[6,1,-6];
      p2=[-3,1,0];
      p3=[-4,1,0];

      human.position = [p0[0]*b0v+p1[0]*b1v+p2[0]*b2v+p3[0]*b3v,
                  p0[1]*b0v+p1[1]*b1v+p2[1]*b2v+p3[1]*b3v,
                  p0[2]*b0v+p1[2]*b1v+p2[2]*b2v+p3[2]*b3v];


      human.orientation = [p0[0]*b0t+p1[0]*b1t+p2[0]*b2t+p3[0]*b3t,
                  p0[1]*b0t+p1[1]*b1t+p2[1]*b2t+p3[1]*b3t,
                  p0[2]*b0t+p1[2]*b1t+p2[2]*b2t+p3[2]*b3t];
    
    //console.log(human.position);
  }
	

})();

grobjects.push(new Human(false));
grobjects.push(new Human(false));
grobjects.push(new Human(false));
grobjects.push(new Human(false));
grobjects.push(new Human(false));
grobjects.push(new Human(false));
