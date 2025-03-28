let video;
let faceMesh;
let detections = [];

let backImg, frontImg;
let eyeImages = [], noseImages = [], mouthImages = [];

let selectedLeftEyeImage, selectedRightEyeImage;
let selectedNoseImage, selectedMouthImage;

let baseImgSize = 80;
let offsetY = -30;

function preload() {
  backImg = loadImage("back.png");
  frontImg = loadImage("front.png");

  // e
  for (let i = 1; i <= 34; i++) {
    let imgPath = `./${i}.png`;
    loadImage(
      imgPath,
      (img) => {
        console.log(1);
        eyeImages.push(img);
      },
      (err) => console.error(2)
    );
  }

//n
  for (let i = 1; i <= 27; i++) {
    let imgPath = `nose/${i}.png`;
    loadImage(
      imgPath,
      (img) => {
        console.log(`👃 Loaded: ${imgPath}`);
        noseImages.push(img);
      },
      (err) => console.error(3)
    );
  }

  // m
  for (let i = 1; i <= 28; i++) {
    let imgPath = `mouth/${i}.png`;
    loadImage(
      imgPath,
      (img) => {
        console.log(`👄 Loaded: ${imgPath}`);
        mouthImages.push(img);
      },
      (err) => console.error(4)
    );
  }
}

function setup() {
  let canvas = createCanvas(800, 600);
  let container = select("#canvasContainer");

  if (container) {
    canvas.parent(container);
  } else {
    console.error(5);
  }

  video = createCapture(VIDEO, () => {
    console.log(6);
    loadFaceMesh();
  });
  video.size(800, 600);
  video.hide();
}

async function loadFaceMesh() {
  faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true });

  faceMesh.onResults(
    (results) => (detections = results.multiFaceLandmarks || [])
  );

  await faceMesh.initialize();
  console.log(6);

  eyeImages = eyeImages.filter((img) => img);
  noseImages = noseImages.filter((img) => img);
  mouthImages = mouthImages.filter((img) => img);

  if (eyeImages.length < 2 || noseImages.length < 1 || mouthImages.length < 1) {
    console.error(7);
    return;
  }

  selectedLeftEyeImage = random(eyeImages);
  selectedRightEyeImage = random(eyeImages);
  selectedNoseImage = random(noseImages);
  selectedMouthImage = random(mouthImages);

  detectFaces();
}

async function detectFaces() {
  if (!video.elt || !faceMesh) return;

  try {
    await faceMesh.send({ image: video.elt });
  } catch (err) {
    console.error(8);
  }

  setTimeout(detectFaces, 100);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
  if (backImg) image(backImg, 0, 0, width, height);

  if (
    detections.length > 0 &&
    selectedLeftEyeImage &&
    selectedRightEyeImage &&
    selectedNoseImage &&
    selectedMouthImage
  ) {
    let face = detections[0];

    //eyesss
    let leftEyeX = face[263].x * width;
    let leftEyeY = face[263].y * height + offsetY;
    let rightEyeX = face[33].x * width;
    let rightEyeY = face[33].y * height + offsetY;
    let eyeDistance = dist(leftEyeX, leftEyeY, rightEyeX, rightEyeY);
    let imgSize = baseImgSize + eyeDistance * 0.6;

    // eyez
    let aspectLeft = selectedLeftEyeImage.width / selectedLeftEyeImage.height;
    image(
      selectedLeftEyeImage,
      leftEyeX - imgSize / 2,
      leftEyeY - (imgSize / aspectLeft) / 2,
      imgSize,
      imgSize / aspectLeft
    );

    // eye
    let aspectRight = selectedRightEyeImage.width / selectedRightEyeImage.height;
    push();
    translate(rightEyeX, rightEyeY);
    scale(-1, 1);
    image(
      selectedRightEyeImage,
      -imgSize / 2,
      -(imgSize / aspectRight) / 2,
      imgSize,
      imgSize / aspectRight
    );
    pop();

    // nose
    let noseX = face[1].x * width;
    let noseY = face[1].y * height - 30;
    let noseSize = baseImgSize;
    let noseAspect = selectedNoseImage.width / selectedNoseImage.height;
    image(
      selectedNoseImage,
      noseX - noseSize / 2,
      noseY - (noseSize / noseAspect) / 2,
      noseSize,
      noseSize / noseAspect
    );

    // m
    let mouthX = face[13].x * width;
    let mouthY = face[13].y * height;
    let mouthScale = 2;
    let mouthSize = baseImgSize * mouthScale;
    let mouthAspect = selectedMouthImage.width / selectedMouthImage.height;
    image(
      selectedMouthImage,
      mouthX - mouthSize / 2,
      mouthY - (mouthSize / mouthAspect) / 2,
      mouthSize,
      mouthSize / mouthAspect
    );

  
    // fill(255, 0, 0);
    // ellipse(noseX, noseY, 5, 5);
    // fill(255, 100, 255);
    // ellipse(mouthX, mouthY, 5, 5);
  }

  if (frontImg) image(frontImg, 0, 0, width, height);
}
