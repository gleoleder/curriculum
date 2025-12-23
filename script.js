// ==========================================
// INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initDoublePulseCursor();
    initUrbanGrid();
    initGlobe();
    initBoliviaMap();
    initScrollAnimations();
    initAnimatedCoords();
    initSmoothScroll();
    initProjectImages();
});

// ==========================================
// CURSOR DOBLE PULSO
// ==========================================
function initDoublePulseCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const cursorPulse = document.querySelector('.cursor-pulse');
    
    if (!cursorDot || !cursorRing || !cursorPulse) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        dotX += (mouseX - dotX) * 0.2;
        dotY += (mouseY - dotY) * 0.2;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
        cursorDot.style.transform = 'translate(-50%, -50%)';

        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        cursorRing.style.transform = 'translate(-50%, -50%)';

        cursorPulse.style.left = ringX + 'px';
        cursorPulse.style.top = ringY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverElements = document.querySelectorAll('a, button, .skill-card, .project-card, .project-locations-list li, input');
    hoverElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursorDot.classList.add('hover');
            cursorRing.classList.add('hover');
        });
        el.addEventListener('mouseleave', function() {
            cursorDot.classList.remove('hover');
            cursorRing.classList.remove('hover');
        });
    });
}

// ==========================================
// ANIMACIONES DE VÍAS URBANAS
// ==========================================
function initUrbanGrid() {
    const urbanGrid = document.querySelector('.urban-grid');
    if (!urbanGrid) return;

    for (let i = 0; i < 8; i++) {
        const lineH = document.createElement('div');
        lineH.className = 'urban-line urban-line-h';
        lineH.style.top = (10 + i * 12) + '%';
        lineH.style.animationDelay = (i * 0.8) + 's';
        urbanGrid.appendChild(lineH);

        const dotH = document.createElement('div');
        dotH.className = 'traffic-dot traffic-dot-h';
        dotH.style.top = (10 + i * 12) + '%';
        dotH.style.animationDelay = (i * 1.2) + 's';
        dotH.style.animationDuration = (4 + Math.random() * 4) + 's';
        urbanGrid.appendChild(dotH);
    }

    for (let i = 0; i < 10; i++) {
        const lineV = document.createElement('div');
        lineV.className = 'urban-line urban-line-v';
        lineV.style.left = (5 + i * 10) + '%';
        lineV.style.animationDelay = (i * 0.6) + 's';
        urbanGrid.appendChild(lineV);

        const dotV = document.createElement('div');
        dotV.className = 'traffic-dot traffic-dot-v';
        dotV.style.left = (5 + i * 10) + '%';
        dotV.style.animationDelay = (i * 0.9) + 's';
        dotV.style.animationDuration = (5 + Math.random() * 5) + 's';
        urbanGrid.appendChild(dotV);
    }
}

// ==========================================
// CARGA DE IMÁGENES DESDE GOOGLE DRIVE
// ==========================================
function initProjectImages() {
    const savedImages = JSON.parse(localStorage.getItem('projectImages') || '{}');
    
    document.querySelectorAll('.project-card').forEach(function(card, index) {
        const input = card.querySelector('.gdrive-url');
        const btn = card.querySelector('.load-image-btn');
        const imgElement = card.querySelector('.project-image');
        
        if (savedImages[index] && imgElement) {
            imgElement.src = savedImages[index];
            imgElement.style.display = 'block';
            const placeholder = card.querySelector('.project-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        }
        
        if (btn && input) {
            btn.addEventListener('click', function() {
                const url = input.value.trim();
                if (url) {
                    const imageUrl = convertGoogleDriveUrl(url);
                    if (imgElement) {
                        imgElement.src = imageUrl;
                        imgElement.style.display = 'block';
                        imgElement.onerror = function() {
                            alert('Error al cargar la imagen. Verifica que el enlace sea público.');
                            imgElement.style.display = 'none';
                        };
                        imgElement.onload = function() {
                            savedImages[index] = imageUrl;
                            localStorage.setItem('projectImages', JSON.stringify(savedImages));
                            const placeholder = card.querySelector('.project-placeholder');
                            if (placeholder) placeholder.style.display = 'none';
                        };
                    }
                }
            });
            
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    btn.click();
                }
            });
        }
    });
}

function convertGoogleDriveUrl(url) {
    let fileId = '';
    
    if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
    } else if (url.includes('id=')) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
    } else if (url.includes('uc?')) {
        return url;
    } else {
        fileId = url;
    }
    
    if (fileId) {
        return 'https://drive.google.com/uc?export=view&id=' + fileId;
    }
    
    return url;
}

// ==========================================
// GLOBO 3D CON MAPA MUNDIAL
// ==========================================
function initGlobe() {
    const container = document.getElementById('globe-container');
    if (!container) return;

    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Esfera principal (Tierra)
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a4d6e,
        emissive: 0x0a1520,
        specular: 0x333333,
        shininess: 15,
        transparent: true,
        opacity: 0.95
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Grid de latitud/longitud
    const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0xd4a84b, 
        transparent: true, 
        opacity: 0.2
    });

    for (let lat = -80; lat <= 80; lat += 20) {
        const points = [];
        const phi = (90 - lat) * Math.PI / 180;
        
        for (let lon = 0; lon <= 360; lon += 5) {
            const theta = lon * Math.PI / 180;
            const x = 5.02 * Math.sin(phi) * Math.cos(theta);
            const y = 5.02 * Math.cos(phi);
            const z = 5.02 * Math.sin(phi) * Math.sin(theta);
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        earth.add(line);
    }

    for (let lon = 0; lon < 360; lon += 30) {
        const points = [];
        const theta = lon * Math.PI / 180;
        
        for (let lat = -90; lat <= 90; lat += 5) {
            const phi = (90 - lat) * Math.PI / 180;
            const x = 5.02 * Math.sin(phi) * Math.cos(theta);
            const y = 5.02 * Math.cos(phi);
            const z = 5.02 * Math.sin(phi) * Math.sin(theta);
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        earth.add(line);
    }

    // ==========================================
    // FUNCIÓN PARA CONVERTIR LAT/LON A 3D
    // ==========================================
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = -(lon + 180) * Math.PI / 180;
        return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // ==========================================
    // FUNCIÓN PARA CREAR CONTORNO DE UN SOLO COLOR
    // ==========================================
    function createOutline(coords, color, radius) {
        const points = [];
        coords.forEach(function(coord) {
            points.push(latLonToVector3(coord[1], coord[0], radius));
        });
        points.push(points[0].clone());
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.8 
        });
        return new THREE.Line(geometry, material);
    }

    // ==========================================
    // FUNCIÓN PARA CREAR POLÍGONO CON DEGRADÉ
    // ==========================================
    function createGradientPolygon(coords, radius) {
        const vertices = [];
        const colors = [];
        const indices = [];

        const colorRed = new THREE.Color(0xff3333);
        const colorYellow = new THREE.Color(0xffdd00);
        const colorGreen = new THREE.Color(0x33cc33);

        let centerLat = 0, centerLon = 0;
        coords.forEach(function(coord) {
            centerLon += coord[0];
            centerLat += coord[1];
        });
        centerLat /= coords.length;
        centerLon /= coords.length;

        const centerPos = latLonToVector3(centerLat, centerLon, radius);
        vertices.push(centerPos.x, centerPos.y, centerPos.z);
        colors.push(colorYellow.r, colorYellow.g, colorYellow.b);

        coords.forEach(function(coord, i) {
            const pos = latLonToVector3(coord[1], coord[0], radius);
            vertices.push(pos.x, pos.y, pos.z);

            const t = i / coords.length;
            let color;
            
            if (t < 0.33) {
                color = colorRed.clone().lerp(colorYellow, t * 3);
            } else if (t < 0.66) {
                color = colorYellow.clone().lerp(colorGreen, (t - 0.33) * 3);
            } else {
                color = colorGreen.clone().lerp(colorRed, (t - 0.66) * 3);
            }
            
            colors.push(color.r, color.g, color.b);
        });

        for (let i = 1; i <= coords.length; i++) {
            const next = i === coords.length ? 1 : i + 1;
            indices.push(0, i, next);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        return new THREE.Mesh(geometry, material);
    }

    // ==========================================
    // MAPA MUNDIAL - COORDENADAS DE CONTINENTES
    // ==========================================
    const worldMap = {
        northAmerica: [
        [-156.5, 71.3], // Point Barrow (Alaska Norte)
        [-141.0, 69.6], // Frontera Alaska/Canadá
        [-130.0, 70.0], // Territorios del Noroeste
        [-115.0, 68.0], // Nunavut Norte
        [-95.0, 70.0],  // Península de Boothia
        
        // --- Bahía de Hudson (El gran hueco de Canadá) ---
        [-85.0, 67.0],  // Entrada Oeste
        [-90.0, 58.0],  // Churchill (Oeste de la bahía)
        [-80.0, 52.0],  // James Bay (Fondo sur)
        [-75.0, 60.0],  // Quebec Norte
        [-65.0, 60.0],  // Labrador Norte
        
        // --- Costa Este (Atlántico) ---
        [-55.5, 53.0],  // Labrador / Terranova
        [-60.0, 46.0],  // Nueva Escocia
        [-67.0, 45.0],  // Maine (USA)
        [-70.0, 42.0],  // Cape Cod (Massachusetts)
        [-74.0, 40.5],  // Nueva York / Nueva Jersey
        [-75.5, 35.2],  // Cabo Hatteras (Carolina del Norte)
        [-80.0, 32.0],  // Georgia / Carolinas
        [-80.2, 25.8],  // Miami (Florida Este)
        [-81.8, 24.5],  // Cayos de Florida
        
        // --- Golfo de México ---
        [-82.5, 28.0],  // Tampa / Florida Oeste
        [-89.0, 29.0],  // Delta del Misisipi (Nueva Orleans)
        [-97.0, 26.0],  // Brownsville (Frontera USA/México)
        [-97.5, 22.0],  // Tampico
        [-96.0, 19.0],  // Veracruz
        
        // --- Península de Yucatán ---
        [-90.0, 21.0],  // Campeche
        [-87.0, 21.5],  // Cancún (Punta Noreste)
        [-88.0, 18.0],  // Belice / Chetumal
        
        // --- Centroamérica (Bajando hacia el Sur) ---
        [-83.5, 14.0],  // Nicaragua (Cabo Gracias a Dios)
        [-83.0, 10.0],  // Costa Rica (Limón)
        [-79.5, 9.0],   // Panamá Canal
        [-77.5, 8.5],   // Frontera Panamá/Colombia (Conexión con Sudamérica)
        
        // --- Costa Pacífico (Subiendo hacia el Norte) ---
        [-80.0, 7.2],   // Punta sur de Panamá
        [-85.0, 10.0],  // Costa Rica Pacífico
        [-88.0, 13.0],  // El Salvador
        [-92.0, 14.5],  // Guatemala
        [-95.0, 16.0],  // Oaxaca (México)
        [-105.5, 20.5], // Puerto Vallarta
        [-109.0, 23.0], // Cabo San Lucas (Punta Baja California)
        
        // --- Baja California y Costa Oeste USA ---
        [-114.0, 28.0], // Baja California Medio
        [-117.0, 32.5], // Tijuana / San Diego
        [-120.5, 34.5], // Point Conception (Cerca de Los Ángeles)
        [-122.5, 37.8], // San Francisco
        [-124.0, 40.0], // Cabo Mendocino
        [-124.5, 48.0], // Seattle / Vancouver (Estrecho de Juan de Fuca)
        
        // --- Costa Oeste Canadá y Alaska ---
        [-130.0, 54.0], // Columbia Británica / Haida Gwaii
        [-140.0, 60.0], // Glaciar Malaspina (Alaska Sur)
        [-151.0, 59.0], // Península de Kenai
        [-160.0, 55.0], // Inicio Aleutianas
        [-162.0, 58.0], // Bahía de Bristol
        [-166.0, 60.0], // Cabo Newenham
        [-168.0, 65.5], // Estrecho de Bering (Cabo Príncipe de Gales)
        [-162.0, 67.0], // Kotzebue
        [-156.5, 71.3]
    ],
    southAmerica: [
        [-80, 10], [-75, 5], [-70, 5], [-60, 5], [-50, 0],
        [-45, -5], [-40, -10], [-45, -20], [-50, -25], [-55, -30],
        [-60, -35], [-65, -40], [-70, -45], [-70, -50], [-68, -55],
        [-70, -55], [-75, -50], [-70, -40], [-72, -35], [-70, -30],
        [-70, -20], [-75, -15], [-80, -5], [-80, 0], [-80, 10] // <-- Cierre añadido
    ],
    europe: [
        [-10, 36], [-10, 44], [-5, 48], [0, 50], [0, 55], 
        [10, 55], [20, 65], [30, 70], [40, 65], [30, 60], 
        [25, 60], [20, 55], [25, 45], [20, 40], [15, 40], 
        [10, 45], [5, 40], [0, 40], [-5, 36], [-10, 36]
    ],
    africa: [
        [-5.8, 35.8],   // Estrecho de Gibraltar (Marruecos)
    [2.0, 36.5],    // Argelia
    [10.8, 37.3],   // Cabo Bon (Túnez)
    [15.0, 32.0],   // Libia (Golfo de Sidra)
    [20.0, 32.5],   // Cirenaica
    [25.0, 31.5],   // Frontera Libia/Egipto
    [30.0, 31.0],   // Alejandría
    [32.5, 31.2],   // Delta del Nilo / Port Said

    // --- Costa Este (Mar Rojo y Cuerno de África) ---
    [32.3, 29.9],   // Canal de Suez
    [33.5, 27.5],   // Mar Rojo (Egipto)
    [35.5, 24.0],   // Hala'ib
    [37.0, 20.0],   // Puerto Sudán
    [39.0, 15.5],   // Eritrea (Massawa)
    [43.0, 12.5],   // Djibouti
    [51.4, 11.9],   // Cabo Guardafui (Punta del Cuerno de África - Somalia)
    [49.0, 9.0],    // Costa de Somalia
    [41.0, -1.0],   // Somalia Sur / Kenia

    // --- Costa Este (Índico) ---
    [40.5, -5.0],   // Tanzania (Zanzíbar)
    [40.6, -10.5],  // Frontera Tanzania/Mozambique
    [40.5, -15.0],  // Mozambique
    [35.0, -20.0],  // Beira
    [35.5, -23.5],  // Inhambane
    [32.8, -26.0],  // Maputo
    [32.0, -28.5],  // Sudáfrica (Richards Bay)

    // --- Sur (El Cabo) ---
    [25.0, -34.0],  // Port Elizabeth
    [20.0, -34.8],  // Cabo de las Agujas (Punto más al sur)
    [18.4, -34.3],  // Cabo de Buena Esperanza
    [18.0, -32.0],  // Costa Oeste Sudáfrica

    // --- Costa Oeste (Atlántico Sur) ---
    [15.0, -26.0],  // Namibia (Luderitz)
    [14.5, -23.0],  // Walvis Bay
    [12.0, -17.0],  // Frontera Namibia/Angola
    [13.0, -9.0],   // Luanda (Angola)
    [9.0, -1.0],    // Gabón (Cabo López)

    // --- Golfo de Guinea (El "Sobaco" de África) ---
    [9.5, 4.0],     // Camerún / Douala
    [8.0, 4.5],     // Delta del Níger (Nigeria)
    [3.5, 6.4],     // Lagos
    [0.0, 5.5],     // Accra (Ghana)
    [-5.0, 4.5],    // Costa de Marfil
    [-7.5, 4.3],    // Cabo Palmas (Liberia)

    // --- Costa Oeste (El "Bulto" Occidental) ---
    [-11.0, 7.0],   // Sierra Leona
    [-14.0, 11.0],  // Guinea-Bissau
    [-16.5, 13.5],  // Gambia
    [-17.5, 14.7],  // Dakar (Senegal) - Punto más occidental
    [-16.5, 19.0],  // Mauritania (Nouakchott)
    [-17.0, 21.0],  // Cabo Blanco
    [-14.0, 24.0],  // Sahara Occidental (Dakhla)
    [-13.0, 27.0],  // El Aaiún
    [-10.0, 29.5],  // Agadir (Marruecos)
    [-7.0, 33.5],   // Casablanca
    [-5.8, 35.8]
    ],
    asia: [
       // --- Frontera Norte (Ártico Ruso) ---
        [60.0, 70.0],   // Montes Urales Norte (Frontera con Europa)
        [90.0, 75.0],   // Siberia Norte (Península de Taimyr)
        [140.0, 73.0],  // Yakutia
        [170.0, 70.0],  // Chukotka (Cerca del Estrecho de Bering)
        
        // --- Costa Pacífico Norte ---
        [170.0, 60.0],  // Kamchatka Norte
        [160.0, 52.0],  // Punta Sur Kamchatka
        [140.0, 54.0],  // Mar de Ojotsk
        [135.0, 45.0],  // Primorie (Vladivostok)
        
        // --- Corea y China ---
        [130.0, 42.0],  // Frontera Rusia/Corea
        [129.5, 35.0],  // Corea del Sur (Busan)
        [126.0, 37.5],  // Seúl / Costa Oeste
        [122.0, 39.0],  // Dalian (China)
        [122.0, 30.0],  // Shanghái
        [118.0, 24.0],  // Xiamen (Frente a Taiwán)
        [114.0, 22.5],  // Hong Kong
        
        // --- Sudeste Asiático (Indochina) ---
        [109.0, 12.0],  // Vietnam Sur (Cerca de Ho Chi Minh)
        [105.0, 8.5],   // Delta del Mekong
        [100.0, 13.0],  // Tailandia (Golfo)
        [103.0, 3.0],   // Malasia (Punta Peninsular - Singapur)
        [98.0, 8.0],    // Costa Andamán (Tailandia/Myanmar)
        [94.0, 16.0],   // Delta del Irrawaddy (Myanmar)
        
        // --- Subcontinente Indio ---
        [90.0, 22.0],   // Bangladesh
        [85.0, 20.0],   // India Costa Este
        [80.0, 10.0],   // Costa de Coromandel
        [77.5, 8.0],    // Cabo Comorín (Punta Sur India)
        [75.0, 12.0],   // Kerala / Goa
        [70.0, 20.0],   // Bombay / Gujarat
        [67.0, 25.0],   // Karachi (Pakistán)
        
        // --- Medio Oriente ---
        [60.0, 25.0],   // Irán Costa Sur
        [56.0, 26.0],   // Estrecho de Ormuz
        [55.0, 24.0],   // Omán / EAU
        [60.0, 22.0],   // Punta de Omán
        [50.0, 15.0],   // Yemen (Frontera Sur)
        [45.0, 12.5],   // Adén (Yemen Oeste)
        [43.0, 15.0],   // Mar Rojo (Yemen/Arabia Saudita)
        [35.0, 28.0],   // Golfo de Aqaba / Jordania
        
        // --- Mediterráneo Oriental y Turquía ---
        [34.0, 31.0],   // Israel / Líbano
        [36.0, 36.0],   // Frontera Siria/Turquía (Hatay)
        [32.0, 36.5],   // Costa Sur Turquía (Antalya)
        [27.0, 38.0],   // Egeo (Izmir)
        [26.0, 40.0],   // Dardanelos (Frontera Europa)
        [29.0, 41.0],   // Estambul (Lado Asiático)
        [35.0, 42.0],   // Costa Mar Negro (Sinope)
        [40.0, 41.0],   // Trebisonda / Georgia
        
        // --- Frontera Occidental (Cáucaso/Caspio/Urales) ---
        [50.0, 40.0],   // Mar Caspio (Bakú)
        [52.0, 45.0],   // Caspio Norte (Kazajistán)
        [55.0, 50.0],   // Frontera Kazajistán/Rusia
        [60.0, 60.0],   // Montes Urales
        [60.0, 70.0]    // Cierre en el Ártico
    ],
    australia: [
        [142.5, -10.7], // Punta Norte (Cabo York)
        [145.5, -14.5], // Costa hacia Cairns
        
        // Costa Este (Pacífico)
        [146.0, -18.0], // Townsville
        [150.5, -22.0], // Shoalwater
        [153.2, -26.5], // Sunshine Coast / Brisbane (Punto más al Este)
        [153.6, -28.6], // Byron Bay
        [151.2, -33.9], // Sídney
        [150.0, -37.5], // Frontera NSW/Victoria (Cabo Howe)
        
        // Costa Sur (Victoria y Gran Bahía Australiana)
        [146.5, -39.0], // Wilsons Promontory (Punto más al Sur del continente)
        [145.0, -38.0], // Bahía de Melbourne
        [140.0, -38.0], // Mount Gambier
        [138.5, -35.5], // Adelaida / Península Yorke
        [135.5, -34.5], // Península Eyre
        [131.0, -31.5], // Gran Bahía Australiana (Head of Bight)
        [125.0, -33.0], // Costa Sur Oeste
        [120.0, -34.0], // Esperance
        
        // Costa Oeste (Océano Índico)
        [118.0, -35.0], // Albany
        [115.0, -34.4], // Cabo Leeuwin (Punta Suroeste)
        [115.5, -32.0], // Perth
        [113.0, -26.0], // Shark Bay (Punta Oeste)
        [114.0, -22.0], // Exmouth / Ningaloo
        [117.0, -20.5], // Karratha
        
        // Costa Noroeste y Top End
        [122.0, -18.0], // Broome
        [129.0, -15.0], // Joseph Bonaparte Gulf
        [130.8, -12.4], // Darwin
        [133.0, -11.0], // Arnhem Land Norte
        [136.5, -12.0], // Nhulunbuy
        
        // Golfo de Carpentaria (La "U" de arriba)
        [136.0, -14.5], // Lado Oeste del Golfo
        [138.0, -16.5], // Fondo del Golfo
        [141.5, -16.0], // Lado Este del Golfo
        [141.8, -12.5], // Subiendo hacia Cabo York
        [142.5, -10.7]
    ],
    antarctica: [
        [-57.0, -63.3],  // Punta de la Península (Cerca de Base Esperanza)
        [-55.0, -65.0],  // Lado Este de la península
        
        // --- Mar de Weddell y Costa Atlántica ---
        [-50.0, -72.0],  // Barrera de Hielo Larsen
        [-30.0, -76.0],  // Fondo del Mar de Weddell
        [-20.0, -73.0],  // Tierra de Coats
        [0.0, -70.0],    // Meridiano de Greenwich (Base Neumayer)
        
        // --- Antártida Oriental (Lado Índico) ---
        [30.0, -69.0],   // Tierra de la Reina Maud
        [50.0, -67.0],   // Costa de Enderby
        [75.0, -69.0],   // Barrera de Amery
        [90.0, -66.5],   // Base Mirny
        [110.0, -66.0],  // Tierra de Wilkes (Base Casey)
        [140.0, -66.5],  // Tierra Adelia (Dumont d'Urville)
        
        // --- Mar de Ross (El gran "mordisco" del sur) ---
        [160.0, -70.0],  // Cabo Adare (Entrada al Mar de Ross)
        [170.0, -77.0],  // Barrera de Ross (Lado Este)
        [-170.0, -78.0], // Barrera de Ross (Lado Oeste - McMurdo)
        [-155.0, -76.0], // Costa de Eduardo VII
        
        // --- Antártida Occidental (Lado Pacífico) ---
        [-130.0, -74.0], // Tierra de Marie Byrd
        [-110.0, -73.0], // Mar de Amundsen
        [-90.0, -72.0],  // Isla Pedro I (aprox costa)
        
        // --- Vuelta a la base de la Península ---
        [-75.0, -70.0],  // Bahía Margarita / Base Península
        [-65.0, -66.0],  // Subiendo por el Oeste
        [-60.0, -64.0],  // Archipiélago Palmer
        [-57.0, -63.3]
    ]
    };

    // Colores para cada continente (un solo color por continente)
    const continentColors = {
        northAmerica: 0x4ade80,  // Verde claro
        southAmerica: 0xbbfee5,  // Verde claro
        europe: 0x60a5fa,        // Azul claro
        africa: 0xfbbf24,        // Amarillo/Dorado
        asia: 0xf87171,          // Rojo claro
        australia: 0xc084fc,     // Púrpura
        antarctica: 0xffffff     // Blanco
    };

    // Crear contornos de todos los continentes (un solo color cada uno)
    Object.keys(worldMap).forEach(function(continent) {
        const outline = createOutline(worldMap[continent], continentColors[continent], 5.04);
        earth.add(outline);
    });

    // ==========================================
    // POLÍGONO DE BOLIVIA CON DEGRADÉ ROJO-AMARILLO-VERDE
    // ==========================================
    const boliviaCoords = [
        [-65.78248, -9.74263], [-65.80960, -9.76523], [-65.87558, -9.79406],
        [-65.91818, -9.76567], [-65.94920, -9.76533], [-65.97259, -9.80564],
        [-66.00584, -9.79833], [-66.08621, -9.79413], [-66.12291, -9.79215],
        [-66.19273, -9.81833], [-66.26911, -9.83563], [-66.34711, -9.83823],
        [-66.42495, -9.87325], [-66.51844, -9.87899], [-66.57883, -9.89099],
        [-66.62811, -9.93596], [-66.63439, -9.92860], [-66.69471, -9.97295],
        [-66.76401, -10.00195], [-66.83835, -10.06981], [-66.88659, -10.10352],
        [-66.98235, -10.18998], [-67.02169, -10.25483], [-67.15727, -10.32820],
        [-67.21067, -10.32151], [-67.31799, -10.32040], [-67.41667, -10.38778],
        [-67.55782, -10.49599], [-67.68495, -10.63188], [-67.71341, -10.70811],
        [-67.82395, -10.65092], [-67.97332, -10.65801], [-68.10598, -10.72154],
        [-68.19385, -10.85938], [-68.32500, -11.00818], [-68.53858, -11.09675],
        [-68.72205, -11.10676], [-68.96100, -10.99501], [-69.24417, -10.94132],
        [-69.56582, -10.95786], [-68.65792, -12.52159], [-68.73961, -12.63634],
        [-68.80666, -12.76824], [-68.87366, -12.93906], [-68.86561, -13.11136],
        [-68.85740, -13.20029], [-68.88514, -13.39459], [-68.95352, -13.60495],
        [-69.06273, -13.66866], [-68.92064, -13.82069], [-68.97235, -13.96664],
        [-68.85059, -14.13503], [-68.83070, -14.20672], [-69.22210, -14.58496],
        [-69.36130, -14.95232], [-69.28914, -15.08167], [-69.13252, -15.24382],
        [-69.30884, -15.49801], [-69.09489, -16.22443], [-68.97604, -16.43610],
        [-69.19087, -16.79395], [-69.32427, -16.96493], [-69.59262, -17.21009],
        [-69.39961, -17.67007], [-69.29763, -17.94271], [-69.05169, -18.31176],
        [-68.96648, -18.94659], [-68.48403, -19.34244], [-68.62721, -19.78486],
        [-68.45189, -20.64864], [-68.06307, -21.85279], [-67.87691, -22.82077],
        [-67.58535, -22.90559], [-66.78515, -22.41721], [-66.32236, -22.08730],
        [-66.24171, -21.79144], [-65.77132, -22.09557], [-65.09316, -22.08435],
        [-64.77540, -22.17664], [-64.53936, -22.28236], [-64.39505, -22.68616],
        [-64.33058, -22.82111], [-64.24454, -22.58074], [-64.12131, -22.38417],
        [-64.00754, -22.16266], [-63.94342, -22.03287], [-63.68480, -22.04542],
        [-62.76660, -22.16690], [-60.75868, -19.48075], [-58.44773, -19.67577],
        [-58.04036, -20.08641], [-57.71023, -18.97994], [-57.45443, -18.23102],
        [-57.71900, -17.83740], [-57.97413, -17.50652], [-58.18963, -17.39216],
        [-58.39689, -17.18666], [-58.46787, -16.88269], [-58.46576, -16.76104],
        [-58.34286, -16.46231], [-58.55586, -16.31750], [-59.25293, -16.28923],
        [-59.87241, -16.27291], [-60.21668, -15.66745], [-60.26991, -14.66325],
        [-60.39894, -14.41337], [-60.44347, -13.92102], [-60.57886, -13.74699],
        [-60.76954, -13.66619], [-60.96679, -13.53610], [-61.13254, -13.52422],
        [-61.38326, -13.51950], [-61.73065, -13.51630], [-62.10958, -13.22355],
        [-62.43096, -13.10564], [-62.78804, -13.00128], [-63.02020, -12.79554],
        [-63.36151, -12.65856], [-63.68408, -12.45345], [-63.89922, -12.48082],
        [-64.30854, -12.45751], [-64.61528, -12.21460], [-64.81588, -12.10477],
        [-65.04374, -11.88569], [-65.25747, -11.69921], [-65.24620, -11.51456],
        [-65.31556, -11.31427], [-65.33699, -11.18607], [-65.28679, -11.05061],
        [-65.34893, -10.74653], [-65.39581, -10.45843], [-65.30800, -10.16449],
        [-65.29158, -9.84045], [-65.59837, -9.84384], [-65.70985, -9.76751]
    ];

    // Crear polígono de Bolivia con degradé
    const boliviaPolygon = createGradientPolygon(boliviaCoords, 5.05);
    earth.add(boliviaPolygon);

    // Contorno de Bolivia (línea blanca)
    const boliviaOutline = createOutline(boliviaCoords, 0xffffff, 5.06);
    earth.add(boliviaOutline);

    // ==========================================
    // MARCADOR DE EL ALTO
    // ==========================================
    const elAltoLat = -16.5;
    const elAltoLon = -68.15;

    const markerGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const elAltoMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    const markerPos = latLonToVector3(elAltoLat, elAltoLon, 5.12);
    elAltoMarker.position.copy(markerPos);
    earth.add(elAltoMarker);

    // Anillos pulsantes
    const ringGeometry = new THREE.RingGeometry(0.15, 0.2, 32);
    const ring1Material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.8,
        side: THREE.DoubleSide 
    });
    const ring2Material = new THREE.MeshBasicMaterial({ 
        color: 0xffdd00, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide 
    });
    
    const pulseRing1 = new THREE.Mesh(ringGeometry.clone(), ring1Material);
    const pulseRing2 = new THREE.Mesh(ringGeometry.clone(), ring2Material);
    
    pulseRing1.position.copy(markerPos);
    pulseRing2.position.copy(markerPos);
    
    pulseRing1.lookAt(0, 0, 0);
    pulseRing2.lookAt(0, 0, 0);
    
    earth.add(pulseRing1);
    earth.add(pulseRing2);

    // Atmósfera
    const atmosphereGeometry = new THREE.SphereGeometry(5.3, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    camera.position.z = 14;

    // Variables de animación
    let pulseScale1 = 1;
    let pulseScale2 = 1.5;
// Inclinar el eje de la Tierra
earth.rotation.x = -18 * Math.PI / 180;  // 23.5 grados en radianes
    // Loop de animación
    function animate() {
        requestAnimationFrame(animate);

        // Rotación continua
        earth.rotation.y += 0.004;

        // Anillos pulsantes
        pulseScale1 += 0.015;
        pulseScale2 += 0.015;
        
        if (pulseScale1 > 2.5) pulseScale1 = 1;
        if (pulseScale2 > 2.5) pulseScale2 = 1;

        pulseRing1.scale.set(pulseScale1, pulseScale1, 1);
        ring1Material.opacity = 0.8 * (1 - (pulseScale1 - 1) / 1.5);

        pulseRing2.scale.set(pulseScale2, pulseScale2, 1);
        ring2Material.opacity = 0.6 * (1 - (pulseScale2 - 1) / 1.5);

        renderer.render(scene, camera);
    }

    animate();

    // Manejar resize
    window.addEventListener('resize', function() {
        if (container.offsetWidth === 0) return;
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
}

// ==========================================
// MAPA INTERACTIVO DE BOLIVIA CON LEAFLET
// ==========================================
function initBoliviaMap() {
    const mapContainer = document.getElementById('bolivia-map');
    if (!mapContainer) return;

    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return;
    }

    const map = L.map('bolivia-map', {
        center: [-16.5, -65],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    const projects = [
        {
            name: "El Alto",
            coords: [-16.5, -68.15],
            type: "BASE DE OPERACIONES",
            description: "Ciudad base y residencia. Coordinación de proyectos regionales.",
            isHome: true
        },
        {
            name: "Oruro",
            coords: [-17.9647, -67.1061],
            type: "CATASTRO MINERO",
            description: "Levantamiento catastral y delimitación de concesiones mineras."
        },
        {
            name: "Ixiamas",
            coords: [-13.75, -68.13],
            type: "CONSERVACIÓN AMAZÓNICA",
            description: "Mapeo de cobertura boscosa y monitoreo de deforestación."
        },
        {
            name: "Yungas de La Paz",
            coords: [-16.3, -67.8],
            type: "GESTIÓN DE RIESGOS",
            description: "Análisis de susceptibilidad a deslizamientos."
        },
        {
            name: "Potosí",
            coords: [-19.5836, -65.7531],
            type: "PATRIMONIO TERRITORIAL",
            description: "Cartografía histórica y delimitación de áreas patrimoniales."
        }
    ];

    projects.forEach(function(project) {
        const size = project.isHome ? 16 : 12;
        const color = project.isHome ? '#d4a84b' : '#e07850';
        
        const icon = L.divIcon({
            className: 'custom-marker-icon',
            html: '<div style="' +
                'width: ' + size + 'px;' +
                'height: ' + size + 'px;' +
                'background: ' + color + ';' +
                'border: 3px solid white;' +
                'border-radius: 50%;' +
                'box-shadow: 0 0 15px ' + color + ';' +
                '"></div>',
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });

        const marker = L.marker(project.coords, { icon: icon }).addTo(map);

        const popupContent = 
            '<div style="font-family: Space Grotesk, sans-serif; min-width: 180px;">' +
                '<div style="font-family: DM Mono, monospace; font-size: 0.7rem; color: #e07850; letter-spacing: 1px; margin-bottom: 5px;">' + 
                    project.type + 
                '</div>' +
                '<div style="font-family: Playfair Display, serif; font-size: 1.1rem; margin-bottom: 8px; color: #f5f0e6;">' + 
                    project.name + 
                '</div>' +
                '<div style="font-size: 0.85rem; opacity: 0.8; line-height: 1.5; color: #f5f0e6;">' + 
                    project.description + 
                '</div>' +
                '<div style="font-family: DM Mono, monospace; font-size: 0.65rem; margin-top: 8px; color: #d4a84b;">' + 
                    project.coords[0].toFixed(4) + '°, ' + project.coords[1].toFixed(4) + '°' +
                '</div>' +
            '</div>';

        marker.bindPopup(popupContent);
    });

    const elAltoCoords = projects[0].coords;
    projects.slice(1).forEach(function(project) {
        L.polyline([elAltoCoords, project.coords], {
            color: '#d4a84b',
            weight: 1,
            opacity: 0.3,
            dashArray: '5, 10'
        }).addTo(map);
    });

    const locationItems = document.querySelectorAll('.project-locations-list li');
    locationItems.forEach(function(item, index) {
        item.addEventListener('click', function() {
            const project = projects[index];
            if (project) {
                map.flyTo(project.coords, 10, { duration: 1.5 });
            }
        });
    });
}

// ==========================================
// ANIMACIONES DE SCROLL
// ==========================================
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    function checkReveal() {
        const windowHeight = window.innerHeight;
        
        reveals.forEach(function(el) {
            const revealTop = el.getBoundingClientRect().top;
            const revealPoint = 150;
            
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    checkReveal();
}

// ==========================================
// COORDENADAS ANIMADAS
// ==========================================
function initAnimatedCoords() {
    const latEl = document.getElementById('lat');
    const longEl = document.getElementById('long');
    
    if (!latEl || !longEl) return;

    setInterval(function() {
        const latVar = (Math.random() - 0.5) * 0.0002;
        const lonVar = (Math.random() - 0.5) * 0.0002;
        
        latEl.textContent = (-16.5000 + latVar).toFixed(4) + '°';
        longEl.textContent = (-68.1500 + lonVar).toFixed(4) + '°';
    }, 100);
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
