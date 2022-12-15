# Web_3D_handler

To run as developer, use the command: </br>
<code>npm run dev</code></br></br>

The command will create a localhost in the computer, <code>http://localhost:8081/</code> </br>
Add the files that you want to open in <code>dist/client/models</code> and use address to render object in the browser:</br> <code>http://localhost:XXXX/?file=data/<file.extension></code></br> </br> 

The repository provides support to handle following extensions:
<ul>
	<li> <a href="https://file.org/extension/fbx">FBX</a> </li>
  	<li> <a href="https://file.org/extension/stl">STL</a> </li>
  	<li> <a href="https://file.org/extension/gbl">GBL</a></li>
  	<li> <a href="https://file.org/extension/gltf">GLTF</a> </li>
  	<li> <a href="https://file.org/extension/obj">OBJ</a> </li>
</ul>

The webpack uses following modules:</br>
<b><a href="https://threejs.org/">Three.js:</a></b> cross-browser JavaScript library and application programming interface used to create and display animated 3D computer graphics in a web browser using WebGL.</br>
<b><a href="https://webpack.js.org/">webpack:</a></b> Contains the core that will bundle our code into development and production versions.</br>
<b><a href="https://www.npmjs.com/package/webpack-cli">webpack-cli:</a></b> the command line tools that we use to run webpack.</br>
<b><a href="https://webpack.js.org/configuration/dev-server/">webpack-dev-server:</a></b> A HTML server that will load our code and provide the HMR functionality during the development phase.</br>
<b><a href="https://www.npmjs.com/package/webpack-merge">webpack-merge:</a></b> A webpack tool library that allows splitting webpack configurations into several files.</br>
<b><a href="https://www.npmjs.com/package/ts-loader">ts-loader:</a></b> A module rule for processing TypeScript files.</br>
