// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-menu-mobile");
if (buttonMenuMobile) {
  const menu = document.querySelector(".header .inner-menu");

  // Click vào button mở menu
  buttonMenuMobile.addEventListener("click", () => {
    menu.classList.add("active");
  });

  // Click vào overlay đóng menu
  const overlay = menu.querySelector(".inner-overlay");
  if (overlay) {
    overlay.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  }

  // Click vào icon down mở sub menu
  const listButtonSubMenu = menu.querySelectorAll("ul > li > i");
  listButtonSubMenu.forEach((button) => {
    button.addEventListener("click", () => {
      button.parentNode.classList.toggle("active");
    });
  });
}
// End Menu Mobile

// Box Address Section 1
const boxAddressSection1 = document.querySelector(
  ".section-1 .inner-form .inner-box.inner-address"
);
if (boxAddressSection1) {
  // Ẩn/hiện box suggest
  const input = boxAddressSection1.querySelector(".inner-input");

  input.addEventListener("focus", () => {
    boxAddressSection1.classList.add("active");
  });

  input.addEventListener("blur", () => {
    boxAddressSection1.classList.remove("active");
  });

  // Sự kiện click vào từng item
  const listItem = boxAddressSection1.querySelectorAll(
    ".inner-suggest-list .inner-item"
  );
  listItem.forEach((item) => {
    item.addEventListener("mousedown", () => {
      const title = item.querySelector(".inner-item-title").innerHTML.trim();
      if (title) {
        input.value = title;
      }
    });
  });
}
// End Box Address Section 1

// Box User Section 1
const boxUserSection1 = document.querySelector(
  ".section-1 .inner-form .inner-box.inner-user"
);
if (boxUserSection1) {
  // Hiện box quantity
  const input = boxUserSection1.querySelector(".inner-input");

  input.addEventListener("focus", () => {
    boxUserSection1.classList.add("active");
  });

  // Ẩn box quantity
  document.addEventListener("click", (event) => {
    // Kiểm tra nếu click không nằm trong khối `.inner-box.inner-user`
    if (!boxUserSection1.contains(event.target)) {
      boxUserSection1.classList.remove("active");
    }
  });

  // Thêm số lượng vào ô input
  const updateQuantityInput = () => {
    const listBoxNumber = boxUserSection1.querySelectorAll(
      ".inner-count .inner-number"
    );
    const listNumber = [];
    listBoxNumber.forEach((boxNumber) => {
      const number = parseInt(boxNumber.innerHTML.trim());
      listNumber.push(number);
    });
    const value = `NL: ${listNumber[0]}, TE: ${listNumber[1]}, EB: ${listNumber[2]}`;
    input.value = value;
  };

  // Bắt sự kiện click nút up
  const listButtonUp = boxUserSection1.querySelectorAll(
    ".inner-count .inner-up"
  );
  listButtonUp.forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.parentNode;
      const boxNumber = parent.querySelector(".inner-number");
      const number = parseInt(boxNumber.innerHTML.trim());
      const numberUpdate = number + 1;
      boxNumber.innerHTML = numberUpdate;
      updateQuantityInput();
    });
  });

  // Bắt sự kiện click nút down
  const listButtonDown = boxUserSection1.querySelectorAll(
    ".inner-count .inner-down"
  );
  listButtonDown.forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.parentNode;
      const boxNumber = parent.querySelector(".inner-number");
      const number = parseInt(boxNumber.innerHTML.trim());
      if (number > 0) {
        const numberUpdate = number - 1;
        boxNumber.innerHTML = numberUpdate;
        updateQuantityInput();
      }
    });
  });
}
// End Box User Section 1

// Clock Expire
const clockExpire = document.querySelector("[clock-expire]");
if (clockExpire) {
  const expireDateTimeString = clockExpire.getAttribute("clock-expire");

  // Chuyển đổi chuỗi thời gian thành đối tượng Date
  const expireDateTime = new Date(expireDateTimeString);

  // Hàm cập nhật đồng hồ
  const updateClock = () => {
    const now = new Date();
    const remainingTime = expireDateTime - now; // quy về đơn vị mili giây

    if (remainingTime > 0) {
      const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
      // Tính số ngày, 24 * 60 * 60 * 1000 Tích của các số này = số mili giây trong 1 ngày

      const hours = Math.floor((remainingTime / (60 * 60 * 1000)) % 24);
      // Tính số giờ, 60 * 60 * 1000 Chia remainingTime cho giá trị này để nhận được tổng số giờ.
      // % 24 Lấy phần dư khi chia tổng số giờ cho 24 để chỉ lấy số giờ còn lại trong ngày.

      const minutes = Math.floor((remainingTime / (60 * 1000)) % 60);
      // Tính số phút, 60 * 1000 Chia remainingTime cho giá trị này để nhận được tổng số phút.
      // % 60 Lấy phần dư khi chia tổng số phút cho 60 để chỉ lấy số phút còn lại trong giờ.

      const seconds = Math.floor((remainingTime / 1000) % 60);
      // Tính số giây, 1000 Chia remainingTime cho giá trị này để nhận được tổng số giây.
      // % 60 Lấy phần dư khi chia tổng số giây cho 60 để chỉ lấy số giây còn lại trong phút.

      // Cập nhật giá trị vào thẻ span
      const listBoxNumber = clockExpire.querySelectorAll(".inner-number");
      listBoxNumber[0].innerHTML = `${days}`.padStart(2, "0");
      listBoxNumber[1].innerHTML = `${hours}`.padStart(2, "0");
      listBoxNumber[2].innerHTML = `${minutes}`.padStart(2, "0");
      listBoxNumber[3].innerHTML = `${seconds}`.padStart(2, "0");
    } else {
      // Khi hết thời gian, dừng đồng hồ
      clearInterval(intervalClock);
    }
  };

  // Gọi hàm cập nhật đồng hồ mỗi giây
  const intervalClock = setInterval(updateClock, 1000);
}
// End Clock Expire

// Box Filter
const buttonFilterMobile = document.querySelector(
  ".section-9 .inner-filter-mobile"
);
if (buttonFilterMobile) {
  const boxLeft = document.querySelector(".section-9 .inner-left");
  buttonFilterMobile.addEventListener("click", () => {
    boxLeft.classList.add("active");
  });

  const overlay = document.querySelector(
    ".section-9 .inner-left .inner-overlay"
  );
  overlay.addEventListener("click", () => {
    boxLeft.classList.remove("active");
  });
}
// End Box Filter

// Box Tour Info
const boxTourInfo = document.querySelector(".box-tour-info");
if (boxTourInfo) {
  const buttonReadMore = boxTourInfo.querySelector(".inner-read-more button");
  buttonReadMore.addEventListener("click", () => {
    boxTourInfo.classList.add("active");
  });

  new Viewer(boxTourInfo);
}
// End Box Tour Info

// Khởi tạo AOS
AOS.init();
// Hết Khởi tạo AOS

// Swiper Section 2
const swiperSection2 = document.querySelector(".swiper-section-2");
if (swiperSection2) {
  new Swiper(".swiper-section-2", {
    slidesPerView: 1,
    spaceBetween: 20,
    autoplay: {
      delay: 4000,
    },
    loop: true,
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
    },
  });
}
// End Swiper Section 2

// Swiper Section 3
const swiperSection3 = document.querySelector(".swiper-section-3");
if (swiperSection3) {
  new Swiper(".swiper-section-3", {
    slidesPerView: 1,
    spaceBetween: 20,
    autoplay: {
      delay: 4000,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
    },
  });
}
// End Swiper Section 3

// Swiper Box Images
const boxImages = document.querySelector(".box-images");
if (boxImages) {
  const swiperBoxImagesThumb = new Swiper(".swiper-box-images-thumb", {
    spaceBetween: 5,
    slidesPerView: 4,
    breakpoints: {
      576: {
        spaceBetween: 10,
      },
    },
  });

  const swiperBoxImagesMain = new Swiper(".swiper-box-images-main", {
    spaceBetween: 0,
    thumbs: {
      swiper: swiperBoxImagesThumb,
    },
  });
}
// End Swiper Box Images

// Zoom Box Images Main
const boxImagesMain = document.querySelector(".box-images .inner-images-main");
if (boxImagesMain) {
  new Viewer(boxImagesMain);
}
// End Zoom Box Images Main

// Box Tour Schedule
const boxTourSchedule = document.querySelector(".box-tour-schedule");
if (boxTourSchedule) {
  new Viewer(boxTourSchedule);
}
// End Box Tour Schedule

// Email Form
const emailForm = document.querySelector("#email-form");
if (emailForm) {
  const validation = new JustValidate("#email-form");

  validation
    .addField("#email-input", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email của bạn!",
      },
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng!",
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const dataFinal = { email: email };

      fetch(`/contact/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "success") {
            // setNotificationInSession(data.code, data.message);
            notify.success(data.message);
            emailForm.email.value = "";
          } else {
            notify.error(data.message);
          }
        });
    });
}
// End Email Form

// Coupon Form
const couponForm = document.querySelector("#coupon-form");
if (couponForm) {
  const validation = new JustValidate("#coupon-form");

  validation.onSuccess((event) => {
    const coupon = event.target.coupon.value;
    console.log(coupon);
  });
}
// End Email Form

// Order Form
const orderForm = document.querySelector("#order-form");
if (orderForm) {
  const validation = new JustValidate("#order-form");

  validation
    .addField("#full-name-input", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên!",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Họ tên phải có ít nhất 5 ký tự!",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ tên không được vượt quá 50 ký tự!",
      },
    ])
    .addField("#phone-input", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại!",
      },
      {
        rule: "customRegexp",
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: "Số điện thoại không đúng định dạng!",
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const phone = event.target.phone.value;
      const note = event.target.note.value;
      const method = event.target.method.value;

      console.log(fullName);
      console.log(phone);
      console.log(note);
      console.log(method);
    });

  // List Input Method
  const listInputMethod = orderForm.querySelectorAll("input[name='method']");
  const elementInfoBank = orderForm.querySelector(".inner-info-bank");

  listInputMethod.forEach((inputMethod) => {
    inputMethod.addEventListener("change", () => {
      if (inputMethod.value == "bank") {
        elementInfoBank.classList.add("active");
      } else {
        elementInfoBank.classList.remove("active");
      }
    });
  });
  // End List Input Method
}
// End Order Form

// Box filter
const boxFilter = document.querySelector(".box-filter");
if (boxFilter) {
  const url = new URL(`${window.location.origin}/search`);

  const options = [
    "locationFrom",
    "locationTo",
    "departureDate",
    "stockAdult",
    "stockChildren",
    "stockBaby",
    "price",
  ];

  const button = boxFilter.querySelector(".inner-button");
  button.addEventListener("click", () => {
    for (const option of options) {
      const value = boxFilter.querySelector(`[name="${option}"]`).value;
      if (value) {
        url.searchParams.set(option, value);
      } else {
        url.searchParams.delete(option);
      }
    }
    window.location.href = url.href;
  });

  const currentURL = new URL(window.location.href);
  for (const option of options) {
    const existOption = currentURL.searchParams.get(option);
    if (existOption) {
      boxFilter.querySelector(`[name="${option}"]`).value = existOption;
    }
  }
}
//End Box Filter

//  Form Search
const formSearch = document.querySelector("[form-search]");
if (formSearch) {
  const url = new URL(`${window.location.origin}/search`);

  formSearch.addEventListener("submit", (event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định là load lại trang

    // Điểm đến
    const locationTo = formSearch.locationTo.value;
    if (locationTo) {
      url.searchParams.set("locationTo", locationTo);
    } else {
      url.searchParams.delete("locationTo");
    }
    // Hết Điểm đến

    // Số lượng
    const listQuantity = ["stockAdult", "stockChildren", "stockBaby"];
    for (const item of listQuantity) {
      const element = formSearch.querySelector(`[${item}]`);
      const value = element.innerHTML.trim();
      if (value) {
        url.searchParams.set(item, value);
      } else {
        url.searchParams.delete(item);
      }
    }
    // Hết Số lượng

    // Ngày khởi hành
    const departureDate = formSearch.departureDate.value;
    if (departureDate) {
      url.searchParams.set("departureDate", departureDate);
    } else {
      url.searchParams.delete("departureDate");
    }
    // Hết Ngày khởi hành

    window.location.href = url.href;
  });
}
// End Form Search

const detailedTourBox = document.querySelector(".box-tour-detail ");
if (detailedTourBox) {
  const button = detailedTourBox.querySelector("[button-add-cart]");
  const tourId = button.getAttribute("tour-id");
  const inputQuantityList =
    detailedTourBox.querySelectorAll("[input-quantity]");
  const cart = {};
  cart.tourId = tourId;

  const drawDetailedTourBox = () => {
    let totalPrice = 0;

    inputQuantityList.forEach((input) => {
      const inputQuantity = input.getAttribute("input-quantity");
      let quantity = Number(input.value);
      const min = parseInt(input.getAttribute("min"));
      const max = parseInt(input.getAttribute("max"));
      const price = parseInt(input.getAttribute("data-price"));

      // Giới hạn số lượng
      if (quantity < min) {
        quantity = min;
        input.value = quantity;
        notify.error("Số lượng đang vượt quá ngưỡng");
      }
      if (quantity > max) {
        quantity = max;
        input.value = quantity;
        notify.error("Số lượng đang vượt quá ngưỡng");
      }

      // Cập nhật label
      const quantityLabel = detailedTourBox.querySelector(
        `[label-quantity="${inputQuantity}"]`
      );
      if (quantityLabel) quantityLabel.innerHTML = quantity;

      // Cộng tiền vào tổng
      totalPrice += price * quantity;
    });

    // Cập nhật tổng tiền hiển thị
    const totalPriceElement = detailedTourBox.querySelector("[total-price]");
    if (totalPriceElement) {
      totalPriceElement.innerHTML = totalPrice.toLocaleString("vi-VN");
    }
  };

  let cartLocalStorage = JSON.parse(localStorage.getItem("cart")) || [];
  const existingTour = cartLocalStorage.find(
    (item) => item.tourId === cart.tourId
  );

  if (existingTour) {
    inputQuantityList.forEach((input) => {
      const type = input.getAttribute("input-quantity");
      if (type in existingTour) input.value = existingTour[type] || 0;
    });
  }
  drawDetailedTourBox();

  inputQuantityList.forEach((input) => {
    input.addEventListener("change", drawDetailedTourBox);
  });

  const getCarData = () => {
    const locationFrom = detailedTourBox.querySelector(
      `[name="locationFrom"]`
    ).value;
    cart.locationFrom = locationFrom;
    inputQuantityList.forEach((item) => {
      const input = item.getAttribute(`input-quantity`);
      if (input == "stockAdult") {
        cart.stockAdult = item.value;
      }
      if (input == "stockChildren") {
        cart.stockChildren = item.value;
      }
      if (input == "stockBaby") {
        cart.stockBaby = item.value;
      }
    });
  };

  button.addEventListener("click", () => {
    getCarData();

    if (existingTour) {
      existingTour.stockAdult = cart.stockAdult;
      existingTour.stockChildren = cart.stockChildren;
      existingTour.stockBaby = cart.stockBaby;
      existingTour.locationFrom = cart.locationFrom;
    } else {
      cartLocalStorage.push(cart);
    }

    localStorage.setItem("cart", JSON.stringify(cartLocalStorage));
    window.location.href = "/cart";
  });
}

//Mini cart
const miniCart = document.querySelector("[mini-cart]");
if (miniCart) {
  const cartLength = JSON.parse(localStorage.getItem("cart"));
  miniCart.innerHTML = cartLength.length;
}
//End mini cart

//Page cart
const pageCart = document.querySelector("[page-cart]");
if (pageCart) {
  const cart = localStorage.getItem("cart");
  fetch("/cart/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: cart,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.code == "success") {
        let subTotal = 0;

        const htmlArray = data.cart.map((item) => {
          subTotal +=
            item.priceNewAdult * item.quantityAdult +
            item.priceNewChildren * item.quantityChildren +
            item.priceNewBaby * item.quantityBaby;
          return `
            <div class="inner-tour-item">
              <div class="inner-actions">
                <button class="inner-delete">
                  <i class="fa-solid fa-xmark"></i>
                </button>
                <input class="inner-check" type="checkbox" />
              </div>
              <div class="inner-product">
                <div class="inner-image">
                  <a href="/tour/detail/${item.slug}">
                    <img alt="${item.name}" src="${item.avatar}" />
                  </a>
                </div>
                <div class="inner-content">
                  <div class="inner-title">
                    <a href="/tour/detail/${item.slug}">${item.name}</a>
                  </div>
                  <div class="inner-meta">
                    <div class="inner-meta-item">
                      Ngày Khởi Hành: <b>${item.departureDate}</b>
                    </div>
                    <div class="inner-meta-item">
                      Khởi Hành Tại: <b>${item.cityName}</b>
                    </div>
                  </div>
                </div>
              </div>
              <div class="inner-quantity">
                <label class="inner-label">Số Lượng Hành Khách</label>
                <div class="inner-list">
                  <div class="inner-item">
                    <div class="inner-item-label">Người lớn:</div>
                    <div class="inner-item-input">
                      <input value="${item.quantityAdult}" min="0" max="${
            item.stockAdult
          }" type="number" />
                    </div>
                    <div class="inner-item-price">
                      <span>${item.quantityAdult}</span>
                      <span>x</span>
                      <span class="inner-highlight">
                        ${item.priceNewAdult.toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div class="inner-item">
                    <div class="inner-item-label">Trẻ em:</div>
                    <div class="inner-item-input">
                      <input value="${item.quantityChildren}" min="0" max="${
            item.stockChildren
          }" type="number" />
                    </div>
                    <div class="inner-item-price">
                      <span>${item.quantityChildren}</span>
                      <span>x</span>
                      <span class="inner-highlight">
                        ${item.priceNewChildren.toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div class="inner-item">
                    <div class="inner-item-label">Em bé:</div>
                    <div class="inner-item-input">
                      <input value="${item.quantityBaby}" min="0" max="${
            item.stockBaby
          }" type="number" />
                    </div>
                    <div class="inner-item-price">
                      <span>${item.quantityBaby}</span>
                      <span>x</span>
                      <span class="inner-highlight">
                        ${item.priceNewBaby.toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });

        let discount = 0;
        let total = subTotal - discount;

        const elementCartList = document.querySelector("[cart-list]");
        elementCartList.innerHTML = htmlArray.join("");

        const elementCartSubTotal = document.querySelector("[cart-sub-total]");
        const elementCartTotal = document.querySelector("[cart-total]");
        elementCartSubTotal.innerHTML = subTotal.toLocaleString("vi-VN");
        elementCartTotal.innerHTML = total.toLocaleString("vi-VN");
      } else {
        localStorage.setItem("cart", JSON.stringify([]));
      }
    });
}
//end page cart
