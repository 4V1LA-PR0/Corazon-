(() => {
  // DOM
  const enterBtn = document.getElementById('enterBtn');
  const welcome = document.getElementById('welcome');
  const heartSection = document.getElementById('heartSection');
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d', { alpha: true });
  const nameInput = document.getElementById('nameInput');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const speedRange = document.getElementById('speedRange');
  const music = document.getElementById('bgMusic');

  // Sizes
  let W = canvas.width;
  let H = canvas.height;
  let CX = W/2;
  let CY = H/2;

  // Points
  let points = [];
  const NUM_POINTS = 150;

  function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min }
  function hex(rgb){ return '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join('') }

  // Color interpolation helper
  function lerp(a,b,t){ return Math.round(a + (b-a)*t); }
  function mixColor(hexA, hexB, t){
    const a = hexA.replace('#','');
    const b = hexB.replace('#','');
    const ar = parseInt(a.substr(0,2),16), ag = parseInt(a.substr(2,2),16), ab = parseInt(a.substr(4,2),16);
    const br = parseInt(b.substr(0,2),16), bg = parseInt(b.substr(2,2),16), bb = parseInt(b.substr(4,2),16);
    const r = lerp(ar,br,t), g = lerp(ag,bg,t), b2 = lerp(ab,bb,t);
    return hex([r,g,b2]);
  }

  // Heart pattern
  const heartPattern = [
    "      *****       *****      ",
    "   *********** ***********   ",
    " *************************** ",
    "*****************************",
    "*****************************",
    "*****************************",
    " *************************** ",
    "  *************************  ",
    "    *********************    ",
    "      *****************      ",
    "        *************        ",
    "          *********          ",
    "            *****            ",
    "             ***             ",
    "              *              "
  ];

  function nameHeart(name){
    name = name || 'corazon';
    name = (name.repeat(200)).slice(0,200);
    let idx = 0;
    const lines = [];
    for(const row of heartPattern){
      let line = '';
      for(const ch of row){
        if(ch === '*'){
          line += name[idx % name.length];
          idx++;
        } else line += ' ';
      }
      lines.push(line);
    }
    return lines;
  }

  // Points initialization
  function initPoints(){
    points = [];
    for(let i=0;i<NUM_POINTS;i++){
      const x = Math.random()*W;
      const y = Math.random()*H;
      const size = Math.random()*2 + 1;
      const color = Math.random() < 0.6 ? 'Blue' : 'white'; 
      points.push({
        x,y,size,color,
        visible: Math.random() < 0.7,
        timer: rand(0,20),
        period: rand(40,90)
      });
    }
  }

  // Animation state
  let heartContent = '';
  let animating = false;
  let lines = [];
  let growPhase = 0;
  const SMALL = '#9a0f29'; // pequeño
  const LARGE = '#cf1462'; // grande

  function clear(){ ctx.clearRect(0,0,W,H); }
  function drawPoints(){
    for(const p of points){
      p.timer--;
      if(p.timer <= 0){
        p.visible = !p.visible;
        p.timer = p.period;
      }
      if(p.visible){
        ctx.fillStyle = (p.color === 'white') ? 'rgba(255,255,255,1)' : 'rgba(17, 66, 172, 1)';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
  }

  function drawHeartText(color, fontSize){
    ctx.save();
    ctx.font = `${Math.round(fontSize)}px "Consolas", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const linesArr = heartContent.split('\n');
    const lineHeight = fontSize * 0.85;
    const totalH = linesArr.length * lineHeight;
    let startY = CY - totalH/2 + lineHeight/2;

    ctx.fillStyle = color;
    for(let i=0;i<linesArr.length;i++){
      ctx.fillText(linesArr[i], CX, startY + i*lineHeight);
    }

    ctx.restore();
  }

  function frame(){
    clear();
    drawPoints();

    growPhase += 0.06;
    const t = 0.5 + 0.5*Math.sin(growPhase);
    const baseSize = Math.min(W,H)/65;
    const amplitude = baseSize / 3;
    const size = baseSize + amplitude * t;
    const color = mixColor(SMALL, LARGE, t);

    if(heartContent){
      drawHeartText(color, size*2.2);
    }

    requestAnimationFrame(frame);
  }

  initPoints();
  requestAnimationFrame(frame);

  // Controls
  enterBtn.addEventListener('click', () => {
    // Ocultar texto y botón
    enterBtn.style.display = 'none';
    welcome.querySelector('h1').style.display = 'none';

    welcome.classList.add('hidden');
    heartSection.classList.remove('hidden');

    // 🔊 Reproducir música al entrar
    music.volume = 0.4;
    music.play();
  });

  startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if(!name) return;

    // Ocultar inputs para mejor vista
    document.getElementById('uiTop').style.display = 'none';

    lines = nameHeart(name);
    heartContent = '';
    animating = true;

    let letterI = 0, letterJ = 0;
    const speed = 75; // ms entre cada letra
    const interval = setInterval(() => {
      if(letterI < lines.length){
        if(letterJ === 0) heartContent += '\n';
        const row = lines[letterI];
        if(letterJ < row.length){
          heartContent += row[letterJ];
          letterJ++;
        } else {
          letterI++;
          letterJ = 0;
        }
      } else {
        clearInterval(interval);
      }
    }, speed);
  });

  resetBtn.addEventListener('click', () => {
    music.currentTime = 0;
    initPoints();
    animating = false;
    heartContent = '';
    lines = [];
    growPhase = 0;

    // Mostrar inputs otra vez
    document.getElementById('uiTop').style.display = 'flex';

   
  });

  function resizeCanvas(){
    W = Math.min(window.innerWidth - 40, 900);
    H = Math.min(window.innerHeight - 120, 700);
    CX = W/2; CY = H/2;
    canvas.width = W;
    canvas.height = H;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

})();
