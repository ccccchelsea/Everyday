
      if ( ! Detector.webgl ) {
        Detector.addGetWebGLMessage();
        document.getElementById( 'container' ).innerHTML = "";
      }
      var container, stats;
      var camera, controls, scene, renderer;
      var mesh, texture;
      var worldWidth = 256, worldDepth = 256,
      worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
      var clock = new THREE.Clock();
      var helper;
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      init();
      animate();

      function init() {
        container = document.getElementById( 'container' );
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
        scene = new THREE.Scene();
        controls = new THREE.OrbitControls(camera);
        controls.target.set( 0.0, 100.0, 0.0 );
        controls.userPanSpeed = 100;
        data = generateHeight( worldWidth, worldDepth );
        controls.target.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] + 500;
        camera.position.y =  controls.target.y + 2000;
        camera.position.x = 2000;

        var geometry = new THREE.PlaneBufferGeometry( 4500, 4500, worldWidth - 1, worldDepth - 1 );
        geometry.rotateX( - Math.PI / 2 );
        var vertices = geometry.attributes.position.array;
        for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
          vertices[ j + 1 ] = data[ i ] * 10;
        }
        geometry.computeFaceNormals();
        texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        // mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
        mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { shading: THREE.FlatShading, color: 0xdddddd,  wireframe: true, wireframeLinewidth: 1, transparent: true } ) );
        scene.add( mesh );

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor( 0x000000 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.innerHTML = "";
        container.appendChild( renderer.domElement );
        container.addEventListener( 'mousemove', onMouseMove, false );
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        // container.appendChild( stats.dom );
        window.addEventListener( 'resize', onWindowResize, false );
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
      }

      function generateHeight( width, height ) {
        var size = width * height, data = new Uint8Array( size ),
        perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;
        for ( var j = 0; j < 4; j ++ ) {
          for ( var i = 0; i < size; i ++ ) {
            var x = i % width, y = ~~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
          }
          quality *= 5;
        }
        return data;
      }

      function generateTexture( data, width, height ) {
        var canvas, canvasScaled, context, image, imageData,
        level, diff, vector3, sun, shade;
        vector3 = new THREE.Vector3( 0, 0, 0 );
        sun = new THREE.Vector3( 1, 1, 1 );
        sun.normalize();
        canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext( '2d' );
        context.fillStyle = '#000';
        context.fillRect( 0, 0, width, height );
        image = context.getImageData( 0, 0, canvas.width, canvas.height );
        imageData = image.data;
        for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
          vector3.x = data[ j - 2 ] - data[ j + 2 ];
          vector3.y = 2;
          vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
          vector3.normalize();
          shade = vector3.dot( sun );
          imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        }
        context.putImageData( image, 0, 0 );
        // Scaled 4x
        canvasScaled = document.createElement( 'canvas' );
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;
        context = canvasScaled.getContext( '2d' );
        context.scale( 4, 4 );
        context.drawImage( canvas, 0, 0 );
        image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
        imageData = image.data;
        for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
          var v = ~~ ( Math.random() * 5 );
          imageData[ i ] += v;
          imageData[ i + 1 ] += v;
          imageData[ i + 2 ] += v;
        }
        context.putImageData( image, 0, 0 );
        return canvasScaled;
      }
      
      function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
      }

      function render() {
        controls.update( clock.getDelta() );
        renderer.render( scene, camera );
      }

      function onMouseMove( event ) {
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
        
      }

      function refreshPage(){
    window.location.reload();
} 

