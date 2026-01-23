import { useRef, useEffect } from 'react';

// Neural Network CPPN Shader Background - WebGL Implementation
export default function NeuralBackground() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader - simplified CPPN
    const fragmentShaderSource = `
      precision mediump float;
      uniform float iTime;
      uniform vec2 iResolution;
      varying vec2 vUv;
      
      vec4 sigmoid(vec4 x) { return 1.0 / (1.0 + exp(-x)); }
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.y *= -1.0;
        
        float in0 = 0.1 * sin(0.3 * iTime);
        float in1 = 0.1 * sin(0.69 * iTime);
        float in2 = 0.1 * sin(0.44 * iTime);
        
        float r = sqrt(uv.x * uv.x + uv.y * uv.y);
        
        // Layer 1
        vec4 buf0 = vec4(uv.x, uv.y, 0.39 + in0, 0.36 + in1);
        vec4 buf1 = vec4(0.14 + in2, r, 0.0, 0.0);
        
        // Layer 2
        vec4 l2_0 = sigmoid(
          mat4(
            vec4(6.54, -3.61, 0.76, -1.14),
            vec4(2.46, 3.17, 1.22, 0.06),
            vec4(-5.48, -6.16, 1.87, -4.77),
            vec4(6.04, -5.54, -0.91, 3.25)
          ) * buf0 +
          mat4(
            vec4(0.85, -5.72, 3.98, 1.65),
            vec4(-0.24, 0.58, -1.77, -5.35),
            vec4(0.0, 0.0, 0.0, 0.0),
            vec4(0.0, 0.0, 0.0, 0.0)
          ) * buf1 +
          vec4(0.22, 1.12, -1.80, 5.03)
        );
        
        vec4 l2_1 = sigmoid(
          mat4(
            vec4(-3.35, -6.06, 0.56, -4.47),
            vec4(0.86, 1.74, 5.64, 1.61),
            vec4(2.49, -3.50, 1.72, 6.36),
            vec4(3.31, 8.21, 1.14, -1.17)
          ) * buf0 +
          mat4(
            vec4(5.24, -13.03, 0.01, 15.87),
            vec4(2.99, 3.13, -0.89, -1.68),
            vec4(0.0, 0.0, 0.0, 0.0),
            vec4(0.0, 0.0, 0.0, 0.0)
          ) * buf1 +
          vec4(-5.95, -6.57, -0.88, 1.54)
        );
        
        // Layer 3
        vec4 l3_0 = sigmoid(
          mat4(
            vec4(-15.22, 8.10, -2.43, -1.94),
            vec4(-5.95, 4.31, 2.64, 1.27),
            vec4(-7.31, 6.73, 5.25, 5.94),
            vec4(5.08, 8.98, -1.73, -1.16)
          ) * buf0 +
          mat4(
            vec4(-11.97, -11.61, 6.15, 11.24),
            vec4(2.12, -6.26, -1.71, -0.70),
            vec4(0.0, 0.0, 0.0, 0.0),
            vec4(0.0, 0.0, 0.0, 0.0)
          ) * buf1 +
          vec4(-4.17, -3.23, -4.58, -3.64)
        );
        
        vec4 l3_1 = sigmoid(
          mat4(
            vec4(3.18, -13.74, 1.88, 3.23),
            vec4(0.64, 12.77, 1.91, 0.51),
            vec4(-0.05, 4.48, 1.47, 1.80),
            vec4(5.00, 13.00, 3.40, -4.56)
          ) * buf0 +
          mat4(
            vec4(-0.13, 7.72, -3.14, 4.74),
            vec4(0.64, 3.71, -0.81, -0.39),
            vec4(0.0, 0.0, 0.0, 0.0),
            vec4(0.0, 0.0, 0.0, 0.0)
          ) * buf1 +
          vec4(-1.18, -21.62, 0.79, 1.23)
        );
        
        // Layer 5
        vec4 l5_0 = sigmoid(
          mat4(
            vec4(5.21, -7.18, 2.72, 2.66),
            vec4(-5.60, -25.36, 4.07, 0.46),
            vec4(-10.58, 24.29, 21.10, 37.55),
            vec4(4.30, -1.96, 2.35, -1.37)
          ) * l2_0 +
          mat4(
            vec4(-17.65, -10.51, 2.26, 12.46),
            vec4(6.27, -502.75, -12.64, 0.91),
            vec4(-10.98, 20.74, -9.70, -0.76),
            vec4(5.38, 1.48, -4.19, -4.84)
          ) * l2_1 +
          mat4(
            vec4(12.79, -16.35, -0.40, 1.80),
            vec4(-30.48, -1.83, 1.45, -1.11),
            vec4(19.87, -7.34, -42.94, -98.53),
            vec4(8.34, -2.73, -2.29, -36.14)
          ) * l3_0 +
          mat4(
            vec4(-16.30, 3.55, -0.44, -9.44),
            vec4(57.51, -35.61, 16.16, -4.15),
            vec4(-0.07, -3.87, -7.09, 3.15),
            vec4(-12.56, -7.08, 1.49, -0.82)
          ) * l3_1 +
          vec4(-7.68, 15.93, 1.32, -1.67)
        );
        
        // Output layer
        vec4 output_layer = sigmoid(
          mat4(
            vec4(1.68, 1.38, 2.96, 0.0),
            vec4(-1.88, -1.48, -3.59, 0.0),
            vec4(-1.33, -1.09, -2.31, 0.0),
            vec4(0.27, 0.23, 0.44, 0.0)
          ) * l2_0 +
          mat4(
            vec4(-0.63, -0.59, -0.91, 0.0),
            vec4(0.18, 0.18, 0.18, 0.0),
            vec4(-2.97, -2.58, -4.90, 0.0),
            vec4(1.42, 1.19, 2.52, 0.0)
          ) * l2_1 +
          mat4(
            vec4(-1.26, -1.06, -2.17, 0.0),
            vec4(-0.72, -0.53, -1.44, 0.0),
            vec4(0.15, 0.15, 0.27, 0.0),
            vec4(0.95, 0.89, 1.28, 0.0)
          ) * l3_0 +
          mat4(
            vec4(-2.42, -1.97, -4.35, 0.0),
            vec4(-22.68, -18.05, -41.95, 0.0),
            vec4(0.64, 0.55, 1.11, 0.0),
            vec4(-1.55, -1.31, -2.64, 0.0)
          ) * l3_1 +
          mat4(
            vec4(-0.49, -0.40, -0.91, 0.0),
            vec4(0.96, 0.79, 1.64, 0.0),
            vec4(0.31, 0.16, 0.86, 0.0),
            vec4(1.18, 0.95, 2.18, 0.0)
          ) * l5_0 +
          vec4(-1.55, -3.62, 0.25, 0.0)
        );
        
        gl_FragColor = vec4(output_layer.x, output_layer.y, output_layer.z, 1.0);
      }
    `;

    // Compile shaders
    const compileShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'iTime');
    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');

    const startTime = Date.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const time = (Date.now() - startTime) / 1000;
      
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 w-full h-full" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      {/* Overlay gradient for better text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30" />
    </div>
  );
}
