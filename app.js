// ITEM CONTROLLER
const itemCtrl = (() => {

  const Item = function (id, name, money) {
    this.id = id;
    this.name = name;
    this.money = money;
  };

  const data = {
    items: [
      { id: 0, name: "Clothes", money: 10000 },
      { id: 1, name: "Food", money: 5000 },
      { id: 2, name: "Bike Service", money: 3000 },
    ],
    currentItem: null,
    totalMoney: 0,
  };

  return {

    getItems: () => data.items,

    addItem(name, money) {
      const id = data.items.length ? data.items[data.items.length - 1].id + 1 : 0;

      money = Number(money);
      const newItem = new Item(id, name, money);
      data.items.push(newItem);
      return newItem;
    },

    updateItem(name, money) {
      money = Number(money);

      data.currentItem.name = name;
      data.currentItem.money = money;

      return data.currentItem;
    },

    deleteItem(id) {
      data.items = data.items.filter(item => item.id !== id);
    },

    clearAllItems() {
      data.items = [];
    },

    setCurrentItem(item) {
      data.currentItem = item;
    },

    getCurrentItem() {
      return data.currentItem;
    },

    getTotalMoney() {
      data.totalMoney = data.items.reduce((total, item) => total + item.money, 0);
      return data.totalMoney;
    },

    getItemByID(id) {
      return data.items.find(item => item.id === id);
    }
  };

})();


// UI CONTROLLER
const UICtrl = (() => {

  return {

    getInput: () => ({
      name: document.querySelector("#name").value,
      money: document.querySelector("#money").value
    }),

    populateList(items) {
      document.querySelector("#item-list").innerHTML = items.map(item => `
        <li class="collection-item" id="item-${item.id}">
          <strong>${item.name}</strong> : 
          <em>${item.money} Rs</em>
          <a href="#" class="secondary-content">
            <i class="fa-solid fa-pencil edit-item"></i>
          </a>
        </li>
      `).join("");
    },

    addListItem(item) {
      const li = document.createElement("li");
      li.className = "collection-item";
      li.id = `item-${item.id}`;
      li.innerHTML = `
        <strong>${item.name}</strong> : 
        <em>${item.money} Rs</em>
        <a href="#" class="secondary-content">
          <i class="fa-solid fa-pencil edit-item"></i>
        </a>
      `;
      document.querySelector("#item-list").appendChild(li);
    },

    updateListItem(item) {
      const el = document.querySelector(`#item-${item.id}`);
      el.innerHTML = `
        <strong>${item.name}</strong> : 
        <em>${item.money} Rs</em>
        <a href="#" class="secondary-content">
          <i class="fa-solid fa-pencil edit-item"></i>
        </a>
      `;
    },

    deleteListItem(id) {
      document.querySelector(`#item-${id}`).remove();
    },

    clearInputs() {
      document.querySelector("#name").value = "";
      document.querySelector("#money").value = "";
    },

    showTotalMoney(total) {
      document.querySelector(".total").innerText = total;
    },

    addItemToForm(item) {
      document.querySelector("#name").value = item.name;
      document.querySelector("#money").value = item.money;
    },

    showEditState() {
      document.querySelector(".add-btn").style.display = "none";
      document.querySelector(".update-btn").style.display = "inline";
      document.querySelector(".delete-btn").style.display = "inline";
      document.querySelector(".back-btn").style.display = "inline";
    },

    clearEditState() {
      document.querySelector(".add-btn").style.display = "inline";
      document.querySelector(".update-btn").style.display = "none";
      document.querySelector(".delete-btn").style.display = "none";
      document.querySelector(".back-btn").style.display = "none";
    },

    clearList() {
      document.querySelector("#item-list").innerHTML = "";
    }
  };

})();


// APP CONTROLLER
const App = (() => {

  const loadEventListeners = () => {
    document.querySelector(".add-btn").addEventListener("click", addItem);
    document.querySelector("#item-list").addEventListener("click", editItem);
    document.querySelector(".update-btn").addEventListener("click", updateItem);
    document.querySelector(".delete-btn").addEventListener("click", deleteItem);
    document.querySelector(".back-btn").addEventListener("click", back);
    document.querySelector(".clear-btn").addEventListener("click", clearAll);
  };

  const addItem = e => {
    e.preventDefault();

    const input = UICtrl.getInput();
    if (!input.name || !input.money) return alert("Fill fields");

    const newItem = itemCtrl.addItem(input.name, input.money);
    UICtrl.addListItem(newItem);
    UICtrl.showTotalMoney(itemCtrl.getTotalMoney());
    UICtrl.clearInputs();
  };

  const editItem = e => {
    e.preventDefault();

    if (!e.target.classList.contains("edit-item")) return;

    const id = +e.target.parentElement.parentElement.id.split("-")[1];
    const item = itemCtrl.getItemByID(id);

    itemCtrl.setCurrentItem(item);
    UICtrl.addItemToForm(item);
    UICtrl.showEditState();
  };

  const updateItem = e => {
    e.preventDefault();

    const input = UICtrl.getInput();
    const updated = itemCtrl.updateItem(input.name, input.money);

    UICtrl.updateListItem(updated);
    UICtrl.showTotalMoney(itemCtrl.getTotalMoney());
    UICtrl.clearInputs();
    UICtrl.clearEditState();
  };

  const deleteItem = e => {
    e.preventDefault();

    const item = itemCtrl.getCurrentItem();
    itemCtrl.deleteItem(item.id);
    UICtrl.deleteListItem(item.id);
    UICtrl.showTotalMoney(itemCtrl.getTotalMoney());
    UICtrl.clearInputs();
    UICtrl.clearEditState();
  };

  const back = e => {
    e.preventDefault();
    UICtrl.clearInputs();
    UICtrl.clearEditState();
  };

  const clearAll = e => {
    e.preventDefault();
    itemCtrl.clearAllItems();
    UICtrl.clearList();
    UICtrl.showTotalMoney(itemCtrl.getTotalMoney());
    UICtrl.clearInputs();
    UICtrl.clearEditState();
  };

  return {
    start() {
      UICtrl.clearEditState();
      UICtrl.populateList(itemCtrl.getItems());
      UICtrl.showTotalMoney(itemCtrl.getTotalMoney());
      loadEventListeners();
    }
  };

})();

App.start();
