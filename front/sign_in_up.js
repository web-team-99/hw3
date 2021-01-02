let tabs = document.getElementById("tabs");
tabs.addEventListener("click", onTabsClicked);

function onTabsClicked(event) {
  let i, tabcontents, tabs;

  tabcontents = document.getElementsByClassName("form");
  for (i = 0; i < tabcontents.length; i++) {
    tabcontents[i].classList.remove("show");
  }

  tabs = document.getElementsByClassName("tab");
  for (i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
    tabs[i].classList.remove("bg-light");
  }

  let formID = event.target.id + "-form";
  document.getElementById(formID).classList.add("show");
  event.target.classList.add("active");
  event.target.classList.add("bg-light");
}

function onLoad() {
  let urlString = window.location.href;
  let url = new URL(urlString);
  let tabName = url.searchParams.get("tab");
  if (tabName === "signin") document.getElementById("signin").click();
}

function onBack() {
  location.replace("./home.html?tab=home");
}

function signup(email, pass) {
  location.replace("./home.html?tab=home");
}

function signin(email, pass) {
  location.replace("./home.html?tab=home");
}

function signupValidate() {
  let form = document.getElementById("signup-form");
  let email = form.email.value;
  let pass = form.password.value;
  let pass2 = form.confirm.value;
  let policy = form.policy.checked;
  let message;
  let submit;
  if (policy) {
    if (ValidateEmail(email)) {
      if (pass.trim() != "") {
        if (pass == pass2) {
          console.log("ok");
          signup(email, pass);
          return;
        } else {
          message = "رمز عبور و تکرار آن باید مطابق هم باشند";
          form.confirm.focus();
        }
      } else {
        message = "لطفا رمز عبور را وارد کنید";
        form.password.focus();
      }
    } else {
      message = "لطفا آدرس ایمیل را درست وارد کنید";
      form.email.focus();
    }
  } else {
    message = "برای ثبت نام لازم است که قوانین و شرایط را پذیرا باشید";
    form.policy.focus();
  }
  submit = document.getElementById("signup_submit");
  submit.classList.add("shake");
  setTimeout(() => {
    submit.classList.remove("shake");
  }, 500);
  let alert = document.getElementById("signup_alert");
  let messageP = document.getElementById("signup_message");
  messageP.innerText = message;
  alert.classList.add("show-alert");
}

function signinValidate() {
  let form = document.getElementById("signin-form");
  let email = form.email.value;
  let pass = form.password.value;
  let message;
  let submit;
  if (ValidateEmail(email)) {
    if (pass.trim() != "") {
      console.log("ok");
      signin(email, pass);
      return;
    } else {
      message = "لطفا رمز عبور را وارد کنید";
      form.password.focus();
    }
  } else {
    message = "لطفا آدرس ایمیل را درست وارد کنید";
    form.email.focus();
  }
  submit = document.getElementById("signin_submit");
  submit.classList.add("shake");
  setTimeout(() => {
    submit.classList.remove("shake");
  }, 500);
  let alert = document.getElementById("signin_alert");
  let messageP = document.getElementById("signin_message");
  messageP.innerText = message;
  alert.classList.add("show-alert");
}

function ValidateEmail(email) {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(mailformat)) {
    return true;
  } else {
    return false;
  }
}

function onCloseClicked() {
  let alerts = document.getElementsByClassName("alert-div");
  for (alert of alerts) {
    alert.classList.add("close-alert");
    setTimeout(
      a => {
        a.classList.remove("show-alert");
        a.classList.remove("close-alert");
      },
      450,
      alert
    );
  }
}
