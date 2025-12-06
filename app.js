

onst storageCtrl = (function(){

    const baseURL = "https://6933d59f4090fe3bf01e1f49.mockapi.io/transation/transation";

    return {

        async getItems(){
            const res = await fetch(baseURL);
            return await res.json();
        },

        async storeItem(item){
            const res = await fetch(baseURL, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(item)
            });
            return await res.json();
        },

        async updateItem(id, item){
            const res = await fetch(`${baseURL}/${id}`, {
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(item)
            });
            return await res.json();
        },

        async deleteItem(id){
            await fetch(`${baseURL}/${id}`, { method:"DELETE" });
        },

        async clearAll(){
            const list = await fetch(baseURL).then(r => r.json());
            for(let i of list){
                await fetch(`${baseURL}/${i.id}`, { method:"DELETE" });
            }
        }

    };
})();


// ---------------------------------------------------------
// ITEM CONTROLLER
// ---------------------------------------------------------
const itemCtrl = (function(){

    const data = {
        items: [],
        totalMoney: 0,
        currentItem: null
    };

    return {

        loadFromAPI: async function(){
            const items = await storageCtrl.getItems();
            data.items = items.map(i => ({
                id: i.id,
                name: i.name,
                money: parseInt(i.money)
            }));
        },

        getItem(){
            return data.items;
        },

        async addItem(name, money){
            money = parseInt(money);

            const newObj = { name, money };
            const saved = await storageCtrl.storeItem(newObj);

            const newItem = {
                id: saved.id,
                name: saved.name,
                money: parseInt(saved.money)
            };

            data.items.push(newItem);
            return newItem;
        },

        async updateItem(name, money){
            money = parseInt(money);

            const current = data.currentItem;

            current.name = name;
            current.money = money;

            await storageCtrl.updateItem(current.id, current);

            return current;
        },

        async deleteItem(id){
            data.items = data.items.filter(item => item.id !== id);
            await storageCtrl.deleteItem(id);
        },

        async clearAllItems(){
            data.items = [];
            await storageCtrl.clearAll();
        },

        getItemByID(id){
            return data.items.find(item => item.id === id);
        },

        setCurrentItem(item){
            data.currentItem = item;
        },

        getCurrentItem(){
            return data.currentItem;
        },

        getTotalMoney(){
            let total = 0;
            data.items.forEach(item => total += item.money);
            data.totalMoney = total;
            return total;
        }

    };
})();


// ---------------------------------------------------------
// UI CONTROLLER
// ---------------------------------------------------------
const UICtrl = (function(){

    return {

        populateItemList(items){
            let html = "";
            items.forEach(item => {
                html += `
                <li class="collection-item" id="item-${item.id}">
                    <strong>${item.name}</strong> :
                    <em>${item.money} Rs</em>
                    <a href="#" class="secondary-content">
                        <i class="fa-solid fa-pencil edit-item"></i>
                    </a>
                </li>`;
            });
            document.querySelector("#item-list").innerHTML = html;
        },

        getItemInput(){
            return {
                name: document.querySelector("#name").value,
                money: document.querySelector("#money").value
            };
        },

        addListItem(item){
            const li = document.createElement("li");
            li.className = "collection-item";
            li.id = `item-${item.id}`;
            li.innerHTML = `
                <strong>${item.name}</strong> :
                <em>${item.money} Rs</em>
                <a href="#" class="secondary-content">
                    <i class="fa-solid fa-pencil edit-item"></i>
                </a>`;
            document.querySelector("#item-list").appendChild(li);
        },

        updateListItem(item){
            const li = document.getElementById(`item-${item.id}`);
            li.innerHTML = `
                <strong>${item.name}</strong> :
                <em>${item.money} Rs</em>
                <a href="#" class="secondary-content">
                    <i class="fa-solid fa-pencil edit-item"></i>
                </a>`;
        },

        deleteListItem(id){
            const li = document.getElementById(`item-${id}`);
            if(li) li.remove();
        },

        deleteAllUI(){
            document.querySelector("#item-list").innerHTML = "";
        },

        showTotalMoney(total){
            document.querySelector(".total").innerText = total;
        },

        clearInputState(){
            document.querySelector("#name").value = "";
            document.querySelector("#money").value = "";
        },

        clearEditState(){
            document.querySelector(".add-btn").style.display = "inline";
            document.querySelector(".update-btn").style.display = "none";
            document.querySelector(".delete-btn").style.display = "none";
            document.querySelector(".back-btn").style.display = "none";
        },

        showEditState(){
            document.querySelector(".add-btn").style.display = "none";
            document.querySelector(".update-btn").style.display = "inline";
            document.querySelector(".delete-btn").style.display = "inline";
            document.querySelector(".back-btn").style.display = "inline";
        },

        addItemToForm(){
            const current = itemCtrl.getCurrentItem();
            document.querySelector("#name").value = current.name;
            document.querySelector("#money").value = current.money;
        }

    };

})();


// ---------------------------------------------------------
// APP CONTROLLER
// ---------------------------------------------------------
const App = (function(){

    const loadEventListeners = function(){

        document.querySelector(".add-btn").addEventListener("click", itemAddSubmit);
        document.querySelector("#item-list").addEventListener("click", itemEditClick);
        document.querySelector(".update-btn").addEventListener("click", itemUpdateSubmit);
        document.querySelector(".delete-btn").addEventListener("click", itemDeleteSubmit);
        document.querySelector(".back-btn").addEventListener("click", UICtrl.clearEditState);

        document.querySelector(".clear-btn").addEventListener("click", clearAllItems);
    };


    const itemAddSubmit = async function(e){
        e.preventDefault();

        const input = UICtrl.getItemInput();

        if(input.name === "" || input.money === ""){
            alert("Please fill the fields");
            return;
        }

        const newItem = await itemCtrl.addItem(input.name, input.money);

        UICtrl.addListItem(newItem);

        UICtrl.showTotalMoney(itemCtrl.getTotalMoney());

        UICtrl.clearInputState();
    };


    const itemEditClick = function(e){
        if(e.target.classList.contains("edit-item")){
            const id = e.target.parentElement.parentElement.id.split("-")[1];
            const item = itemCtrl.getItemByID(id);

            itemCtrl.setCurrentItem(item);

            UICtrl.addItemToForm();
            UICtrl.showEditState();
        }
    };


    const itemUpdateSubmit = async function(e){
        e.preventDefault();

        const input = UICtrl.getItemInput();

        const updated = await itemCtrl.updateItem(input.name, input.money);

        UICtrl.updateListItem(updated);

        UICtrl.showTotalMoney(itemCtrl.getTotalMoney());

        UICtrl.clearInputState();
        UICtrl.clearEditState();
    };


    const itemDeleteSubmit = async function(e){
        e.preventDefault();

        const current = itemCtrl.getCurrentItem();

        await itemCtrl.deleteItem(current.id);

        UICtrl.deleteListItem(current.id);

        UICtrl.showTotalMoney(itemCtrl.getTotalMoney());

        UICtrl.clearInputState();
        UICtrl.clearEditState();
    };


    const clearAllItems = async function(e){
        e.preventDefault();

        await itemCtrl.clearAllItems();

        UICtrl.deleteAllUI();
        UICtrl.showTotalMoney(0);
        UICtrl.clearInputState();
        UICtrl.clearEditState();
    };


    return {
        start: async function(){
            UICtrl.clearEditState();

            await itemCtrl.loadFromAPI();

            const items = itemCtrl.getItem();

            if(items.length > 0){
                UICtrl.populateItemList(items);
                UICtrl.showTotalMoney(itemCtrl.getTotalMoney());
            }

            loadEventListeners();
        }
    };

})();


// START APP
App.start();
