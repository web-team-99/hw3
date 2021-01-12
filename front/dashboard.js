// let server = "http://127.0.0.1:1337";
let server = "http://192.168.1.105:1337";

function onCreatePostClicked() {
  createPostTitle = document.getElementById("create_post_title");
  createPostDescription = document.getElementById("create_post_description");
  console.log(createPostTitle.value);
  createPost(createPostTitle.value, createPostDescription.value);
}

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
  fetch(server + "/api/admin/post/crud", {
    method: "GET",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "auth-token": document.cookie.split("=")[1] }
    // body: "email=" + email + "&password=" + pass,
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      data.posts.forEach(element => {
        createPostDiv(element);
      });
    })
    .catch(err => {
      console.log(err);
      // messageP.innerText = data.message;
    });
}

function createPostDiv(post) {
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

  const removeBtn = document.createElement("a");
  removeBtn.classList.add("btn");
  removeBtn.classList.add("btn-danger");
  removeBtn.classList.add("m1");
  removeBtn.onclick = onRemove;
  removeBtn.innerHTML += "حذف"
  body.appendChild(removeBtn);

  const editBtn = document.createElement("a");
  editBtn.classList.add("btn");
  editBtn.classList.add("btn-secondary");
  removeBtn.classList.add("m1");
  editBtn.onclick = onEdit;
  editBtn.innerHTML += "ویرایش"
  body.appendChild(editBtn);

  const footerDiv = document.createElement("div");
  footerDiv.classList.add("card-footer");
  postDiv.appendChild(footerDiv);

  const footer = document.createElement("small");
  footer.classList.add("text-muted");
  footer.innerHTML += post.created_at;
  footerDiv.appendChild(footer);
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

function onLogo() {
  location.replace("./home.html?tab=home");
}

//api methods

function createPost(title, description) {
  token = document.cookie.split("=")[1];
  console.log(token);
  fetch(server + "/api/admin/post/crud", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "auth-token": token,
    },
    body: "title=" + title + "&content=" + description,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
}

function onRemove(event){
  console.log("on remove");
  let id = event.path[2].id;
  console.log(id);
  token = document.cookie.split("=")[1];
  console.log(token);
  fetch(server + "/api/admin/post/crud/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "auth-token": token,
    },
    // body: "title=" + title + "&content=" + description,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
}

function onEdit(event){
  console.log("on edit");
  console.log(event);
  let id = event.path[2].id;
  let title = prompt("عنوان", "عنوان خالی");
  let description = prompt("توضیحات", "بدون توضیحات");
  console.log(id);
  token = document.cookie.split("=")[1];
  console.log(token);
  fetch(server + "/api/admin/post/crud/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "auth-token": token,
    },
    body: "title=" + title + "&content=" + description,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
}
