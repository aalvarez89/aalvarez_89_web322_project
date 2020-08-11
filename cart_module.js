var storeCart = [];

module.exports.addItem = (inItem)=>{
    console.log("Adding cart" + inItem.name);
    return new Promise((resolve,reject)=>{
        storeCart.push(inItem);
        resolve(storeCart.length);
    });
}

module.exports.removeItem = (inItem)=>{
    return new Promise((resolve,reject)=>{
        for(var i = 0; i< storeCart.length; i++){
            if(storeCart[i].name == inItem){
                storeCart.splice(i,1);
                i = storeCart.length;
            }
        }
        resolve();
    });
}

module.exports.getCart = ()=>{
    return new Promise((resolve, reject)=>{
            resolve(storeCart);
    });
}

module.exports.checkout = ()=>{
    return new Promise((resolve, reject)=>{
        var price=0;
        if(storeCart){
            storeCart.forEach(x => {
                price += x.price;
            });
        }
        resolve(price);
    });
}