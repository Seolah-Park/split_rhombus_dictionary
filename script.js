const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const backgroundParticles = [];
const texts = ["P.CHAN", "Pombo-Ya-Pombo", "Bboo Bboo", "Aga-Mat", "Nimura, Nemura", "Ma-Jang-su", "Komi"];
const descriptions = [
    "With. SJY, YSW\nMeaning: Praise of Precure\nThis was used as a greeting.",
    "With. PHG, PJY\nMeaning: Car\nThis was used when I was a kid.",
    "With. KCY\nMeaning: the character 'Pororo'\nThis was used when my cousin was a kid.",
    "With. SJY\nMeaning: Sweet and soft taste\nThis was used as we shared foods soft enough for babies to eat.",
    "With. PHG, PJY\nMeaning: In dialect, this is the sentence meaning 'You eat it, I eat it.'\nThis was used in rhyming terms, when you want to say 'stop ceding the last piece of food to each other and let's eat anyone.'",
    "With. SJY, YSW, KSH\nMeaning: 'That is right'\nThis was used when you agree that the previous opponent is correct."
];
let currentTextIndex = 0;
const maxFontSize = 250; // 최대 폰트 크기
const particleCount = 3000; // 파티클 수 3000으로 설정
const backgroundParticleCount = 500; // 배경 파티클 수 500으로 설정
let mouseX = -1000;
let mouseY = -1000;
let time = 0;
let dispersedTime = 0;
let isTextFullyVisible = true;
let canSwitchText = true;
let isDispersing = false;
let dispersingTime = 0;
let transitioning = false;
let transitionTime = 0;
let descriptionOpacity = 0;
let descriptionTimer = 0; // 설명글 타이머

// Load the Cormorant Garamond font
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

function showIntro() {
    createBackgroundParticles(); // 배경 파티클을 먼저 생성
    animateBackgroundParticles(); // 배경 파티클 애니메이션 시작

    const intro = document.getElementById('intro');
    intro.style.fontWeight = '300'; // 폰트 굵기를 더 얇게 설정
    intro.style.fontFamily = "'Cormorant Garamond', serif"; // 폰트 설정
    intro.style.lineHeight = '1.4em'; // 줄간격을 넓힘
    intro.style.opacity = 1;
    setTimeout(() => {
        intro.style.opacity = 0;
        setTimeout(() => {
            intro.style.display = 'none';
            createParticlesForText(texts[currentTextIndex]);
            animate(); // 메인 애니메이션 시작
        }, 2000); // 2초 동안 사라지는 애니메이션 시간
    }, 3000); // 3초 동안 보여줌
}

function calculateFontSize(text, maxWidth) {
    let fontSize = maxFontSize;
    ctx.font = `lighter ${fontSize}px 'Cormorant Garamond'`;
    while (ctx.measureText(text).width > maxWidth) {
        fontSize -= 10;
        ctx.font = `lighter ${fontSize}px 'Cormorant Garamond'`;
    }
    return fontSize * 0.85; // 폰트 크기를 0.85배로 줄임
}

function createParticlesForText(text) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const fontSize = calculateFontSize(text, canvas.width - 20);
    tempCtx.font = `lighter ${fontSize}px 'Cormorant Garamond'`;
    tempCtx.fillStyle = 'white';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

    const targetPositions = [];
    for (let y = 0; y < tempCanvas.height; y += 3) { // 스캔 속도를 위해 3픽셀 단위로 증가
        for (let x = 0; x < tempCanvas.width; x += 3) { // 스캔 속도를 위해 3픽셀 단위로 증가
            const index = (y * tempCanvas.width + x) * 4;
            if (imageData[index + 3] > 128) {
                targetPositions.push({ x, y });
            }
        }
    }

    particles.length = 0; // Clear the existing particles
    for (let i = 0; i < particleCount; i++) {
        const targetIndex = Math.floor(Math.random() * targetPositions.length);
        const target = targetPositions[targetIndex];
        
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.2 + 0.5,
            originalSize: Math.random() * 1.2 + 0.5,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            originalSpeedX: (Math.random() - 0.5) * 2,
            originalSpeedY: (Math.random() - 0.5) * 2,
            targetX: target.x,
            targetY: target.y,
            offsetX: Math.random() * 10 - 5,
            offsetY: Math.random() * 10 - 5,
            angle: Math.random() * Math.PI * 2,
            alpha: Math.random(),
            glow: false,
            originalAlpha: Math.random(),
            glowTime: 0,
            transitioning: false // 텍스트 전환 중인지 여부
        });
    }
}

function createBackgroundParticles() {
    for (let i = 0; i < backgroundParticleCount; i++) {
        backgroundParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: (Math.random() * 1.5 + 0.5) * 0.85, // 크기를 0.85배로 줄임
            originalSize: (Math.random() * 1.5 + 0.5) * 0.85, // 크기를 0.85배로 줄임
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.55 + 0.1, // 투명도가 0.65 이하로 유지되도록 설정
            originalAlpha: Math.random() * 0.55 + 0.1, // 투명도가 0.65 이하로 유지되도록 설정
            twinkleTime: Math.random() * 50, // 반짝임 시간을 랜덤하게 설정
            twinkleDirection: 1 // 반짝임 방향을 설정 (1: 증가, -1: 감소)
        });
    }
}

function updateParticlesForNextText(text) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const fontSize = calculateFontSize(text, canvas.width - 20);
    tempCtx.font = `lighter ${fontSize}px 'Cormorant Garamond'`;
    tempCtx.fillStyle = 'white';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

    const targetPositions = [];
    for (let y = 0; y < tempCanvas.height; y += 3) { // 스캔 속도를 위해 3픽셀 단위로 증가
        for (let x = 0; x < tempCanvas.width; x += 3) { // 스캔 속도를 위해 3픽셀 단위로 증가
            const index = (y * tempCanvas.width + x) * 4;
            if (imageData[index + 3] > 128) {
                targetPositions.push({ x, y });
            }
        }
    }

    particles.forEach(p => {
        const targetIndex = Math.floor(Math.random() * targetPositions.length);
        const target = targetPositions[targetIndex];
        p.targetX = target.x;
        p.targetY = target.y;
        p.transitioning = true; // 전환 중임을 표시
        p.alpha = 0; // 시작 시 투명하게 설정
    });
}

function calculateDispersal() {
    let totalDisplacement = 0;
    particles.forEach(p => {
        const dx = p.x - p.targetX;
        const dy = p.y - p.targetY;
        totalDisplacement += Math.sqrt(dx * dx + dy * dy);
    });
    const maxDisplacement = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) * particles.length;
    return Math.min((totalDisplacement / maxDisplacement) * 100, 100).toFixed(2);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    time += 0.05;
    let allDispersed = true;

    backgroundParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        p.twinkleTime -= 0.1; // 반짝임 시간 감소
        if (p.twinkleTime <= 0) {
            p.twinkleDirection *= -1; // 반짝임 방향을 반대로 변경
            p.twinkleTime = Math.random() * 50; // 새로운 반짝임 시간 설정
        }

        p.alpha += p.twinkleDirection * 0.02; // 반짝임 방향에 따라 투명도 변경
        p.alpha = Math.max(0.1, Math.min(p.alpha, 0.65)); // 투명도가 0.1에서 0.65 사이로 유지되도록 설정

        p.size += p.twinkleDirection * 0.04; // 반짝임 방향에 따라 크기 변경 (속도 증가)
        p.size = Math.max(p.originalSize, Math.min(p.size, p.originalSize * 1.2)); // 크기가 원래 크기에서 1.2배 사이로 유지되도록 설정

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    });

    particles.forEach(p => {
        const { x, y, originalSize, size, targetX, targetY, speedX, speedY, offsetX, offsetY, angle, alpha, glow, originalAlpha, transitioning } = p;

        const dx = mouseX - x;
        const dy = mouseY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
            p.speedX = dx * -0.1 + (Math.random() - 0.5) * 5;
            p.speedY = dy * -0.1 + (Math.random() - 0.5) * 5;
            p.glow = true;
            p.alpha = 1;
            p.size = originalSize * 1.2;
            p.glowTime = 0.5; // glow 효과 시간 감소
            allDispersed = false;
            isTextFullyVisible = false;
        } else {
            p.speedX += (p.originalSpeedX - p.speedX) * 0.1; // 복귀 속도 증가
            p.speedY += (p.originalSpeedY - p.speedY) * 0.1; // 복귀 속도 증가

            p.angle += 0.05;
            const oscillationX = offsetX * Math.sin(p.angle);
            const oscillationY = offsetY * Math.cos(p.angle);
            if (isDispersing) {
                p.x += (x - targetX - oscillationX) * 0.1; // 파티클을 더 흩어지게 함
                p.y += (y - targetY - oscillationY) * 0.1; // 파티클을 더 흩어지게 함
            } else {
                p.x += (targetX + oscillationX - x) * 0.1; // 복귀 속도 증가
                p.y += (targetY + oscillationY - y) * 0.1; // 복귀 속도 증가
            }

            if (p.glowTime > 0) {
                p.glowTime -= 0.05;
                p.alpha = 0.5 + 0.5 * Math.sin(time + p.angle);
                p.size += (originalSize - p.size) * 0.2; // 원래 크기로 돌아오는 속도 증가
            } else {
                p.glow = false;
                p.alpha = transitioning ? Math.min(p.alpha + 0.01, 1) : originalAlpha; // 서서히 선명해짐, 불투명해지는 속도 감소
                p.size = originalSize;
            }

            if (Math.abs(targetX + oscillationX - x) > 10 || Math.abs(targetY + oscillationY - y) > 10) {
                allDispersed = false;
            }
        }

        p.x += speedX;
        p.y += speedY;

        if (p.glow) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    });

    if (allDispersed) {
        dispersedTime += 0.05;
        if (dispersedTime > 0.5) {
            isTextFullyVisible = true;
        }
    } else {
        dispersedTime = 0;
    }

    const dispersalPercentage = calculateDispersal();

    if (dispersalPercentage < 0.53) { // 조건을 0.5에서 0.53으로 변경
        descriptionTimer += 0.05; // 설명글 타이머 증가
        if (descriptionTimer >= 1.5) { // 타이머가 1.5초 이상일 때만
            descriptionOpacity = Math.min(descriptionOpacity + 0.01, 1); // 서서히 선명해짐, 불투명해지는 속도 감소
        }
        canSwitchText = true;
    } else {
        descriptionTimer = 0; // 타이머 초기화
        descriptionOpacity = Math.max(descriptionOpacity - 0.05, 0); // 서서히 사라짐
    }

    const descriptionLines = descriptions[currentTextIndex].split('\n');
    ctx.fillStyle = `rgba(192, 192, 192, ${descriptionOpacity})`; // 회색으로 수정
    ctx.font = 'lighter 20px \'Cormorant Garamond\', serif'; // 폰트 설정
    ctx.textAlign = 'center';
    descriptionLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 120 + (index * 25)); // 설명글 위치 조정 (위로 30px 올림)
    });

    if (canSwitchText && !isTextFullyVisible && dispersalPercentage > 1.3) { // 숫자를 1.5%에서 1.3%로 변경
        isDispersing = true;
        dispersingTime = 2.5; // 0.3초 동안 더 흩어짐
        canSwitchText = false;
    }

    if (isDispersing) {
        dispersingTime -= 0.05;
        if (dispersingTime <= 0) {
            isDispersing = false;
            currentTextIndex = (currentTextIndex + 1) % texts.length;
            updateParticlesForNextText(texts[currentTextIndex]);
            isTextFullyVisible = true;
        }
    }

    requestAnimationFrame(animate);
}

function animateBackgroundParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    backgroundParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        p.twinkleTime -= 0.1; // 반짝임 시간 감소
        if (p.twinkleTime <= 0) {
            p.twinkleDirection *= -1; // 반짝임 방향을 반대로 변경
            p.twinkleTime = Math.random() * 50; // 새로운 반짝임 시간 설정
        }

        p.alpha += p.twinkleDirection * 0.02; // 반짝임 방향에 따라 투명도 변경
        p.alpha = Math.max(0.1, Math.min(p.alpha, 0.65)); // 투명도가 0.1에서 0.65 사이로 유지되도록 설정

        p.size += p.twinkleDirection * 0.04; // 반짝임 방향에 따라 크기 변경 (속도 증가)
        p.size = Math.max(p.originalSize, Math.min(p.size, p.originalSize * 1.2)); // 크기가 원래 크기에서 1.2배 사이로 유지되도록 설정

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    });

    requestAnimationFrame(animateBackgroundParticles);
}

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
});

showIntro();
