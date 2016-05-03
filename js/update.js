var Update = {
  'interactive_space_ratio': 0.75,
};

Update.updateCanvasSpace = function() {
	document.getElementById("topdiv").style.height = window.innerHeight*(1.0 - this.interactive_space_ratio)/2.0+ "px";
	document.getElementById("bottomdiv").style.height = window.innerHeight*(1.0 - this.interactive_space_ratio)/2.0+ "px";

	document.getElementById("leftdiv").style.width = window.innerWidth*(this.interactive_space_ratio) - 50 + "px";
	document.getElementById("rightdiv").style.width = window.innerWidth*(1.0 - this.interactive_space_ratio) - 50 + "px";
	document.getElementById("rightdiv").style.height = window.innerHeight*(this.interactive_space_ratio) + "px";

	document.getElementById("rightdiv").style.float = "left";
	document.getElementById("leftdiv").style.float = "left";
	document.getElementById("leftdiv").style.marginLeft = "50px";
	document.getElementById("rightdiv").style.marginRight = "50px";

	document.getElementById("rightdiv").style.backgroundColor = "black";

 	Raytracer.init (window.innerHeight*(this.interactive_space_ratio), window.innerWidth*(this.interactive_space_ratio) - 50 , false);
 	Scene.setUniforms();

 	var drawScene = function() {
        Raytracer.render(false);
        requestAnimationFrame(drawScene);
    };
 	drawScene();
}
