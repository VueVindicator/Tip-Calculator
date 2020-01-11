var TipController = (function(){

	var Tip = function(id, tip, service, share){

		this.id = id;
		this.tip = tip;
		this.service = service;
		this.share = share;
		this.percentage = -1;

	}

	Tip.prototype.calculatePerc = function(total_tip){

		var percentage;

		if(total_tip > 0){
			this.percentage = ((this.tip / total_tip) * 100).toFixed(1);
		}else{
			this.percentage = -1;
		}

	}
	//Functions for handling tips
	var data = {

		allItems : {
			good : [],
			fair : [],
			bad : []
		},
		total_tip : {
			good : 0,
			fair : 0,
			bad : 0
		},
		percentage : -1,
		overall : 0

	}

	var calculateTotal = function(service){
		var obj, sum1 = 0, sum2 = 0;
		var services = ['good', 'fair', 'bad'];

		obj = data.allItems[service];
		obj.forEach(function(current){
			sum1 += current.tip;
		});

		data.total_tip[service] = sum1;

		services.forEach(function(current){
			sum2 += data.total_tip[current];
		});

		data.overall = sum2;

	}

	var calculateTip = function(bill, service, share){

		var tip, percentage;
		
		switch(service) {

			case 'good' : 
				percentage = 0.02;
				break;
			case 'fair' :
				percentage = 0.015;
				break;
			case 'bad' : 
				percentage = 0.005;
				break;
			default :
				percentage = 0;

		}

		tip = (bill * percentage) * (share / 10);
		return tip;
	}

	var calculatePercentage = function(service){

		var total_percentage;

		data.allItems[service].forEach(function(current){
			current.calculatePerc(data.total_tip[service]);
		});
		
	}

	//function for total percentage
	var calculateTotalPercentage = function(value){

		var total_percentage;

		total_percentage = ((data.overall / value) * 100).toFixed(1);

		data.percentage = total_percentage;

	}

	return {

		addTip : function(bill, service, share){

			var ID, newItem, tip, total;
			
			if(data.allItems[service].length > 0){
				ID = data.allItems[service][data.allItems[service].length - 1].id + 1;
			}else{
				ID = 0;
			}

			tip = calculateTip(bill, service, share);
			newItem = new Tip(ID, tip, service, share);
			data.allItems[service].push(newItem);

			return {
				newItem : newItem,
				tip : tip
			};

		},

		return_tip : function(bill, service, share){

			return calculateTip(bill, service, share);

		},

		important : function(service, value){

			calculateTotal(service);
			calculatePercentage(service);
			calculateTotalPercentage(value.total_expenses);

		},

		getValues : function(){

			return {

				overall : data.overall,
				percentage : data.percentage

			}
		},

		deleteItem : function(item_id, item_service){

			var ids;

			ids = data.allItems[item_service].map(function(current){
				return current.id;
			});

			index = ids.indexOf(item_id);

			if(index !== -1){
				data.allItems[item_service].splice(index, 1)
			}

		},

		testing : function(){

			console.log(data);

		}

	}

}());

var AccountController = (function(){

	var data = {

		total_expenses : 0,
		total_account_balance : 12000000

	}
	
	return {

		total_amount : function(bill){

			data.total_expenses += bill;

		},

		updateBill : function(tip){
			console.log(tip);
			data.total_account_balance = data.total_account_balance - (data.total_expenses + tip);

		},

		return_data : function(){

			return data;

		}

	}

}());

var UIController = (function(){

	var DOMStrings = {

		calculate : '.calculate',
		bill : '.bill',
		service : '.service',
		share : '.share',
		tip : '.tip__list',
		total_tips : '.total_tips',
		total_bills : '.total_bills',
		total_expenses : '.total_expenses',
		tips_percentage : '.tips_percentage',
		container : '.container-fluid',
		total_account_balance : '.total_account_balance',
		alert : '.alert'

	}

	var formatNumber = function(num){

		var int, num, dec, value_split;

		num = Math.abs(num);
		num = num.toFixed(2);
		num_split = num.split('.');
		int = num_split[0];
		dec = num_split[1];
		int_val = int.length-3;
		//console.log(int);

		if(int.length > 3 && int.length <= 6){
			int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, int.length);
		}else if(int.length > 6 && int.length <= 9){
			int = int.substr(0, int.length-6) + ',' + int.substr(int.length-6, int.length-int_val) + ',' + int.substr(int.length-3, int.length);
		}else if(int.length > 9){
			int = int.substr(0, int.length-9) + ',' + int.substr(int.length-9, int.length-int_val) + ',' + int.substr(int.length-6, int.length-int_val) + ',' + int.substr(int.length-3, int.length);
		}

		return '$' + int + '.' + dec;

	}

	return {

		getInput : function(){

			return {

				bill : parseFloat(document.querySelector(DOMStrings.bill).value),
				service : document.querySelector(DOMStrings.service).value,
				share : parseFloat(document.querySelector(DOMStrings.share).value)

			}

		},

		displayValues : function(obj, data){

			document.querySelector(DOMStrings.total_tips).textContent = formatNumber(obj.overall);//formatNmber
			document.querySelector(DOMStrings.total_bills).textContent = formatNumber(data.total_expenses);
			document.querySelector(DOMStrings.total_expenses).textContent = formatNumber(data.total_expenses + obj.overall);
			document.querySelector(DOMStrings.total_account_balance).textContent = formatNumber(data.total_account_balance);

			if(obj.percentage > 0){

				document.querySelector(DOMStrings.tips_percentage).textContent = obj.percentage + '%';

			}else{

				document.querySelector(DOMStrings.tips_percentage).textContent = '---';

			}
		},

		//delete item from view

		addItem : function(obj){

			var html, element;

			element = DOMStrings.tip;
			html = '<div class="item clearfix" id="%tip%-%id%"><div class="item__description">%tip%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%tip%', obj.service);
			newHtml = newHtml.replace('%tip%', obj.service.substr(0, 1).toUpperCase() + obj.service.substr(1, obj.service.length));
			newHtml = newHtml.replace('%value%', formatNumber(obj.tip));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteItem : function(selectorID){

			var element = document.getElementById(selectorID)
			element.parentNode.removeChild(element);
			console.log(element);

		},

		clearFields : function(){

			var fields, fieldsArray;

			fields = document.querySelectorAll(DOMStrings.bill + ', ' + DOMStrings.service + ', ' + DOMStrings.share);
			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(current, index, array){
				current.value = '';
			});

			fieldsArray[0].focus();

		},

		getDOMStrings : function(){

			return DOMStrings;

		}

	}

}());

var AppController = (function(tipctrl, acctctrl, uictrl){

	var DOM = uictrl.getDOMStrings();

	var setupEventListeners = function(){

		document.querySelector(DOM.calculate).addEventListener('click', addItem);

		document.querySelector(DOM.container).addEventListener('click',  deleteItem);

	}

	var valid = function(bill, service){

			var total_value, display;

			acctctrl.total_amount(bill);
			total_value = acctctrl.return_data();
			tipctrl.important(service, total_value);
			display = tipctrl.getValues();
			acctctrl.updateBill(display.overall);
			uictrl.displayValues(display, total_value);
		    uictrl.clearFields();

	}

	var addItem = function(){

		var Input, account_status, account, tip;

		Input = uictrl.getInput();

		account = acctctrl.return_data();

		//console.log(account_status_display);

		if(Input.bill !== '' && Input.bill > 0 && !isNaN(Input.bill) && Input.share !== ''){

			tip = tipctrl.return_tip(Input.bill, Input.service, Input.share);

			account_status = account.total_account_balance - (tip + Input.bill);

			if(account_status >= 0){

				document.querySelector(DOM.alert).textContent = '';
				value = tipctrl.addTip(Input.bill, Input.service, Input.share);
				uictrl.addItem(value.newItem);
				valid(Input.bill, Input.service);

			}else{

				document.querySelector(DOM.alert).textContent = 'Insufficient funds for transaction';

			}

			if(account.total_account_balance == 0) document.querySelector(DOM.alert).textContent = 'Your account is empty';

		}
		
	}

	var deleteItem = function(event){

		var item_id;

		item_id = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(item_id){

			item_split = item_id.split('-');
			item_id = item_split[1];
			item_service = item_split[0];

			tipctrl.deleteItem(item_id, item_service);
			uictrl.deleteItem(item_id);
			total_value = acctctrl.return_data().total_expenses;
			tipctrl.important(item_service, total_value);

		}

	}

	return {

		init : function(){

			console.log('Application started');
			tipctrl.testing();
			setupEventListeners();
			uictrl.displayValues({
				overall : 0,
				percentage : 0
			},
			{
				total_expenses : 0,
				total_account_balance : acctctrl.return_data().total_account_balance
			}
			)
			document.querySelector(DOM.bill).focus();

		}

	}
}(TipController, AccountController, UIController));

AppController.init();