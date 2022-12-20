const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

// Set up the canvas and WebGL context
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");

// Set the pixel ratio to the device pixel ratio
var devicePixelRatio = window.devicePixelRatio || 1;

// set the size of the drawingBuffer based on the size it's displayed.
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

// Set the clear color and enable depth testing
gl.clearColor(0.9, 0.9, 0.9, 1.0);
gl.enable(gl.DEPTH_TEST);

// Set up the viewport
gl.viewport(0, 0, canvas.width, canvas.height);

// Set the number of slices and stacks for the cylinder
var slices = 160;
var stacks = 160;

// Set the radius and height of the cylinder
var radius = 0.5;
var height = 1.0;

// Set the starting and ending angles for the cylinder
var startAngle = 0;
var endAngle = Math.PI * 2;

// Set the step size for the angles
var angleStep = (endAngle - startAngle) / slices;

// Set the step size for the height
var heightStep = height / stacks;

// Create an array to store the vertices
var vertices = [];

// Create an array to store the normals
var normals = [];

// Create an array to store the indices
var indices = [];

// Set the starting index for the indices
var index = 0;

// Set the starting y position for the cylinder
var y = -height / 2;

// Generate the vertices and normals for the cylinder
for (var i = 0; i <= stacks; i++) {
    // Set the starting angle for the slice
    var angle = startAngle;

    // Generate the vertices and normals for the slice
    for (var j = 0; j <= slices; j++) {
        // Calculate the x, y, and z coordinates of the vertex
        var x = radius * Math.cos(angle);
        var z = radius * Math.sin(angle);

        // Add the vertex to the array
        vertices.push(x, y, z);

        // Calculate the normal for the vertex
        var normal = vec3.fromValues(x, 0, z);
        vec3.normalize(normal, normal);
        normals.push(normal[0], normal[1], normal[2]);

        // Increment the angle
        angle += angleStep;
    }

    // Increment the y position
    y += heightStep;
}

// Add the top center vertex and its normal
vertices.push(0, height / 2, 0);
normals.push(0, 1, 0);

// Add the top lid edge vertices and their normals
for (var i = 0; i <= slices; i++) {
    // Calculate the x, y, and z coordinates of the vertex
    var angle = startAngle + i * angleStep;
    var x = radius * Math.cos(angle);
    var z = radius * Math.sin(angle);

    // Add the vertex to the array
    vertices.push(x, height / 2, z);

    // Add the normal to the array
    normals.push(0, 1, 0);
}


// Add the bottom center vertex and its normal
vertices.push(0, -height / 2, 0);
normals.push(0, -1, 0);

// Add the bottom lid edge vertices and their normals
for (var i = 0; i <= slices; i++) {
    // Calculate the x, y, and z coordinates of the vertex
    var angle = startAngle + i * angleStep;
    var x = radius * Math.cos(angle);
    var z = radius * Math.sin(angle);

    // Add the vertex to the array
    vertices.push(x, -height / 2, z);

    // Add the normal to the array
    normals.push(0, -1, 0);
}


// Generate the indices for the cylinder
for (var i = 0; i < stacks; i++) {
    for (var j = 0; j < slices; j++) {
        // Get the indices of the four vertices for the quad
        var i0 = (i + 0) * (slices + 1) + (j + 0);
        var i1 = (i + 0) * (slices + 1) + (j + 1);
        var i2 = (i + 1) * (slices + 1) + (j + 0);
        var i3 = (i + 1) * (slices + 1) + (j + 1);

        // Add the indices to the array
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
    }
}

// Generate the indices for the top lid
for (var i = 0; i < slices; i++) {
    // Get the indices of the three vertices for the triangle
    var i0 = (stacks + 1) * (slices + 1) + 1 + i;
    var i1 = (stacks + 1) * (slices + 1);
    var i2 = (stacks + 1) * (slices + 1) + 2 + i;

    // Add the indices to the array
    indices.push(i0, i1, i2);
}

// Generate the indices for the bottom lid
for (var i = 0; i < slices; i++) {
    // Get the indices of the three vertices for the triangle
    var i0 = (stacks + 1) * (slices + 1) + 2 + slices + i + 1;
    var i1 = (stacks + 1) * (slices + 1) + 2 + slices;
    var i2 = (stacks + 1) * (slices + 1) + 2 + slices + i + 2;

    // Add the indices to the array
    indices.push(i0, i1, i2);
}


// Create a vertex buffer object (VBO) and bind it
var vbo = gl.createBuffer();

// Check for errors
if (!vbo) {
    console.error("Error creating vertex buffer:", gl.getError());
}

gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

// Check for errors
if (gl.getError() !== gl.NO_ERROR) {
    console.error("Error binding vertex buffer:", gl.getError());
}

// Load the vertex data into the VBO
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Check for errors
if (gl.getError() !== gl.NO_ERROR) {
    console.error("Error setting vertex data:", gl.getError());
}

// Create a normal buffer object (NBO) and bind it
var nbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
// Load the normal data into the NBO
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);



// Create an index buffer object (IBO) and bind it
var ibo = gl.createBuffer();

// Check for errors
if (!ibo) {
    console.error("Error creating index buffer:", gl.getError());
}

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

// Check for errors
if (gl.getError() !== gl.NO_ERROR) {
    console.error("Error binding index buffer:", gl.getError());
}

// Load the index data into the IBO
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Check for errors
if (gl.getError() !== gl.NO_ERROR) {
    console.error("Error setting index data:", gl.getError());
}


var modelMatrix = mat4.create();
mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);


// Set the angle of rotation
var angle = Math.PI / 3;

// Set the x, y, and z components of the axis of rotation
var x = Math.random() * 2 - 1;
var y = Math.random() * 2 - 1;
var z = Math.random() * 2 - 1;

// Normalize the axis of rotation
var axis = vec3.fromValues(x, y, z);
vec3.normalize(axis, axis);

// Rotate the model matrix
mat4.rotate(modelMatrix, modelMatrix, angle, axis);


var viewMatrix = mat4.create();
mat4.lookAt(viewMatrix, [0, 0, 3], [0, 0, 0], [0, 1, 0]);

var projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 45, canvas.width / canvas.height, 0.1, 10);

// Set up the shaders and uniforms
var vertexShaderSource = `
attribute vec3 a_position;
attribute vec3 a_normal;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
varying vec3 v_normal;

void main() {
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1);
    v_normal = (u_model * vec4(a_normal, 1)).xyz; 
}
`;

var fragmentShaderSource = `
precision mediump float;

varying vec3 v_normal;

uniform vec3 u_lightPosition;
uniform vec3 u_ambientColor;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;

void main() {
  // Calculate the normal vector in eye space
  vec3 normal = normalize(v_normal);

  // Calculate the vector from the vertex to the light source
  vec3 lightVector = normalize(u_lightPosition - vec3(0.0, 0.0, 0.0));

  // Calculate the diffuse intensity
  float diffuseIntensity = max(dot(lightVector, normal), 0.0);

  // Calculate the specular intensity
  float specularIntensity = 0.0;
  if (diffuseIntensity > 0.0) {
    vec3 viewVector = normalize(-vec3(0.0, 0.0, 0.0));
    vec3 reflectVector = reflect(-lightVector, normal);
    specularIntensity = pow(max(dot(viewVector, reflectVector), 0.0), 64.0);
  }

  // Calculate the final color
  vec3 color = u_ambientColor + diffuseIntensity * u_diffuseColor + specularIntensity * u_specularColor;

  // Set the fragment color
  gl_FragColor = vec4(color, 1.0);
}
`;

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Check the status of the vertex shader
var vertexShaderStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
if (!vertexShaderStatus) {
    console.error("Error compiling vertex shader:", gl.getShaderInfoLog(vertexShader));
}

// Check the status of the fragment shader
var fragmentShaderStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
if (!fragmentShaderStatus) {
    console.error("Error compiling fragment shader:", gl.getShaderInfoLog(fragmentShader));
}

// Check the status of the program
var programStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
if (!programStatus) {
    console.error("Error linking program:", gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// Bind the VBO and IBO to the WebGL context
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);


// Set up the attributes and uniforms
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
var normalAttributeLocation = gl.getAttribLocation(program, "a_normal");

// Bind the VBO to the 'a_position' attribute
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttributeLocation);

// Bind the NBO to the 'a_normal' attribute
gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(normalAttributeLocation);

var modelMatrixLocation = gl.getUniformLocation(program, "u_model");
gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
// Check the value of the model matrix uniform
var modelMatrix = gl.getUniform(program, modelMatrixLocation);
//console.log("Model matrix:", modelMatrix);

var viewMatrixLocation = gl.getUniformLocation(program, "u_view");
gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

var projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);


// Set the light position, ambient color, diffuse color, and specular color
var lightPosition = vec3.fromValues(1.0, 1.0, 1.0);
var ambientColor = vec3.fromValues(0.2, 0.4, 0.2);
var diffuseColor = vec3.fromValues(0.8, 0.8, 0.8);
var specularColor = vec3.fromValues(1.0, 1.0, 1.0);

// Get the location of the uniform variables
var lightPositionLocation = gl.getUniformLocation(program, "u_lightPosition");
var ambientColorLocation = gl.getUniformLocation(program, "u_ambientColor");
var diffuseColorLocation = gl.getUniformLocation(program, "u_diffuseColor");
var specularColorLocation = gl.getUniformLocation(program, "u_specularColor");

// Set the uniform values
gl.uniform3fv(lightPositionLocation, lightPosition);
gl.uniform3fv(ambientColorLocation, ambientColor);
gl.uniform3fv(diffuseColorLocation, diffuseColor);
gl.uniform3fv(specularColorLocation, specularColor);


// Set up the animation angle
// Set the x, y, and z components of the axis of rotation
var x = Math.random() * 2 - 1;
var y = Math.random() * 2 - 1;
var z = Math.random() * 2 - 1;

// Normalize the axis of rotation
var axis = vec3.fromValues(x, y, z);
vec3.normalize(axis, axis);
var angle = Math.PI / 100;
var iteration = 0;

function updateModelMatrix() {
    // Rotate the model matrix
    mat4.rotate(modelMatrix, modelMatrix, angle, axis);
    iteration += 1;
    if (iteration > 100) {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        axis = vec3.fromValues(x, y, z);
        vec3.normalize(axis, axis);
        iteration = 0;
    }
}

canvas.addEventListener("mousemove", (event) => {
    // Update the light position if the mouse is down
    lightPosition[0] = event.clientX / canvas.width * 2 - 1;
    lightPosition[1] = -(event.clientY / canvas.height * 2 - 1);
});


function drawModel() {
    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update the model matrix
    updateModelMatrix();

    // Bind the world model matrix as a uniform in the vertex shader
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    modelMatrix = gl.getUniform(program, modelMatrixLocation);
    //console.log("Model matrix:", modelMatrix);

    // Update the light position uniform
    gl.uniform3fv(lightPositionLocation, lightPosition);

    // Draw the model
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Check for errors
    if (gl.getError() !== gl.NO_ERROR) {
        console.error("Error drawing:", gl.getError());
    }
    else {
        // Request the next frame
        requestAnimationFrame(drawModel);
    }
}

// Start the animation loop
requestAnimationFrame(drawModel);
