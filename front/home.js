let server = "http://127.0.0.1:1337";

function onLoad() {
  initPosts();
  let url = new URL(window.location.href);
  let tab = url.searchParams.get("tab");
  if (tab === "home") {
    document.getElementById("home-tab").click();
    return;
  }
  if (tab === "data") {
    document.getElementById("data-tab").click();
    return;
  }
}

function initPosts() {
  console.log(document.cookie);
  fetch(server + "/api/post", {
    method: "GET",
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
    // body: "email=" + email + "&password=" + pass,
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      data.posts.forEach(element => {
        createPost(element);
      });
    })
    .catch(err => {
      console.log(err);
      // messageP.innerText = data.message;
    });
}

function createPost(post) {
  console.log(post);
  const container = document.getElementById("posts_container");

  // create a new div element
  const postDiv = document.createElement("div");
  console.log(postDiv);
  postDiv.classList.add("card");
  postDiv.classList.add("img-shadow");
  postDiv.id = post.id;
  container.appendChild(postDiv);

  const body = document.createElement("div");
  body.classList.add("card-body");
  postDiv.appendChild(body);

  const titleDiv = document.createElement("h5");
  titleDiv.classList.add("card-title");
  body.appendChild(titleDiv);

  const title = document.createTextNode(post.title);
  titleDiv.appendChild(title);

  const textDiv = document.createElement("p");
  textDiv.classList.add("card-text");
  body.appendChild(textDiv);

  const text = document.createTextNode(post.content);
  textDiv.appendChild(text);

  const footerDiv = document.createElement("div");
  footerDiv.classList.add("card-footer");
  footerDiv.classList.add("text-muted");
  postDiv.appendChild(footerDiv);

  footerDiv.innerHTML += post.created_at;
}

function onSidebarCollapseClicked() {
  var classlist = document.getElementById("sidebar").classList;
  var collapseBtnClasslist = document.getElementById("sidebarCollapse")
    .classList;
  if (classlist.contains("active")) {
    swipeFromRight(classlist, true);
    classlist.remove("active");
    collapseBtnClasslist.add("active");
    return;
  }
  swipeFromRight(classlist, false);
  classlist.add("active");
  collapseBtnClasslist.remove("active");
}

function swipeFromRight(classList, is_reversed) {
  const swipe = "swipeAnimation";
  const swipe_reversed = "swipeAnimationReversed";
  if (is_reversed) {
    classList.add(swipe_reversed);
    setTimeout(() => {
      classList.remove(swipe_reversed);
    }, 400);
    return;
  }
  classList.add(swipe);
  setTimeout(() => {
    classList.remove(swipe);
  }, 400);
}

function toggleNightMode(checkbox) {
  // used theme
  const background_low = "--background-low";
  const background_med = "--background-med";
  const background_high = "--background-high";
  const text_low = "--text-low";
  const text_med = "--text-med";
  const text_high = "--text-high";
  const image_shadow = "--image-shadow";

  const docElementStyle = document.documentElement.style;
  let logos = document.getElementsByClassName("logoImg");

  if (checkbox.checked) {
    docElementStyle.setProperty(background_low, "var(--dark-background-low)");
    docElementStyle.setProperty(background_med, "var(--dark-background-med)");
    docElementStyle.setProperty(background_high, "var(--dark-background-high)");
    docElementStyle.setProperty(text_low, "var(--dark-text-low)");
    docElementStyle.setProperty(text_med, "var(--dark-text-med)");
    docElementStyle.setProperty(text_high, "var(--dark-text-high)");
    docElementStyle.setProperty(image_shadow, "var(--white-image-shadow)");

    logos[0].classList.add("disabledLogo");
    logos[1].classList.remove("disabledLogo");
    return;
  }
  docElementStyle.setProperty(background_low, "var(--light-background-low)");
  docElementStyle.setProperty(background_med, "var(--light-backgrounf-med)");
  docElementStyle.setProperty(background_high, "var(--light-background-high)");
  docElementStyle.setProperty(text_low, "var(--light-text-low)");
  docElementStyle.setProperty(text_med, "var(--light-text-med)");
  docElementStyle.setProperty(text_high, "var(--light-text-high)");
  docElementStyle.setProperty(image_shadow, "var(--black-image-shadow)");

  logos[1].classList.add("disabledLogo");
  logos[0].classList.remove("disabledLogo");
}

let tabs = document.getElementById("nav-tabs");
tabs.addEventListener("click", onTabClicked);
let pageFooter = document.getElementById("pageFooter");
pageFooter.addEventListener("click", onTabClicked);

function onTabClicked(event) {
  let tabs = document.getElementsByClassName("tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  let tabContent = document.getElementsByClassName("tabContent");
  for (let i = 0; i < tabContent.length; i++) {
    tabContent[i].classList.remove("show");
  }
  let tabID = event.target.id;
  let footerID;
  if (tabID == "f-home-tab" || tabID == "home-tab") {
    tabID = "home-tab";
    footerID = "f-home-tab";
  } else if (tabID == "f-data-tab" || tabID == "data-tab") {
    tabID = "data-tab";
    footerID = "f-data-tab";
  }

  let contentID = tabID + "-content";

  document.getElementById(contentID).classList.add("show");
  document.getElementById(contentID).classList.add("in");
  document.getElementById(tabID).classList.add("active");
  document.getElementById(footerID).classList.add("active");
}

function onSignIn() {
  location.replace("./sign_in_up.html?tab=signin");
}

function onSignUp() {
  location.replace("./sign_in_up.html?tab=signup");
}
